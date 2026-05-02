const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories, scanProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/categories', getCategories);
router.get('/scan/:code', scanProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorize('super_admin', 'warehouse_manager', 'inventory_manager'), createProduct);
router.put('/:id', authorize('super_admin', 'warehouse_manager', 'inventory_manager'), updateProduct);
router.delete('/:id', authorize('super_admin'), deleteProduct);

module.exports = router;
