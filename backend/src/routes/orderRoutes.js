const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder, getOrderStats } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getOrderStats);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', authorize('super_admin', 'warehouse_manager', 'inventory_manager', 'staff'), createOrder);
router.put('/:id/status', authorize('super_admin', 'warehouse_manager', 'staff', 'dispatch_staff'), updateOrderStatus);
router.delete('/:id', authorize('super_admin', 'warehouse_manager'), deleteOrder);

module.exports = router;
