/**
 * Inbound Controller
 * Manages GRN (Goods Receipt Notes) - receiving goods from suppliers
 * Flow: Create GRN → Receive Items → Verify → Update Inventory
 */

const Inbound = require('../models/Inbound');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { createAuditLog, getRequestMeta } = require('../utils/auditLogger');

const getInbounds = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, supplier, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (supplier) query.supplier = supplier;
    if (search) query.$or = [
      { grnNumber: { $regex: search, $options: 'i' } },
      { purchaseOrderNumber: { $regex: search, $options: 'i' } },
    ];

    const total = await Inbound.countDocuments(query);
    const inbounds = await Inbound.find(query)
      .populate('supplier', 'name code')
      .populate('warehouse', 'name code')
      .populate('receivedBy', 'name')
      .populate('createdBy', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Inbound records fetched.', { inbounds }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getInbound = async (req, res) => {
  try {
    const inbound = await Inbound.findById(req.params.id)
      .populate('supplier', 'name code email phone')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name sku barcode unit')
      .populate('receivedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('createdBy', 'name email');

    if (!inbound) return errorResponse(res, 'Inbound record not found.', 404);
    return successResponse(res, 'Inbound record fetched.', { inbound });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createInbound = async (req, res) => {
  try {
    const inboundData = { ...req.body, createdBy: req.user._id };
    // items is optional at creation time
    if (!inboundData.items) inboundData.items = [];
    const inbound = await Inbound.create(inboundData);

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'CREATE',
      module: 'INBOUND',
      description: `GRN created: ${inbound.grnNumber}`,
      after: { grnNumber: inbound.grnNumber, status: inbound.status },
      ...getRequestMeta(req),
      resourceId: inbound._id.toString(),
    });

    return successResponse(res, 'GRN created.', { inbound }, 201);
  } catch (error) {
    console.error('createInbound error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Receive items - update received quantities and update inventory
 */
const receiveItems = async (req, res) => {
  try {
    const { items } = req.body; // Array of { itemId, receivedQuantity, binLocation, batchNumber, expiryDate }
    const inbound = await Inbound.findById(req.params.id);
    if (!inbound) return errorResponse(res, 'Inbound record not found.', 404);

    if (!['pending', 'receiving'].includes(inbound.status)) {
      return errorResponse(res, 'Cannot receive items for this GRN status.', 400);
    }

    inbound.status = 'receiving';
    inbound.receivedBy = req.user._id;
    inbound.receivedDate = new Date();

    for (const receivedItem of items) {
      const item = inbound.items.id(receivedItem.itemId);
      if (!item) continue;

      item.receivedQuantity = receivedItem.receivedQuantity;
      item.binLocation = receivedItem.binLocation || '';
      item.batchNumber = receivedItem.batchNumber || '';
      if (receivedItem.expiryDate) item.expiryDate = new Date(receivedItem.expiryDate);

      if (item.receivedQuantity >= item.expectedQuantity) {
        item.status = 'received';
      } else if (item.receivedQuantity > 0) {
        item.status = 'partial';
      }

      // Update inventory
      if (item.receivedQuantity > 0) {
        let inventory = await Inventory.findOne({
          product: item.product,
          warehouse: inbound.warehouse,
          binLocation: item.binLocation,
        });

        const stockBefore = inventory ? inventory.quantity : 0;

        if (!inventory) {
          inventory = await Inventory.create({
            product: item.product,
            warehouse: inbound.warehouse,
            binLocation: item.binLocation,
            quantity: item.receivedQuantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            costPrice: item.unitCost || 0,
            lastUpdatedBy: req.user._id,
          });
        } else {
          inventory.quantity += item.receivedQuantity;
          inventory.lastUpdatedBy = req.user._id;
          await inventory.save();
        }

        // Record stock movement
        await StockMovement.create({
          product: item.product,
          warehouse: inbound.warehouse,
          type: 'inbound',
          quantity: item.receivedQuantity,
          toLocation: item.binLocation,
          referenceType: 'GRN',
          referenceId: inbound._id.toString(),
          referenceNumber: inbound.grnNumber,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          unitCost: item.unitCost || 0,
          totalCost: (item.unitCost || 0) * item.receivedQuantity,
          stockBefore,
          stockAfter: inventory.quantity,
          performedBy: req.user._id,
        });

        // Check expiry alert
        if (item.expiryDate) {
          const daysToExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          if (daysToExpiry <= 30) {
            const product = await Product.findById(item.product);
            await Notification.create({
              title: 'Expiry Warning',
              message: `${product?.name} batch ${item.batchNumber} expires in ${daysToExpiry} days.`,
              type: 'expiry_warning',
              severity: daysToExpiry <= 7 ? 'error' : 'warning',
              isGlobal: true,
              relatedModule: 'INVENTORY',
              relatedId: item.product.toString(),
            });
          }
        }
      }
    }

    // Check if all items received
    const allReceived = inbound.items.every((item) => item.status === 'received');
    if (allReceived) inbound.status = 'received';

    await inbound.save();

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'RECEIVE',
      module: 'INBOUND',
      description: `Items received for GRN: ${inbound.grnNumber}`,
      ...getRequestMeta(req),
      resourceId: inbound._id.toString(),
    });

    return successResponse(res, 'Items received and inventory updated.', { inbound });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Verify GRN
 */
const verifyInbound = async (req, res) => {
  try {
    const inbound = await Inbound.findById(req.params.id);
    if (!inbound) return errorResponse(res, 'Inbound record not found.', 404);

    inbound.status = 'verified';
    inbound.verifiedBy = req.user._id;
    inbound.verifiedDate = new Date();
    await inbound.save();

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'APPROVE',
      module: 'INBOUND',
      description: `GRN verified: ${inbound.grnNumber}`,
      ...getRequestMeta(req),
      resourceId: inbound._id.toString(),
    });

    return successResponse(res, 'GRN verified.', { inbound });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getInbounds, getInbound, createInbound, receiveItems, verifyInbound };
