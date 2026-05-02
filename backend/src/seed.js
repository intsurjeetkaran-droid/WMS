/**
 * WMS Pro - Database Seed Script
 * Populates the database with realistic warehouse data
 * Run: node src/seed.js
 *
 * CREDENTIALS AFTER SEEDING:
 * ============================================
 * Super Admin  : admin@wms.com       / Admin@123
 * WH Manager   : manager@wms.com     / Manager@123
 * Inv Manager  : inventory@wms.com   / Inventory@123
 * Staff        : staff@wms.com       / Staff@123
 * Dispatch     : dispatch@wms.com    / Dispatch@123
 * Viewer       : viewer@wms.com      / Viewer@123
 * ============================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Warehouse = require('./models/Warehouse');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const Order = require('./models/Order');
const Inbound = require('./models/Inbound');
const StockMovement = require('./models/StockMovement');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');

const log = (msg) => console.log(`  ${msg}`);
const ok  = (msg) => console.log(`  \u2705 ${msg}`);
const err = (msg) => console.log(`  \u274C ${msg}`);

// ─── USERS ────────────────────────────────────────────────────────────────────
const USERS = [
  { name: 'Alex Morgan',    email: 'admin@wms.com',      password: 'Admin@123',     role: 'super_admin' },
  { name: 'Sarah Johnson',  email: 'manager@wms.com',    password: 'Manager@123',   role: 'warehouse_manager' },
  { name: 'David Chen',     email: 'inventory@wms.com',  password: 'Inventory@123', role: 'inventory_manager' },
  { name: 'Mike Torres',    email: 'staff@wms.com',      password: 'Staff@123',     role: 'staff' },
  { name: 'Lisa Park',      email: 'dispatch@wms.com',   password: 'Dispatch@123',  role: 'dispatch_staff' },
  { name: 'James Wilson',   email: 'viewer@wms.com',     password: 'Viewer@123',    role: 'viewer' },
];

// ─── WAREHOUSES ───────────────────────────────────────────────────────────────
const WAREHOUSES = [
  {
    name: 'Central Distribution Hub',
    code: 'CDH-001',
    address: { street: '1200 Industrial Blvd', city: 'Chicago', state: 'IL', country: 'USA', zipCode: '60601' },
    phone: '+1-312-555-0100',
    email: 'central@wms.com',
    description: 'Main distribution center for the midwest region',
    zones: [
      {
        name: 'Receiving Zone', code: 'RZ', type: 'receiving',
        racks: [
          { name: 'Rack R1', code: 'R1', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 200 },
              { name: 'Bin B2', code: 'B2', capacity: 200 },
            ]},
            { name: 'Shelf S2', code: 'S2', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 150 },
            ]},
          ]},
        ],
      },
      {
        name: 'Storage Zone A', code: 'SZA', type: 'storage',
        racks: [
          { name: 'Rack A1', code: 'A1', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 500 },
              { name: 'Bin B2', code: 'B2', capacity: 500 },
              { name: 'Bin B3', code: 'B3', capacity: 500 },
            ]},
            { name: 'Shelf S2', code: 'S2', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 400 },
              { name: 'Bin B2', code: 'B2', capacity: 400 },
            ]},
          ]},
          { name: 'Rack A2', code: 'A2', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 300 },
              { name: 'Bin B2', code: 'B2', capacity: 300 },
            ]},
          ]},
        ],
      },
      {
        name: 'Storage Zone B', code: 'SZB', type: 'storage',
        racks: [
          { name: 'Rack B1', code: 'B1', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 600 },
              { name: 'Bin B2', code: 'B2', capacity: 600 },
            ]},
          ]},
        ],
      },
      {
        name: 'Dispatch Zone', code: 'DZ', type: 'dispatch',
        racks: [
          { name: 'Rack D1', code: 'D1', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 100 },
              { name: 'Bin B2', code: 'B2', capacity: 100 },
            ]},
          ]},
        ],
      },
      {
        name: 'Cold Storage', code: 'CS', type: 'cold_storage',
        racks: [
          { name: 'Rack C1', code: 'C1', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 200 },
            ]},
          ]},
        ],
      },
    ],
  },
  {
    name: 'East Coast Fulfillment',
    code: 'ECF-002',
    address: { street: '450 Harbor Drive', city: 'New York', state: 'NY', country: 'USA', zipCode: '10001' },
    phone: '+1-212-555-0200',
    email: 'eastcoast@wms.com',
    description: 'East coast fulfillment and distribution center',
    zones: [
      {
        name: 'Main Storage', code: 'MS', type: 'storage',
        racks: [
          { name: 'Rack M1', code: 'M1', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 400 },
              { name: 'Bin B2', code: 'B2', capacity: 400 },
            ]},
          ]},
        ],
      },
      {
        name: 'Quarantine Zone', code: 'QZ', type: 'quarantine',
        racks: [
          { name: 'Rack Q1', code: 'Q1', shelves: [
            { name: 'Shelf S1', code: 'S1', bins: [
              { name: 'Bin B1', code: 'B1', capacity: 100 },
            ]},
          ]},
        ],
      },
    ],
  },
];

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────
const SUPPLIERS = [
  {
    name: 'TechParts Global',
    code: 'SUP-001',
    contactPerson: 'Robert Kim',
    email: 'robert@techparts.com',
    phone: '+1-408-555-0301',
    category: 'Electronics',
    paymentTerms: 'Net 30',
    rating: 5,
    address: { city: 'San Jose', state: 'CA', country: 'USA' },
    notes: 'Premium electronics supplier. Fast delivery, excellent quality.',
  },
  {
    name: 'Industrial Supply Co.',
    code: 'SUP-002',
    contactPerson: 'Maria Garcia',
    email: 'maria@industrialsupply.com',
    phone: '+1-713-555-0302',
    category: 'Hardware',
    paymentTerms: 'Net 45',
    rating: 4,
    address: { city: 'Houston', state: 'TX', country: 'USA' },
    notes: 'Reliable hardware and industrial components supplier.',
  },
  {
    name: 'FreshFoods Distribution',
    code: 'SUP-003',
    contactPerson: 'Emily Watson',
    email: 'emily@freshfoods.com',
    phone: '+1-305-555-0303',
    category: 'Food & Beverage',
    paymentTerms: 'Net 15',
    rating: 4,
    address: { city: 'Miami', state: 'FL', country: 'USA' },
    notes: 'Perishable goods supplier. Requires cold chain management.',
  },
  {
    name: 'SafetyFirst Equipment',
    code: 'SUP-004',
    contactPerson: 'Tom Bradley',
    email: 'tom@safetyfirst.com',
    phone: '+1-206-555-0304',
    category: 'Safety Equipment',
    paymentTerms: 'Net 30',
    rating: 5,
    address: { city: 'Seattle', state: 'WA', country: 'USA' },
    notes: 'Certified safety equipment. All products meet OSHA standards.',
  },
  {
    name: 'PackagePro Solutions',
    code: 'SUP-005',
    contactPerson: 'Nancy Lee',
    email: 'nancy@packagepro.com',
    phone: '+1-404-555-0305',
    category: 'Packaging',
    paymentTerms: 'Net 30',
    rating: 3,
    address: { city: 'Atlanta', state: 'GA', country: 'USA' },
    notes: 'Packaging materials and solutions.',
  },
];

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const getProducts = (supplierIds) => [
  // Electronics
  { name: 'Laptop Dell XPS 15', sku: 'ELEC-001', barcode: '8901234567890', category: 'Electronics', unit: 'piece', unitPrice: 1299.99, minStockLevel: 5, maxStockLevel: 50, weight: 1.8, supplier: supplierIds[0], description: 'High-performance laptop for professionals' },
  { name: 'Wireless Mouse Logitech MX', sku: 'ELEC-002', barcode: '8901234567891', category: 'Electronics', unit: 'piece', unitPrice: 79.99, minStockLevel: 20, maxStockLevel: 200, weight: 0.1, supplier: supplierIds[0], description: 'Ergonomic wireless mouse' },
  { name: 'USB-C Hub 7-Port', sku: 'ELEC-003', barcode: '8901234567892', category: 'Electronics', unit: 'piece', unitPrice: 49.99, minStockLevel: 15, maxStockLevel: 150, weight: 0.2, supplier: supplierIds[0], description: '7-port USB-C hub with power delivery' },
  { name: 'Monitor 27" 4K IPS', sku: 'ELEC-004', barcode: '8901234567893', category: 'Electronics', unit: 'piece', unitPrice: 449.99, minStockLevel: 5, maxStockLevel: 30, weight: 5.2, supplier: supplierIds[0], description: '27-inch 4K IPS display' },
  { name: 'Mechanical Keyboard RGB', sku: 'ELEC-005', barcode: '8901234567894', category: 'Electronics', unit: 'piece', unitPrice: 129.99, minStockLevel: 10, maxStockLevel: 100, weight: 0.9, supplier: supplierIds[0], description: 'RGB mechanical gaming keyboard' },
  // Hardware
  { name: 'Industrial Bolt M8x50', sku: 'HW-001', barcode: '7801234567890', category: 'Hardware', unit: 'piece', unitPrice: 0.45, minStockLevel: 500, maxStockLevel: 5000, weight: 0.02, supplier: supplierIds[1], description: 'Stainless steel M8x50mm bolt' },
  { name: 'Steel Nut M8', sku: 'HW-002', barcode: '7801234567891', category: 'Hardware', unit: 'piece', unitPrice: 0.15, minStockLevel: 500, maxStockLevel: 5000, weight: 0.01, supplier: supplierIds[1], description: 'Stainless steel M8 hex nut' },
  { name: 'Power Drill 18V', sku: 'HW-003', barcode: '7801234567892', category: 'Hardware', unit: 'piece', unitPrice: 189.99, minStockLevel: 8, maxStockLevel: 50, weight: 1.5, supplier: supplierIds[1], description: '18V cordless power drill with battery' },
  { name: 'Safety Gloves L', sku: 'HW-004', barcode: '7801234567893', category: 'Hardware', unit: 'piece', unitPrice: 12.99, minStockLevel: 50, maxStockLevel: 500, weight: 0.15, supplier: supplierIds[1], description: 'Heavy-duty work gloves size L' },
  { name: 'Steel Wire Rope 10mm', sku: 'HW-005', barcode: '7801234567894', category: 'Hardware', unit: 'meter', unitPrice: 3.50, minStockLevel: 100, maxStockLevel: 1000, weight: 0.5, supplier: supplierIds[1], description: '10mm galvanized steel wire rope' },
  // Food & Beverage
  { name: 'Organic Coffee Beans 1kg', sku: 'FB-001', barcode: '6901234567890', category: 'Food & Beverage', unit: 'kg', unitPrice: 24.99, minStockLevel: 50, maxStockLevel: 500, weight: 1.0, supplier: supplierIds[2], description: 'Premium organic arabica coffee beans' },
  { name: 'Green Tea Premium 500g', sku: 'FB-002', barcode: '6901234567891', category: 'Food & Beverage', unit: 'kg', unitPrice: 18.99, minStockLevel: 30, maxStockLevel: 300, weight: 0.5, supplier: supplierIds[2], description: 'Premium Japanese green tea' },
  { name: 'Mineral Water 500ml x24', sku: 'FB-003', barcode: '6901234567892', category: 'Food & Beverage', unit: 'box', unitPrice: 8.99, minStockLevel: 100, maxStockLevel: 1000, weight: 12.0, supplier: supplierIds[2], description: 'Natural mineral water 24-pack' },
  { name: 'Energy Bar Variety Pack', sku: 'FB-004', barcode: '6901234567893', category: 'Food & Beverage', unit: 'box', unitPrice: 29.99, minStockLevel: 40, maxStockLevel: 400, weight: 1.2, supplier: supplierIds[2], description: 'Assorted energy bars 12-pack' },
  // Safety Equipment
  { name: 'Hard Hat ANSI Z89.1', sku: 'SE-001', barcode: '5901234567890', category: 'Safety Equipment', unit: 'piece', unitPrice: 34.99, minStockLevel: 20, maxStockLevel: 200, weight: 0.4, supplier: supplierIds[3], description: 'ANSI Z89.1 certified hard hat' },
  { name: 'Safety Vest Hi-Vis XL', sku: 'SE-002', barcode: '5901234567891', category: 'Safety Equipment', unit: 'piece', unitPrice: 14.99, minStockLevel: 30, maxStockLevel: 300, weight: 0.2, supplier: supplierIds[3], description: 'High-visibility safety vest XL' },
  { name: 'Fire Extinguisher 5kg', sku: 'SE-003', barcode: '5901234567892', category: 'Safety Equipment', unit: 'piece', unitPrice: 89.99, minStockLevel: 10, maxStockLevel: 50, weight: 7.5, supplier: supplierIds[3], description: 'ABC dry powder fire extinguisher' },
  { name: 'First Aid Kit Standard', sku: 'SE-004', barcode: '5901234567893', category: 'Safety Equipment', unit: 'piece', unitPrice: 45.99, minStockLevel: 15, maxStockLevel: 100, weight: 0.8, supplier: supplierIds[3], description: 'OSHA compliant first aid kit' },
  // Packaging
  { name: 'Cardboard Box 40x30x30', sku: 'PKG-001', barcode: '4901234567890', category: 'Packaging', unit: 'piece', unitPrice: 1.20, minStockLevel: 200, maxStockLevel: 2000, weight: 0.3, supplier: supplierIds[4], description: 'Double-wall cardboard shipping box' },
  { name: 'Bubble Wrap Roll 50m', sku: 'PKG-002', barcode: '4901234567891', category: 'Packaging', unit: 'piece', unitPrice: 15.99, minStockLevel: 30, maxStockLevel: 200, weight: 1.5, supplier: supplierIds[4], description: '50m bubble wrap roll 500mm wide' },
  { name: 'Packing Tape 48mm x 100m', sku: 'PKG-003', barcode: '4901234567892', category: 'Packaging', unit: 'piece', unitPrice: 3.99, minStockLevel: 100, maxStockLevel: 1000, weight: 0.2, supplier: supplierIds[4], description: 'Heavy-duty clear packing tape' },
  { name: 'Stretch Film 500mm x 300m', sku: 'PKG-004', barcode: '4901234567893', category: 'Packaging', unit: 'piece', unitPrice: 12.99, minStockLevel: 50, maxStockLevel: 500, weight: 2.0, supplier: supplierIds[4], description: 'Industrial stretch wrap film' },
];

// ─── INVENTORY LOCATIONS ──────────────────────────────────────────────────────
const getBinPath = (zone, rack, shelf, bin) => `${zone}-${rack}-${shelf}-${bin}`;


// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────
async function seed() {
  try {
    console.log('\n🌱 WMS Pro - Database Seeder');
    console.log('━'.repeat(50));

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── CLEAR EXISTING DATA ──────────────────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Warehouse.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
      Inbound.deleteMany({}),
      StockMovement.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    ok('All collections cleared');

    // ── SEED USERS ───────────────────────────────────────────────────────────
    console.log('\n👥 Seeding users...');
    const createdUsers = [];
    for (const u of USERS) {
      const salt = await bcrypt.genSalt(12);
      const hashed = await bcrypt.hash(u.password, salt);
      const user = await User.create({ ...u, password: hashed });
      createdUsers.push(user);
      ok(`${user.role.padEnd(20)} ${user.email.padEnd(28)} / ${u.password}`);
    }
    const adminUser = createdUsers[0];
    const managerUser = createdUsers[1];
    const staffUser = createdUsers[3];
    const dispatchUser = createdUsers[4];

    // ── SEED WAREHOUSES ──────────────────────────────────────────────────────
    console.log('\n�� Seeding warehouses...');
    const createdWarehouses = [];
    for (let i = 0; i < WAREHOUSES.length; i++) {
      const wh = await Warehouse.create({
        ...WAREHOUSES[i],
        manager: i === 0 ? managerUser._id : adminUser._id,
        totalCapacity: i === 0 ? 50000 : 20000,
      });
      createdWarehouses.push(wh);
      ok(`${wh.name} (${wh.code})`);
    }
    const mainWH = createdWarehouses[0];
    const eastWH = createdWarehouses[1];

    // Update manager's warehouse
    await User.findByIdAndUpdate(managerUser._id, { warehouse: mainWH._id });

    // ── SEED SUPPLIERS ───────────────────────────────────────────────────────
    console.log('\n🚛 Seeding suppliers...');
    const createdSuppliers = [];
    for (const s of SUPPLIERS) {
      const sup = await Supplier.create({ ...s, createdBy: adminUser._id });
      createdSuppliers.push(sup);
      ok(`${sup.name} (${sup.code})`);
    }

    // ── SEED PRODUCTS ────────────────────────────────────────────────────────
    console.log('\n📦 Seeding products...');
    const supplierIds = createdSuppliers.map(s => s._id);
    const productDefs = getProducts(supplierIds);
    const createdProducts = [];
    for (const p of productDefs) {
      const prod = await Product.create({ ...p, createdBy: adminUser._id });
      createdProducts.push(prod);
      ok(`${prod.name} (${prod.sku})`);
    }

    // ── SEED INVENTORY ───────────────────────────────────────────────────────
    console.log('\n📊 Seeding inventory...');
    const inventoryData = [
      // Electronics in CDH-001 Storage Zone A
      { product: createdProducts[0]._id,  warehouse: mainWH._id, binLocation: 'SZA-A1-S1-B1', quantity: 12,   costPrice: 950.00,  batchNumber: 'BATCH-2024-001' },
      { product: createdProducts[1]._id,  warehouse: mainWH._id, binLocation: 'SZA-A1-S1-B2', quantity: 85,   costPrice: 45.00,   batchNumber: 'BATCH-2024-002' },
      { product: createdProducts[2]._id,  warehouse: mainWH._id, binLocation: 'SZA-A1-S1-B3', quantity: 60,   costPrice: 28.00,   batchNumber: 'BATCH-2024-003' },
      { product: createdProducts[3]._id,  warehouse: mainWH._id, binLocation: 'SZA-A1-S2-B1', quantity: 8,    costPrice: 320.00,  batchNumber: 'BATCH-2024-004' },
      { product: createdProducts[4]._id,  warehouse: mainWH._id, binLocation: 'SZA-A1-S2-B2', quantity: 3,    costPrice: 85.00,   batchNumber: 'BATCH-2024-005' },
      // Hardware in CDH-001 Storage Zone B
      { product: createdProducts[5]._id,  warehouse: mainWH._id, binLocation: 'SZB-B1-S1-B1', quantity: 2400, costPrice: 0.25,    batchNumber: 'BATCH-2024-006' },
      { product: createdProducts[6]._id,  warehouse: mainWH._id, binLocation: 'SZB-B1-S1-B2', quantity: 3100, costPrice: 0.08,    batchNumber: 'BATCH-2024-007' },
      { product: createdProducts[7]._id,  warehouse: mainWH._id, binLocation: 'SZB-B1-S1-B1', quantity: 22,   costPrice: 120.00,  batchNumber: 'BATCH-2024-008' },
      { product: createdProducts[8]._id,  warehouse: mainWH._id, binLocation: 'SZA-A2-S1-B1', quantity: 180,  costPrice: 7.50,    batchNumber: 'BATCH-2024-009' },
      { product: createdProducts[9]._id,  warehouse: mainWH._id, binLocation: 'SZA-A2-S1-B2', quantity: 450,  costPrice: 2.10,    batchNumber: 'BATCH-2024-010' },
      // Food in Cold Storage (with expiry)
      { product: createdProducts[10]._id, warehouse: mainWH._id, binLocation: 'CS-C1-S1-B1',  quantity: 120,  costPrice: 16.00,   batchNumber: 'BATCH-2024-011', expiryDate: new Date(Date.now() + 90  * 86400000) },
      { product: createdProducts[11]._id, warehouse: mainWH._id, binLocation: 'CS-C1-S1-B1',  quantity: 80,   costPrice: 12.00,   batchNumber: 'BATCH-2024-012', expiryDate: new Date(Date.now() + 180 * 86400000) },
      { product: createdProducts[12]._id, warehouse: mainWH._id, binLocation: 'CS-C1-S1-B1',  quantity: 350,  costPrice: 5.50,    batchNumber: 'BATCH-2024-013', expiryDate: new Date(Date.now() + 25  * 86400000) },
      { product: createdProducts[13]._id, warehouse: mainWH._id, binLocation: 'CS-C1-S1-B1',  quantity: 18,   costPrice: 18.00,   batchNumber: 'BATCH-2024-014', expiryDate: new Date(Date.now() + 12  * 86400000) },
      // Safety Equipment
      { product: createdProducts[14]._id, warehouse: mainWH._id, binLocation: 'SZA-A2-S1-B1', quantity: 65,   costPrice: 22.00,   batchNumber: 'BATCH-2024-015' },
      { product: createdProducts[15]._id, warehouse: mainWH._id, binLocation: 'SZA-A2-S1-B2', quantity: 140,  costPrice: 9.00,    batchNumber: 'BATCH-2024-016' },
      { product: createdProducts[16]._id, warehouse: mainWH._id, binLocation: 'SZA-A2-S1-B1', quantity: 7,    costPrice: 55.00,   batchNumber: 'BATCH-2024-017' },
      { product: createdProducts[17]._id, warehouse: mainWH._id, binLocation: 'SZA-A2-S1-B2', quantity: 28,   costPrice: 30.00,   batchNumber: 'BATCH-2024-018' },
      // Packaging
      { product: createdProducts[18]._id, warehouse: mainWH._id, binLocation: 'SZB-B1-S1-B2', quantity: 850,  costPrice: 0.70,    batchNumber: 'BATCH-2024-019' },
      { product: createdProducts[19]._id, warehouse: mainWH._id, binLocation: 'SZB-B1-S1-B2', quantity: 45,   costPrice: 10.00,   batchNumber: 'BATCH-2024-020' },
      { product: createdProducts[20]._id, warehouse: mainWH._id, binLocation: 'SZB-B1-S1-B2', quantity: 320,  costPrice: 2.50,    batchNumber: 'BATCH-2024-021' },
      { product: createdProducts[21]._id, warehouse: mainWH._id, binLocation: 'SZB-B1-S1-B2', quantity: 95,   costPrice: 8.00,    batchNumber: 'BATCH-2024-022' },
      // East Coast warehouse
      { product: createdProducts[0]._id,  warehouse: eastWH._id, binLocation: 'MS-M1-S1-B1',  quantity: 6,    costPrice: 950.00,  batchNumber: 'BATCH-2024-023' },
      { product: createdProducts[1]._id,  warehouse: eastWH._id, binLocation: 'MS-M1-S1-B2',  quantity: 40,   costPrice: 45.00,   batchNumber: 'BATCH-2024-024' },
      { product: createdProducts[14]._id, warehouse: eastWH._id, binLocation: 'MS-M1-S1-B1',  quantity: 30,   costPrice: 22.00,   batchNumber: 'BATCH-2024-025' },
    ];

    const createdInventory = [];
    for (const inv of inventoryData) {
      const item = await Inventory.create({ ...inv, lastUpdatedBy: adminUser._id });
      createdInventory.push(item);
    }
    ok(`${createdInventory.length} inventory records created`);


    // ── SEED ORDERS ──────────────────────────────────────────────────────────
    console.log('\n🛒 Seeding orders...');
    const ordersData = [
      {
        customer: { name: 'Acme Corp', email: 'orders@acme.com', phone: '+1-800-555-0001', address: { street: '100 Main St', city: 'Boston', state: 'MA', country: 'USA', zipCode: '02101' } },
        items: [
          { product: createdProducts[0]._id, productName: createdProducts[0].name, sku: createdProducts[0].sku, quantity: 2, unitPrice: 1299.99 },
          { product: createdProducts[1]._id, productName: createdProducts[1].name, sku: createdProducts[1].sku, quantity: 5, unitPrice: 79.99 },
        ],
        status: 'delivered',
        priority: 'high',
        warehouse: mainWH._id,
        assignedTo: dispatchUser._id,
        totalAmount: 2999.93,
        shippingMethod: 'express',
        trackingNumber: 'TRK-001-2024',
        expectedDelivery: new Date(Date.now() - 5 * 86400000),
        shippedAt: new Date(Date.now() - 7 * 86400000),
        deliveredAt: new Date(Date.now() - 5 * 86400000),
        createdBy: adminUser._id,
      },
      {
        customer: { name: 'TechStart Inc', email: 'procurement@techstart.com', phone: '+1-415-555-0002', address: { street: '200 Market St', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94105' } },
        items: [
          { product: createdProducts[3]._id, productName: createdProducts[3].name, sku: createdProducts[3].sku, quantity: 3, unitPrice: 449.99 },
          { product: createdProducts[4]._id, productName: createdProducts[4].name, sku: createdProducts[4].sku, quantity: 3, unitPrice: 129.99 },
        ],
        status: 'shipped',
        priority: 'normal',
        warehouse: mainWH._id,
        assignedTo: dispatchUser._id,
        totalAmount: 1739.94,
        shippingMethod: 'standard',
        trackingNumber: 'TRK-002-2024',
        expectedDelivery: new Date(Date.now() + 2 * 86400000),
        shippedAt: new Date(Date.now() - 1 * 86400000),
        createdBy: staffUser._id,
      },
      {
        customer: { name: 'BuildRight LLC', email: 'supply@buildright.com', phone: '+1-713-555-0003', address: { street: '300 Industrial Ave', city: 'Houston', state: 'TX', country: 'USA', zipCode: '77001' } },
        items: [
          { product: createdProducts[7]._id, productName: createdProducts[7].name, sku: createdProducts[7].sku, quantity: 5, unitPrice: 189.99 },
          { product: createdProducts[5]._id, productName: createdProducts[5].name, sku: createdProducts[5].sku, quantity: 200, unitPrice: 0.45 },
          { product: createdProducts[6]._id, productName: createdProducts[6].name, sku: createdProducts[6].sku, quantity: 200, unitPrice: 0.15 },
        ],
        status: 'picking',
        priority: 'urgent',
        warehouse: mainWH._id,
        assignedTo: staffUser._id,
        totalAmount: 1069.95,
        shippingMethod: 'standard',
        createdBy: adminUser._id,
      },
      {
        customer: { name: 'SafeWork Solutions', email: 'orders@safework.com', phone: '+1-206-555-0004', address: { street: '400 Safety Blvd', city: 'Seattle', state: 'WA', country: 'USA', zipCode: '98101' } },
        items: [
          { product: createdProducts[14]._id, productName: createdProducts[14].name, sku: createdProducts[14].sku, quantity: 20, unitPrice: 34.99 },
          { product: createdProducts[15]._id, productName: createdProducts[15].name, sku: createdProducts[15].sku, quantity: 30, unitPrice: 14.99 },
          { product: createdProducts[16]._id, productName: createdProducts[16].name, sku: createdProducts[16].sku, quantity: 5, unitPrice: 89.99 },
        ],
        status: 'pending',
        priority: 'normal',
        warehouse: mainWH._id,
        totalAmount: 1594.60,
        shippingMethod: 'standard',
        createdBy: staffUser._id,
      },
      {
        customer: { name: 'FreshMart Stores', email: 'supply@freshmart.com', phone: '+1-305-555-0005', address: { street: '500 Commerce Dr', city: 'Miami', state: 'FL', country: 'USA', zipCode: '33101' } },
        items: [
          { product: createdProducts[10]._id, productName: createdProducts[10].name, sku: createdProducts[10].sku, quantity: 30, unitPrice: 24.99 },
          { product: createdProducts[12]._id, productName: createdProducts[12].name, sku: createdProducts[12].sku, quantity: 50, unitPrice: 8.99 },
        ],
        status: 'confirmed',
        priority: 'high',
        warehouse: mainWH._id,
        assignedTo: dispatchUser._id,
        totalAmount: 1199.20,
        shippingMethod: 'refrigerated',
        createdBy: adminUser._id,
      },
    ];

    const createdOrders = [];
    for (const o of ordersData) {
      const order = await Order.create(o);
      createdOrders.push(order);
      ok(`Order ${order.orderNumber} → ${order.status}`);
    }

    // ── SEED INBOUND (GRNs) ──────────────────────────────────────────────────
    console.log('\n📥 Seeding inbound GRNs...');
    const inboundData = [
      {
        supplier: createdSuppliers[0]._id,
        warehouse: mainWH._id,
        status: 'completed',
        purchaseOrderNumber: 'PO-2024-001',
        invoiceNumber: 'INV-TP-001',
        invoiceDate: new Date(Date.now() - 15 * 86400000),
        expectedDate: new Date(Date.now() - 12 * 86400000),
        receivedDate: new Date(Date.now() - 12 * 86400000),
        verifiedDate: new Date(Date.now() - 11 * 86400000),
        items: [
          { product: createdProducts[0]._id, productName: createdProducts[0].name, sku: createdProducts[0].sku, expectedQuantity: 15, receivedQuantity: 15, binLocation: 'SZA-A1-S1-B1', batchNumber: 'BATCH-2024-001', unitCost: 950.00, status: 'received' },
          { product: createdProducts[1]._id, productName: createdProducts[1].name, sku: createdProducts[1].sku, expectedQuantity: 100, receivedQuantity: 100, binLocation: 'SZA-A1-S1-B2', batchNumber: 'BATCH-2024-002', unitCost: 45.00, status: 'received' },
        ],
        totalItems: 2,
        receivedBy: staffUser._id,
        verifiedBy: managerUser._id,
        createdBy: adminUser._id,
        notes: 'All items received in good condition.',
      },
      {
        supplier: createdSuppliers[1]._id,
        warehouse: mainWH._id,
        status: 'verified',
        purchaseOrderNumber: 'PO-2024-002',
        invoiceNumber: 'INV-IS-002',
        invoiceDate: new Date(Date.now() - 8 * 86400000),
        expectedDate: new Date(Date.now() - 5 * 86400000),
        receivedDate: new Date(Date.now() - 5 * 86400000),
        items: [
          { product: createdProducts[5]._id, productName: createdProducts[5].name, sku: createdProducts[5].sku, expectedQuantity: 3000, receivedQuantity: 3000, binLocation: 'SZB-B1-S1-B1', batchNumber: 'BATCH-2024-006', unitCost: 0.25, status: 'received' },
          { product: createdProducts[6]._id, productName: createdProducts[6].name, sku: createdProducts[6].sku, expectedQuantity: 3000, receivedQuantity: 2800, damagedQuantity: 200, binLocation: 'SZB-B1-S1-B2', batchNumber: 'BATCH-2024-007', unitCost: 0.08, status: 'partial' },
        ],
        totalItems: 2,
        receivedBy: staffUser._id,
        verifiedBy: managerUser._id,
        createdBy: staffUser._id,
        notes: '200 units of M8 nuts found damaged on arrival.',
      },
      {
        supplier: createdSuppliers[2]._id,
        warehouse: mainWH._id,
        status: 'receiving',
        purchaseOrderNumber: 'PO-2024-003',
        invoiceNumber: 'INV-FF-003',
        invoiceDate: new Date(Date.now() - 2 * 86400000),
        expectedDate: new Date(Date.now()),
        items: [
          { product: createdProducts[10]._id, productName: createdProducts[10].name, sku: createdProducts[10].sku, expectedQuantity: 200, receivedQuantity: 120, binLocation: 'CS-C1-S1-B1', batchNumber: 'BATCH-2024-011', expiryDate: new Date(Date.now() + 90 * 86400000), unitCost: 16.00, status: 'partial' },
          { product: createdProducts[11]._id, productName: createdProducts[11].name, sku: createdProducts[11].sku, expectedQuantity: 100, receivedQuantity: 0, binLocation: 'CS-C1-S1-B1', batchNumber: 'BATCH-2024-012', expiryDate: new Date(Date.now() + 180 * 86400000), unitCost: 12.00, status: 'pending' },
        ],
        totalItems: 2,
        receivedBy: staffUser._id,
        createdBy: adminUser._id,
        notes: 'Partial delivery. Remaining items expected tomorrow.',
      },
      {
        supplier: createdSuppliers[4]._id,
        warehouse: mainWH._id,
        status: 'pending',
        purchaseOrderNumber: 'PO-2024-004',
        invoiceNumber: 'INV-PP-004',
        invoiceDate: new Date(Date.now() - 1 * 86400000),
        expectedDate: new Date(Date.now() + 3 * 86400000),
        items: [
          { product: createdProducts[18]._id, productName: createdProducts[18].name, sku: createdProducts[18].sku, expectedQuantity: 1000, receivedQuantity: 0, unitCost: 0.70, status: 'pending' },
          { product: createdProducts[19]._id, productName: createdProducts[19].name, sku: createdProducts[19].sku, expectedQuantity: 100, receivedQuantity: 0, unitCost: 10.00, status: 'pending' },
        ],
        totalItems: 2,
        createdBy: adminUser._id,
        notes: 'Scheduled delivery in 3 days.',
      },
    ];

    const createdInbounds = [];
    for (const ib of inboundData) {
      const inbound = await Inbound.create(ib);
      createdInbounds.push(inbound);
      ok(`${inbound.grnNumber} → ${inbound.status}`);
    }

    // ── SEED STOCK MOVEMENTS ─────────────────────────────────────────────────
    console.log('\n📈 Seeding stock movements...');
    const stockMovementsData = [
      { product: createdProducts[0]._id, warehouse: mainWH._id, type: 'inbound', quantity: 15, toLocation: 'SZA-A1-S1-B1', toBin: 'SZA-A1-S1-B1', referenceType: 'GRN', referenceNumber: createdInbounds[0].grnNumber, batchNumber: 'BATCH-2024-001', unitCost: 950.00, totalCost: 14250.00, stockBefore: 0, stockAfter: 15, reason: 'Goods received from TechParts Global', performedBy: staffUser._id },
      { product: createdProducts[1]._id, warehouse: mainWH._id, type: 'inbound', quantity: 100, toLocation: 'SZA-A1-S1-B2', toBin: 'SZA-A1-S1-B2', referenceType: 'GRN', referenceNumber: createdInbounds[0].grnNumber, batchNumber: 'BATCH-2024-002', unitCost: 45.00, totalCost: 4500.00, stockBefore: 0, stockAfter: 100, reason: 'Goods received from TechParts Global', performedBy: staffUser._id },
      { product: createdProducts[5]._id, warehouse: mainWH._id, type: 'inbound', quantity: 3000, toLocation: 'SZB-B1-S1-B1', toBin: 'SZB-B1-S1-B1', referenceType: 'GRN', referenceNumber: createdInbounds[1].grnNumber, batchNumber: 'BATCH-2024-006', unitCost: 0.25, totalCost: 750.00, stockBefore: 0, stockAfter: 3000, reason: 'Goods received from Industrial Supply Co.', performedBy: staffUser._id },
      { product: createdProducts[0]._id, warehouse: mainWH._id, type: 'outbound', quantity: 3, fromLocation: 'SZA-A1-S1-B1', fromBin: 'SZA-A1-S1-B1', referenceType: 'ORDER', referenceNumber: 'ORD-ACME-001', batchNumber: 'BATCH-2024-001', unitCost: 950.00, totalCost: 2850.00, stockBefore: 15, stockAfter: 12, reason: 'Order fulfilled for Acme Corp', performedBy: dispatchUser._id },
      { product: createdProducts[1]._id, warehouse: mainWH._id, type: 'outbound', quantity: 15, fromLocation: 'SZA-A1-S1-B2', fromBin: 'SZA-A1-S1-B2', referenceType: 'ORDER', referenceNumber: 'ORD-ACME-001', batchNumber: 'BATCH-2024-002', unitCost: 45.00, totalCost: 675.00, stockBefore: 100, stockAfter: 85, reason: 'Order fulfilled for Acme Corp', performedBy: dispatchUser._id },
      { product: createdProducts[4]._id, warehouse: mainWH._id, type: 'adjustment', quantity: -2, fromLocation: 'SZA-A1-S2-B2', fromBin: 'SZA-A1-S2-B2', referenceType: 'ADJUSTMENT', referenceNumber: 'ADJ-2024-001', batchNumber: 'BATCH-2024-005', unitCost: 85.00, totalCost: 170.00, stockBefore: 5, stockAfter: 3, reason: 'Inventory count discrepancy corrected', performedBy: managerUser._id },
      { product: createdProducts[6]._id, warehouse: mainWH._id, type: 'damage', quantity: -200, fromLocation: 'SZB-B1-S1-B2', fromBin: 'SZB-B1-S1-B2', referenceType: 'GRN', referenceNumber: createdInbounds[1].grnNumber, batchNumber: 'BATCH-2024-007', unitCost: 0.08, totalCost: 16.00, stockBefore: 3300, stockAfter: 3100, reason: 'Damaged units identified on GRN receipt', performedBy: staffUser._id },
      { product: createdProducts[0]._id, warehouse: mainWH._id, type: 'transfer', quantity: -6, fromLocation: 'SZA-A1-S1-B1', fromBin: 'SZA-A1-S1-B1', toLocation: 'MS-M1-S1-B1', toBin: 'MS-M1-S1-B1', referenceType: 'TRANSFER', referenceNumber: 'TRF-2024-001', batchNumber: 'BATCH-2024-023', unitCost: 950.00, totalCost: 5700.00, stockBefore: 18, stockAfter: 12, reason: 'Stock transfer to East Coast Fulfillment', performedBy: managerUser._id },
    ];

    const createdMovements = [];
    for (const sm of stockMovementsData) {
      const movement = await StockMovement.create(sm);
      createdMovements.push(movement);
    }
    ok(`${createdMovements.length} stock movements created`);

    // ── SEED NOTIFICATIONS ───────────────────────────────────────────────────
    console.log('\n🔔 Seeding notifications...');
    const allUserIds = createdUsers.map(u => u._id);
    const notificationsData = [
      {
        title: 'Low Stock Alert: Mechanical Keyboard RGB',
        message: 'Mechanical Keyboard RGB (ELEC-005) stock is at 3 units, below minimum level of 10. Please reorder.',
        type: 'low_stock',
        severity: 'warning',
        recipients: [adminUser._id, managerUser._id],
        relatedModule: 'Inventory',
        relatedId: createdProducts[4]._id.toString(),
        actionUrl: '/inventory',
      },
      {
        title: 'Expiry Warning: Energy Bar Variety Pack',
        message: 'Energy Bar Variety Pack (FB-004) batch BATCH-2024-014 expires in 12 days. Take action immediately.',
        type: 'expiry_warning',
        severity: 'error',
        recipients: allUserIds,
        isGlobal: true,
        relatedModule: 'Inventory',
        relatedId: createdProducts[13]._id.toString(),
        actionUrl: '/inventory',
      },
      {
        title: 'Expiry Warning: Mineral Water 500ml x24',
        message: 'Mineral Water 500ml x24 (FB-003) batch BATCH-2024-013 expires in 25 days.',
        type: 'expiry_warning',
        severity: 'warning',
        recipients: [adminUser._id, managerUser._id],
        relatedModule: 'Inventory',
        relatedId: createdProducts[12]._id.toString(),
        actionUrl: '/inventory',
      },
      {
        title: 'New Inbound Shipment Pending',
        message: 'GRN from PackagePro Solutions (PO-2024-004) is scheduled for delivery in 3 days.',
        type: 'info',
        severity: 'info',
        recipients: [adminUser._id, managerUser._id, staffUser._id],
        relatedModule: 'Inbound',
        actionUrl: '/inbound',
      },
      {
        title: 'Low Stock Alert: Fire Extinguisher 5kg',
        message: 'Fire Extinguisher 5kg (SE-003) stock is at 7 units, approaching minimum level of 10.',
        type: 'low_stock',
        severity: 'warning',
        recipients: [adminUser._id, managerUser._id],
        relatedModule: 'Inventory',
        relatedId: createdProducts[16]._id.toString(),
        actionUrl: '/inventory',
      },
      {
        title: 'System Seeded Successfully',
        message: 'WMS Pro database has been seeded with demo data. All modules are ready for use.',
        type: 'system',
        severity: 'success',
        isGlobal: true,
        recipients: allUserIds,
        relatedModule: 'SETTINGS',
        actionUrl: '/dashboard',
      },
    ];

    const createdNotifications = [];
    for (const n of notificationsData) {
      const notif = await Notification.create(n);
      createdNotifications.push(notif);
      ok(`${notif.title}`);
    }

    // ── SEED AUDIT LOGS ──────────────────────────────────────────────────────
    console.log('\n📋 Seeding audit logs...');
    const auditLogsData = [
      { user: adminUser._id, userName: adminUser.name, action: 'LOGIN', module: 'AUTH', description: 'Admin user logged in', ipAddress: '192.168.1.1', status: 'SUCCESS' },
      { user: adminUser._id, userName: adminUser.name, action: 'CREATE', module: 'PRODUCT', description: 'Created product: Laptop Dell XPS 15 (ELEC-001)', resourceId: createdProducts[0]._id.toString(), after: { sku: 'ELEC-001', name: 'Laptop Dell XPS 15' }, status: 'SUCCESS' },
      { user: adminUser._id, userName: adminUser.name, action: 'CREATE', module: 'SUPPLIER', description: 'Created supplier: TechParts Global (SUP-001)', resourceId: createdSuppliers[0]._id.toString(), after: { code: 'SUP-001', name: 'TechParts Global' }, status: 'SUCCESS' },
      { user: managerUser._id, userName: managerUser.name, action: 'LOGIN', module: 'AUTH', description: 'Warehouse manager logged in', ipAddress: '192.168.1.10', status: 'SUCCESS' },
      { user: managerUser._id, userName: managerUser.name, action: 'RECEIVE', module: 'INBOUND', description: `Verified GRN: ${createdInbounds[0].grnNumber} from TechParts Global`, resourceId: createdInbounds[0]._id.toString(), after: { status: 'completed' }, status: 'SUCCESS' },
      { user: managerUser._id, userName: managerUser.name, action: 'UPDATE', module: 'INVENTORY', description: 'Adjusted stock for Mechanical Keyboard RGB due to count discrepancy', resourceId: createdProducts[4]._id.toString(), before: { quantity: 5 }, after: { quantity: 3 }, status: 'SUCCESS' },
      { user: staffUser._id, userName: staffUser.name, action: 'LOGIN', module: 'AUTH', description: 'Staff user logged in', ipAddress: '192.168.1.20', status: 'SUCCESS' },
      { user: staffUser._id, userName: staffUser.name, action: 'RECEIVE', module: 'INBOUND', description: `Received goods for GRN: ${createdInbounds[1].grnNumber}`, resourceId: createdInbounds[1]._id.toString(), after: { status: 'verified' }, status: 'SUCCESS' },
      { user: dispatchUser._id, userName: dispatchUser.name, action: 'SHIP', module: 'ORDER', description: 'Shipped order to TechStart Inc', after: { status: 'shipped', trackingNumber: 'TRK-002-2024' }, status: 'SUCCESS' },
      { user: adminUser._id, userName: adminUser.name, action: 'TRANSFER', module: 'STOCK_MOVEMENT', description: 'Transferred 6 units of Laptop Dell XPS 15 to East Coast Fulfillment', resourceId: createdProducts[0]._id.toString(), before: { quantity: 18 }, after: { quantity: 12 }, status: 'SUCCESS' },
      { user: adminUser._id, userName: adminUser.name, action: 'CREATE', module: 'WAREHOUSE', description: 'Created warehouse: East Coast Fulfillment (ECF-002)', resourceId: createdWarehouses[1]._id.toString(), after: { code: 'ECF-002' }, status: 'SUCCESS' },
      { user: managerUser._id, userName: managerUser.name, action: 'APPROVE', module: 'INBOUND', description: `Approved inbound GRN: ${createdInbounds[0].grnNumber}`, resourceId: createdInbounds[0]._id.toString(), status: 'SUCCESS' },
    ];

    const createdAuditLogs = [];
    for (const al of auditLogsData) {
      const auditEntry = await AuditLog.create(al);
      createdAuditLogs.push(auditEntry);
    }
    ok(`${createdAuditLogs.length} audit log entries created`);

    // ── SUMMARY ──────────────────────────────────────────────────────────────
    console.log('\n' + '━'.repeat(50));
    console.log('✅ Seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   Users          : ${createdUsers.length}`);
    console.log(`   Warehouses     : ${createdWarehouses.length}`);
    console.log(`   Suppliers      : ${createdSuppliers.length}`);
    console.log(`   Products       : ${createdProducts.length}`);
    console.log(`   Inventory      : ${createdInventory.length} records`);
    console.log(`   Orders         : ${createdOrders.length}`);
    console.log(`   Inbound GRNs   : ${createdInbounds.length}`);
    console.log(`   Stock Movements: ${createdMovements.length}`);
    console.log(`   Notifications  : ${createdNotifications.length}`);
    console.log(`   Audit Logs     : ${createdAuditLogs.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('━'.repeat(50));
    for (const u of USERS) {
      console.log(`   ${u.role.padEnd(22)} ${u.email.padEnd(28)} / ${u.password}`);
    }
    console.log('━'.repeat(50) + '\n');

  } catch (e) {
    err(`Seed failed: ${e.message}`);
    console.error(e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

seed();
