/**
 * Warehouse Model
 * Hierarchical structure: Warehouse → Zone → Rack → Shelf → Bin
 */

const mongoose = require('mongoose');

// Bin Schema
const binSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  capacity: { type: Number, default: 100 },
  currentLoad: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

// Shelf Schema
const shelfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  bins: [binSchema],
  isActive: { type: Boolean, default: true },
});

// Rack Schema
const rackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  shelves: [shelfSchema],
  isActive: { type: Boolean, default: true },
});

// Zone Schema
const zoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  type: {
    type: String,
    enum: ['storage', 'receiving', 'dispatch', 'quarantine', 'cold_storage'],
    default: 'storage',
  },
  racks: [rackSchema],
  isActive: { type: Boolean, default: true },
});

// Main Warehouse Schema
const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Warehouse code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    zones: [zoneSchema],
    totalCapacity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: String,
    email: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

warehouseSchema.index({ manager: 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
