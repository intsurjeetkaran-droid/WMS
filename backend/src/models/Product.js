/**
 * Product Model
 * Core product catalog with SKU, barcode, category, supplier link
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    qrCode: {
      type: String, // Base64 or URL of generated QR
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    unit: {
      type: String,
      enum: ['piece', 'kg', 'liter', 'box', 'pallet', 'meter', 'set'],
      default: 'piece',
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    images: [
      {
        type: String, // Image URLs
      },
    ],
    minStockLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    maxStockLevel: {
      type: Number,
      default: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
productSchema.index({ name: 'text', sku: 'text', category: 'text', barcode: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });

module.exports = mongoose.model('Product', productSchema);
