const express = require('express');
const router = express.Router();
const { getWarehouses, getWarehouse, createWarehouse, updateWarehouse, addZone, addRack, getBinLocations } = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getWarehouses);
router.get('/:id', getWarehouse);
router.get('/:id/bins', getBinLocations);
router.post('/', authorize('super_admin', 'warehouse_manager'), createWarehouse);
router.put('/:id', authorize('super_admin', 'warehouse_manager'), updateWarehouse);
router.post('/:id/zones', authorize('super_admin', 'warehouse_manager'), addZone);
router.post('/:id/zones/:zoneId/racks', authorize('super_admin', 'warehouse_manager'), addRack);

module.exports = router;
