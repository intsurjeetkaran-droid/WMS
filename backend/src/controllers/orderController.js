/**
 * Order Controller
 * Manages outbound orders: create, status updates, pick list, shipping
 */

const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { createAuditLog, getRequestMeta } = require('../utils/auditLogger');

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
    ];
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('warehouse', 'name code')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('items.product', 'name sku')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Orders fetched.', { orders }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('warehouse', 'name code')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('items.product', 'name sku barcode unit')
      .populate('statusHistory.changedBy', 'name');

    if (!order) return errorResponse(res, 'Order not found.', 404);
    return successResponse(res, 'Order fetched.', { order });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      createdBy: req.user._id,
      statusHistory: [{
        status: req.body.status || 'pending',
        changedBy: req.user._id,
        note: 'Order created',
      }],
    };
    const order = await Order.create(orderData);

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'CREATE',
      module: 'ORDER',
      description: `Order created: ${order.orderNumber} for ${order.customer?.name}`,
      after: { orderNumber: order.orderNumber, status: order.status },
      ...getRequestMeta(req),
      resourceId: order._id.toString(),
    });

    return successResponse(res, 'Order created.', { order }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found.', 404);

    const prevStatus = order.status;
    order.status = status;

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelReason = note;
    }

    order.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status changed to ${status}`,
    });

    await order.save();

    // If shipped, deduct inventory
    if (status === 'shipped' && prevStatus !== 'shipped') {
      for (const item of order.items) {
        const inventory = await Inventory.findOne({
          product: item.product,
          warehouse: order.warehouse,
        });

        if (inventory) {
          const stockBefore = inventory.quantity;
          inventory.quantity = Math.max(0, inventory.quantity - item.quantity);
          inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - item.quantity);
          await inventory.save();

          await StockMovement.create({
            product: item.product,
            warehouse: order.warehouse,
            type: 'outbound',
            quantity: -item.quantity,
            referenceType: 'ORDER',
            referenceId: order._id.toString(),
            referenceNumber: order.orderNumber,
            stockBefore,
            stockAfter: inventory.quantity,
            performedBy: req.user._id,
          });
        }
      }
    }

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'ORDER',
      description: `Order ${order.orderNumber} status: ${prevStatus} → ${status}`,
      before: { status: prevStatus },
      after: { status },
      ...getRequestMeta(req),
      resourceId: order._id.toString(),
    });

    return successResponse(res, 'Order status updated.', { order });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found.', 404);
    if (!['pending', 'cancelled'].includes(order.status)) {
      return errorResponse(res, 'Only pending or cancelled orders can be deleted.', 400);
    }

    await order.deleteOne();

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'DELETE',
      module: 'ORDER',
      description: `Order deleted: ${order.orderNumber}`,
      ...getRequestMeta(req),
      resourceId: order._id.toString(),
    });

    return successResponse(res, 'Order deleted.');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get order stats for dashboard
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          todayOrders: [
            { $match: { createdAt: { $gte: today } } },
            { $count: 'count' },
          ],
          totalRevenue: [
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
          ],
        },
      },
    ]);

    return successResponse(res, 'Order stats fetched.', { stats: stats[0] });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder, getOrderStats };
