const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditLog, getAuditStats } = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('super_admin', 'warehouse_manager', 'viewer'));

router.get('/stats', getAuditStats);
router.get('/', getAuditLogs);
router.get('/:id', getAuditLog);

module.exports = router;
