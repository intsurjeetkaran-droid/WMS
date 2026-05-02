const express = require('express');
const router = express.Router();
const { getInventory, getInventorySummary, adjustStock, transferStock, getStockMovements } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getInventorySummary);
router.get('/movements', getStockMovements);
router.get('/', getInventory);
router.post('/adjust', authorize('super_admin', 'warehouse_manager', 'inventory_manager'), adjustStock);
router.post('/transfer', authorize('super_admin', 'warehouse_manager', 'inventory_manager'), transferStock);

module.exports = router;
