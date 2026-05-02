/**
 * Audit Log Controller
 * Read-only access to audit logs
 * Critical for compliance and interview demonstration
 */

const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, user, action, module, startDate, endDate, status } = req.query;
    const query = {};

    if (user) query.user = user;
    if (action) query.action = action;
    if (module) query.module = module;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Audit logs fetched.', { logs }, {
      total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('user', 'name email role');
    if (!log) return errorResponse(res, 'Log not found.', 404);
    return successResponse(res, 'Log fetched.', { log });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get audit log stats
const getAuditStats = async (req, res) => {
  try {
    const stats = await AuditLog.aggregate([
      {
        $facet: {
          byModule: [{ $group: { _id: '$module', count: { $sum: 1 } } }],
          byAction: [{ $group: { _id: '$action', count: { $sum: 1 } } }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          recentActivity: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $project: { userName: 1, action: 1, module: 1, description: 1, createdAt: 1 } },
          ],
        },
      },
    ]);

    return successResponse(res, 'Audit stats fetched.', { stats: stats[0] });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getAuditLogs, getAuditLog, getAuditStats };
