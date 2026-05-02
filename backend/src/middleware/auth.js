/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 * Also handles Role-Based Access Control (RBAC)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found. Token invalid.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated. Contact admin.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 500);
  }
};

/**
 * Role-Based Access Control
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authenticated.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
    }

    next();
  };
};

/**
 * Role hierarchy for permission checks
 */
const ROLE_HIERARCHY = {
  super_admin: 6,
  warehouse_manager: 5,
  inventory_manager: 4,
  staff: 3,
  dispatch_staff: 2,
  viewer: 1,
};

/**
 * Check if user has minimum role level
 */
const hasMinRole = (userRole, minRole) => {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minRole] || 0);
};

module.exports = { protect, authorize, hasMinRole };
