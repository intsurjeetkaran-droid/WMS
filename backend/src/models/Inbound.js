/**
 * Inbound / GRN (Goods Receipt Note) Model
 * Flow: Supplier → Receive → Verify → Assign Bin → Stock Update
 */

const mongoose = require('mongoose');

const inboundItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String,
  sku: String,
  expectedQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  receivedQuantity: {
    type: Number,
    default: 0,
  },
  damagedQuantity: {
    type: Number,
    default: 0,
  },
  binLocation: String,
  batchNumber: String,
  expiryDate: Date,
  unitCost: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'partial', 'damaged', 'rejected'],
    default: 'pending',
  },
});

const inboundSchema = new mongoose.Schema(
  {
    grnNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    items: [inboundItemSchema],
    status: {
      type: String,
      enum: ['draft', 'pending', 'receiving', 'received', 'verified', 'completed', 'cancelled'],
      default: 'draft',
    },
    purchaseOrderNumber: String,
    invoiceNumber: String,
    invoiceDate: Date,
    expectedDate: Date,
    receivedDate: Date,
    verifiedDate: Date,
    notes: String,
    totalItems: {
      type: Number,
      default: 0,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

// Auto-generate GRN number
inboundSchema.pre('save', async function (next) {
  if (!this.grnNumber) {
    const count = await this.constructor.countDocuments();
    this.grnNumber = `GRN-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
});

inboundSchema.index({ supplier: 1 });
inboundSchema.index({ status: 1 });
inboundSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inbound', inboundSchema);
