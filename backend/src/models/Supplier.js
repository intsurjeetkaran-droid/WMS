/**
 * Supplier Model
 * Manages supplier details and purchase history links
 */

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    category: {
      type: String,
      default: 'General',
    },
    paymentTerms: {
      type: String,
      default: 'Net 30',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: String,
    taxId: String,
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
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

supplierSchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('Supplier', supplierSchema);
