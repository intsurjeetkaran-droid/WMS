/**
 * Reports Controller
 * Inventory reports, order analytics, movement reports
 * Dashboard stats aggregation
 */

const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Inbound = require('../models/Inbound');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Dashboard summary stats
 * @route   GET /api/reports/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Run all queries in parallel for performance
    const [
      totalProducts,
      totalOrders,
      todayOrders,
      pendingOrders,
      allInventory,
      recentMovements,
      ordersByStatus,
      monthlyOrders,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'picking'] } }),
      Inventory.find().populate('product', 'minStockLevel name sku'),
      StockMovement.find({ createdAt: { $gte: thirtyDaysAgo } })
        .populate('product', 'name sku')
        .sort({ createdAt: -1 })
        .limit(10),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Calculate inventory stats
    const totalStock = allInventory.reduce((sum, i) => sum + i.quantity, 0);
    const lowStockItems = allInventory.filter(
      (i) => i.product && i.quantity <= i.product.minStockLevel
    );
    const expiringSoon = allInventory.filter(
      (i) => i.expiryDate && i.expiryDate <= thirtyDaysFromNow && i.expiryDate >= today
    );

    return successResponse(res, 'Dashboard stats fetched.', {
      stats: {
        totalProducts,
        totalOrders,
        todayOrders,
        pendingOrders,
        totalStock,
        lowStockCount: lowStockItems.length,
        expiringSoonCount: expiringSoon.length,
        totalInventoryItems: allInventory.length,
      },
      ordersByStatus,
      monthlyOrders,
      recentMovements,
      lowStockItems: lowStockItems.slice(0, 5).map((i) => ({
        product: i.product,
        quantity: i.quantity,
        binLocation: i.binLocation,
      })),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Inventory report
 * @route   GET /api/reports/inventory
 */
const getInventoryReport = async (req, res) => {
  try {
    const { warehouse, category, startDate, endDate } = req.query;
    const mongoose = require('mongoose');
    const matchQuery = {};
    if (warehouse) matchQuery.warehouse = new mongoose.Types.ObjectId(warehouse);

    const report = await Inventory.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      ...(category ? [{ $match: { 'productInfo.category': category } }] : []),
      {
        $group: {
          _id: '$productInfo.category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$costPrice'] } },
          products: {
            $push: {
              name: '$productInfo.name',
              sku: '$productInfo.sku',
              quantity: '$quantity',
              available: '$availableQuantity',
              reserved: '$reservedQuantity',
              binLocation: '$binLocation',
              value: { $multiply: ['$quantity', '$costPrice'] },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return successResponse(res, 'Inventory report generated.', { report });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Order analytics report
 * @route   GET /api/reports/orders
 */
const getOrderReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const formatMap = { day: '%Y-%m-%d', week: '%Y-%U', month: '%Y-%m' };
    const format = formatMap[groupBy] || '%Y-%m-%d';

    const orderTrend = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const statusBreakdown = await Order.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]);

    return successResponse(res, 'Order report generated.', { orderTrend, statusBreakdown });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Stock movement report
 * @route   GET /api/reports/movements
 */
const getMovementReport = async (req, res) => {
  try {
    const { startDate, endDate, warehouse } = req.query;
    const mongoose = require('mongoose');
    const matchQuery = {};

    if (warehouse) matchQuery.warehouse = new mongoose.Types.ObjectId(warehouse);
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }

    const movementSummary = await StockMovement.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalQuantity: { $sum: { $abs: '$quantity' } },
          totalValue: { $sum: '$totalCost' },
        },
      },
    ]);

    const topMovedProducts = await StockMovement.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$product',
          totalMovements: { $sum: 1 },
          totalQuantity: { $sum: { $abs: '$quantity' } },
        },
      },
      { $sort: { totalMovements: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          'product.name': 1,
          'product.sku': 1,
          totalMovements: 1,
          totalQuantity: 1,
        },
      },
    ]);

    return successResponse(res, 'Movement report generated.', { movementSummary, topMovedProducts });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getDashboardStats, getInventoryReport, getOrderReport, getMovementReport };
