/**
 * Inventory Controller
 * Manages real-time stock levels, adjustments, and transfers
 */

const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { createAuditLog, getRequestMeta } = require('../utils/auditLogger');

/**
 * @desc    Get all inventory
 * @route   GET /api/inventory
 * @access  Private
 */
const getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, warehouse, product, status, lowStock } = req.query;
    const query = {};

    if (warehouse) query.warehouse = warehouse;
    if (product) query.product = product;
    if (status) query.status = status;
    if (lowStock === 'true') {
      // Will be filtered after population
    }

    const total = await Inventory.countDocuments(query);
    let inventoryQuery = Inventory.find(query)
      .populate('product', 'name sku barcode category unit minStockLevel')
      .populate('warehouse', 'name code')
      .populate('lastUpdatedBy', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ updatedAt: -1 });

    let inventory = await inventoryQuery;

    // Filter low stock after population
    if (lowStock === 'true') {
      inventory = inventory.filter(
        (item) => item.product && item.quantity <= item.product.minStockLevel
      );
    }

    return paginatedResponse(res, 'Inventory fetched.', { inventory }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get inventory summary (dashboard stats)
 * @route   GET /api/inventory/summary
 * @access  Private
 */
const getInventorySummary = async (req, res) => {
  try {
    const { warehouse } = req.query;
    const mongoose = require('mongoose');
    const matchQuery = warehouse ? { warehouse: new mongoose.Types.ObjectId(warehouse) } : {};

    const summary = await Inventory.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalAvailable: { $sum: '$availableQuantity' },
          totalReserved: { $sum: '$reservedQuantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
        },
      },
    ]);

    // Low stock count
    const allInventory = await Inventory.find(matchQuery).populate('product', 'minStockLevel');
    const lowStockCount = allInventory.filter(
      (item) => item.product && item.quantity <= item.product.minStockLevel
    ).length;

    // Expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoon = await Inventory.countDocuments({
      ...matchQuery,
      expiryDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
    });

    return successResponse(res, 'Inventory summary fetched.', {
      summary: summary[0] || {},
      lowStockCount,
      expiringSoon,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Adjust stock (manual adjustment)
 * @route   POST /api/inventory/adjust
 * @access  Private (inventory_manager+)
 */
const adjustStock = async (req, res) => {
  try {
    const { productId, warehouseId, binLocation, quantity, reason, type = 'adjustment' } = req.body;

    let inventory = await Inventory.findOne({ product: productId, warehouse: warehouseId, binLocation });

    const stockBefore = inventory ? inventory.quantity : 0;

    if (!inventory) {
      inventory = await Inventory.create({
        product: productId,
        warehouse: warehouseId,
        binLocation: binLocation || '',
        quantity: Math.max(0, quantity),
        lastUpdatedBy: req.user._id,
      });
    } else {
      inventory.quantity = Math.max(0, inventory.quantity + quantity);
      inventory.lastUpdatedBy = req.user._id;
      await inventory.save();
    }

    const stockAfter = inventory.quantity;

    // Record stock movement
    await StockMovement.create({
      product: productId,
      warehouse: warehouseId,
      type,
      quantity,
      fromLocation: binLocation,
      toLocation: binLocation,
      referenceType: 'ADJUSTMENT',
      reason,
      stockBefore,
      stockAfter,
      performedBy: req.user._id,
    });

    // Check low stock alert
    const product = await Product.findById(productId);
    if (product && stockAfter <= product.minStockLevel) {
      await Notification.create({
        title: 'Low Stock Alert',
        message: `${product.name} (${product.sku}) stock is low: ${stockAfter} units remaining.`,
        type: 'low_stock',
        severity: 'warning',
        isGlobal: true,
        relatedModule: 'INVENTORY',
        relatedId: productId,
      });
    }

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'INVENTORY',
      description: `Stock adjusted for ${product?.name}: ${stockBefore} → ${stockAfter} (${quantity > 0 ? '+' : ''}${quantity})`,
      before: { quantity: stockBefore },
      after: { quantity: stockAfter },
      ...getRequestMeta(req),
      resourceId: productId,
    });

    return successResponse(res, 'Stock adjusted successfully.', { inventory });
  } catch (error) {
    console.error('adjustStock error:', error.message);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Transfer stock between bins/warehouses
 * @route   POST /api/inventory/transfer
 * @access  Private (inventory_manager+)
 */
const transferStock = async (req, res) => {
  try {
    const { productId, fromWarehouse, toWarehouse, fromBin, toBin, quantity, reason } = req.body;

    // Check source inventory
    const sourceInventory = await Inventory.findOne({
      product: productId,
      warehouse: fromWarehouse,
      binLocation: fromBin,
    });

    if (!sourceInventory || sourceInventory.availableQuantity < quantity) {
      return errorResponse(res, 'Insufficient stock for transfer.', 400);
    }

    // Deduct from source
    const stockBefore = sourceInventory.quantity;
    sourceInventory.quantity -= quantity;
    sourceInventory.lastUpdatedBy = req.user._id;
    await sourceInventory.save();

    // Add to destination
    let destInventory = await Inventory.findOne({
      product: productId,
      warehouse: toWarehouse,
      binLocation: toBin,
    });

    if (!destInventory) {
      destInventory = await Inventory.create({
        product: productId,
        warehouse: toWarehouse,
        binLocation: toBin || '',
        quantity,
        lastUpdatedBy: req.user._id,
      });
    } else {
      destInventory.quantity += quantity;
      destInventory.lastUpdatedBy = req.user._id;
      await destInventory.save();
    }

    // Record movement
    await StockMovement.create({
      product: productId,
      warehouse: fromWarehouse,
      type: 'transfer',
      quantity,
      fromLocation: fromBin,
      toLocation: toBin,
      fromBin,
      toBin,
      referenceType: 'TRANSFER',
      reason,
      stockBefore,
      stockAfter: sourceInventory.quantity,
      performedBy: req.user._id,
    });

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'TRANSFER',
      module: 'INVENTORY',
      description: `Stock transferred: ${quantity} units from ${fromBin} to ${toBin}`,
      before: { fromBin, quantity: stockBefore },
      after: { toBin, quantity },
      ...getRequestMeta(req),
      resourceId: productId,
    });

    return successResponse(res, 'Stock transferred successfully.', {
      source: sourceInventory,
      destination: destInventory,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get stock movements for a product
 * @route   GET /api/inventory/movements
 * @access  Private
 */
const getStockMovements = async (req, res) => {
  try {
    const { page = 1, limit = 20, product, warehouse, type, startDate, endDate } = req.query;
    const query = {};

    if (product) query.product = product;
    if (warehouse) query.warehouse = warehouse;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await StockMovement.countDocuments(query);
    const movements = await StockMovement.find(query)
      .populate('product', 'name sku')
      .populate('warehouse', 'name code')
      .populate('performedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Stock movements fetched.', { movements }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getInventory, getInventorySummary, adjustStock, transferStock, getStockMovements };
