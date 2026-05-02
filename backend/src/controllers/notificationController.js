/**
 * Notification Controller
 * Manages alerts: low stock, expiry, order delays
 */

const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, unread } = req.query;
    const query = {
      $or: [
        { recipients: req.user._id },
        { isGlobal: true },
      ],
    };

    if (type) query.type = type;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Add isRead flag for current user
    const notificationsWithRead = notifications.map((n) => {
      const obj = n.toObject();
      obj.isRead = n.readBy.some((r) => r.user.toString() === req.user._id.toString());
      return obj;
    });

    const unreadCount = notificationsWithRead.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched.',
      data: { notifications: notificationsWithRead, unreadCount },
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return errorResponse(res, 'Notification not found.', 404);

    const alreadyRead = notification.readBy.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({ user: req.user._id });
      await notification.save();
    }

    return successResponse(res, 'Notification marked as read.');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipients: req.user._id }, { isGlobal: true }],
      'readBy.user': { $ne: req.user._id },
    });

    for (const notification of notifications) {
      notification.readBy.push({ user: req.user._id });
      await notification.save();
    }

    return successResponse(res, 'All notifications marked as read.');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
