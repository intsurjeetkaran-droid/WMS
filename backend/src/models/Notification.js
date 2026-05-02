/**
 * Notification Model
 * Stores alerts: low stock, expiry warnings, delayed orders
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['low_stock', 'expiry_warning', 'order_delayed', 'order_status', 'system', 'info', 'warning', 'error'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isGlobal: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    relatedModule: String,
    relatedId: String,
    actionUrl: String,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
