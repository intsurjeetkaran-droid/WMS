/**
 * Stock Movement Model
 * Tracks every stock change: inbound, outbound, transfer, adjustment
 * Full audit trail for inventory
 */

const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    type: {
      type: String,
      enum: ['inbound', 'outbound', 'transfer', 'adjustment', 'return', 'damage', 'expired'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    fromLocation: {
      type: String,
      default: '',
    },
    toLocation: {
      type: String,
      default: '',
    },
    fromBin: String,
    toBin: String,
    referenceType: {
      type: String,
      enum: ['GRN', 'ORDER', 'TRANSFER', 'ADJUSTMENT', 'RETURN', null],
      default: null,
    },
    referenceId: {
      type: String,
      default: '',
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    batchNumber: String,
    expiryDate: Date,
    unitCost: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    stockBefore: {
      type: Number,
      default: 0,
    },
    stockAfter: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ warehouse: 1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ referenceId: 1 });
stockMovementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
