/**
 * Inventory Model
 * Tracks real-time stock levels per product per bin location
 * Supports batch tracking and expiry dates
 */

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
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
    zone: {
      type: String,
      default: '',
    },
    rack: {
      type: String,
      default: '',
    },
    shelf: {
      type: String,
      default: '',
    },
    bin: {
      type: String,
      default: '',
    },
    binLocation: {
      type: String, // Full path: Zone-Rack-Shelf-Bin
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    batchNumber: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'damaged', 'expired', 'quarantine'],
      default: 'available',
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate available quantity before save
inventorySchema.pre('save', function () {
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
});

// Compound index for unique product-warehouse-bin combination
inventorySchema.index({ product: 1, warehouse: 1, binLocation: 1 }, { unique: true, sparse: true });
inventorySchema.index({ product: 1 });
inventorySchema.index({ warehouse: 1 });
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ status: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
