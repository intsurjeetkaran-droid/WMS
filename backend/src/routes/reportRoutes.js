const express = require('express');
const router = express.Router();
const { getDashboardStats, getInventoryReport, getOrderReport, getMovementReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/inventory', getInventoryReport);
router.get('/orders', getOrderReport);
router.get('/movements', getMovementReport);

module.exports = router;
