/**
 * Auth Controller
 * Handles: Register, Login, Logout, Get Profile, Update Profile
 * All actions are audit logged
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { createAuditLog, getRequestMeta } = require('../utils/auditLogger');

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public (or Super Admin only in production)
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered.', 400);
    }

    // Create user
    const user = await User.create({ name, email, password, role: role || 'viewer' });

    // Audit log
    await createAuditLog({
      userId: user._id,
      userName: user.name,
      action: 'CREATE',
      module: 'AUTH',
      description: `New user registered: ${user.email} with role ${user.role}`,
      after: { email: user.email, role: user.role },
      ...getRequestMeta(req),
      resourceId: user._id.toString(),
    });

    const token = generateToken(user._id);

    return successResponse(res, 'Registration successful.', { user, token }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password.', 400);
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account deactivated. Contact admin.', 403);
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Log failed attempt
      await createAuditLog({
        userId: user._id,
        userName: user.name,
        action: 'LOGIN',
        module: 'AUTH',
        description: `Failed login attempt for: ${email}`,
        ...getRequestMeta(req),
        status: 'FAILED',
        resourceId: user._id.toString(),
      });
      return errorResponse(res, 'Invalid credentials.', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Audit log
    await createAuditLog({
      userId: user._id,
      userName: user.name,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User logged in: ${user.email}`,
      ...getRequestMeta(req),
      resourceId: user._id.toString(),
    });

    const token = generateToken(user._id);
    const userObj = user.toJSON();

    return successResponse(res, 'Login successful.', { user: userObj, token });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 'Profile fetched.', { user });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const before = { name: req.user.name, avatar: req.user.avatar };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'USER',
      description: `Profile updated by ${req.user.email}`,
      before,
      after: { name, avatar },
      ...getRequestMeta(req),
      resourceId: req.user._id.toString(),
    });

    return successResponse(res, 'Profile updated.', { user });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect.', 400);
    }

    user.password = newPassword;
    await user.save();

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'AUTH',
      description: `Password changed by ${req.user.email}`,
      ...getRequestMeta(req),
      resourceId: req.user._id.toString(),
    });

    return successResponse(res, 'Password changed successfully.');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Users fetched.',
      data: { users },
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Update user role (Super Admin only)
 * @route   PUT /api/auth/users/:id/role
 * @access  Private/SuperAdmin
 */
const updateUserRole = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const before = await User.findById(req.params.id);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    );

    if (!user) return errorResponse(res, 'User not found.', 404);

    await createAuditLog({
      userId: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      module: 'USER',
      description: `Role updated for ${user.email}: ${before.role} → ${role}`,
      before: { role: before.role, isActive: before.isActive },
      after: { role, isActive },
      ...getRequestMeta(req),
      resourceId: user._id.toString(),
    });

    return successResponse(res, 'User role updated.', { user });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, getAllUsers, updateUserRole };
