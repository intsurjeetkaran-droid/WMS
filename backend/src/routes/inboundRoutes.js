const express = require('express');
const router = express.Router();
const { getInbounds, getInbound, createInbound, receiveItems, verifyInbound } = require('../controllers/inboundController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getInbounds);
router.get('/:id', getInbound);
router.post('/', authorize('super_admin', 'warehouse_manager', 'inventory_manager'), createInbound);
router.put('/:id/receive', authorize('super_admin', 'warehouse_manager', 'inventory_manager', 'staff'), receiveItems);
router.put('/:id/verify', authorize('super_admin', 'warehouse_manager'), verifyInbound);

module.exports = router;
