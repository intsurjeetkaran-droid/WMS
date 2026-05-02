/**
 * Audit Logger Utility
 * Central function to log all critical actions
 * Used across all controllers for consistent logging
 */

const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {Object} params - Log parameters
 * @param {string} params.userId - User performing the action
 * @param {string} params.userName - User's name
 * @param {string} params.action - Action performed (CREATE, UPDATE, etc.)
 * @param {string} params.module - Module affected
 * @param {string} params.description - Human-readable description
 * @param {Object} params.before - State before change
 * @param {Object} params.after - State after change
 * @param {string} params.ipAddress - Client IP
 * @param {string} params.userAgent - Client user agent
 * @param {string} params.resourceId - ID of affected resource
 * @param {string} params.status - SUCCESS or FAILED
 */
const createAuditLog = async (params) => {
  try {
    await AuditLog.create({
      user: params.userId,
      userName: params.userName || 'System',
      action: params.action,
      module: params.module,
      description: params.description,
      before: params.before || null,
      after: params.after || null,
      ipAddress: params.ipAddress || '',
      userAgent: params.userAgent || '',
      resourceId: params.resourceId || '',
      status: params.status || 'SUCCESS',
    });
  } catch (error) {
    // Log error but don't break the main flow
    console.error('❌ Audit log creation failed:', error.message);
  }
};

/**
 * Extract request metadata for logging
 * @param {Object} req - Express request object
 */
const getRequestMeta = (req) => ({
  ipAddress: req.ip || req.connection?.remoteAddress || '',
  userAgent: req.headers['user-agent'] || '',
});

module.exports = { createAuditLog, getRequestMeta };
