/**
 * Order Model
 * Manages outbound orders with full status tracking
 * Status flow: pending → picked → packed → shipped → delivered
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String,
  sku: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  pickedQuantity: {
    type: Number,
    default: 0,
  },
  unitPrice: {
    type: Number,
    default: 0,
  },
  binLocation: String,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    customer: {
      name: { type: String, required: true },
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'picking', 'picked', 'packing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    shippingMethod: {
      type: String,
      default: 'standard',
    },
    trackingNumber: String,
    notes: String,
    expectedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
});

orderSchema.index({ status: 1 });
orderSchema.index({ warehouse: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
