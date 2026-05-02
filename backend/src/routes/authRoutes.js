/**
 * Auth Routes
 * All authentication and user management endpoints
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.get('/users', protect, authorize('super_admin', 'warehouse_manager'), getAllUsers);
router.put('/users/:id/role', protect, authorize('super_admin'), updateUserRole);

module.exports = router;
