const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getSuppliers);
router.get('/:id', getSupplier);
router.post('/', authorize('super_admin', 'warehouse_manager', 'inventory_manager'), createSupplier);
router.put('/:id', authorize('super_admin', 'warehouse_manager', 'inventory_manager'), updateSupplier);
router.delete('/:id', authorize('super_admin'), deleteSupplier);

module.exports = router;
