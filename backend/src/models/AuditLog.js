/**
 * Audit Log Model
 * Tracks every critical action in the system
 * Fields: user, action, module, timestamp, before, after
 * CRITICAL for interview-level system
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
        'APPROVE', 'REJECT', 'TRANSFER', 'RECEIVE', 'SHIP',
        'SCAN', 'EXPORT', 'IMPORT', 'SETTINGS_CHANGE'
      ],
    },
    module: {
      type: String,
      required: true,
      enum: [
        'AUTH', 'USER', 'PRODUCT', 'INVENTORY', 'WAREHOUSE',
        'INBOUND', 'OUTBOUND', 'ORDER', 'SUPPLIER',
        'STOCK_MOVEMENT', 'REPORT', 'SETTINGS', 'NOTIFICATION'
      ],
    },
    description: {
      type: String,
      required: true,
    },
    before: {
      type: mongoose.Schema.Types.Mixed, // State before change
      default: null,
    },
    after: {
      type: mongoose.Schema.Types.Mixed, // State after change
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    resourceId: {
      type: String, // ID of the affected resource
      default: '',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
