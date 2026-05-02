/**
 * Socket.io Handler
 * Real-time updates for inventory, orders, notifications
 * Rooms: warehouse-{id}, user-{id}, global
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Join user-specific room
    socket.join(`user-${socket.user._id}`);

    // Join global room
    socket.join('global');

    // Join warehouse room if assigned
    if (socket.user.warehouse) {
      socket.join(`warehouse-${socket.user.warehouse}`);
    }

    // Handle joining specific warehouse room
    socket.on('join-warehouse', (warehouseId) => {
      socket.join(`warehouse-${warehouseId}`);
      console.log(`📦 ${socket.user.name} joined warehouse-${warehouseId}`);
    });

    // Handle leaving warehouse room
    socket.on('leave-warehouse', (warehouseId) => {
      socket.leave(`warehouse-${warehouseId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });

  // Helper functions to emit events from controllers
  io.emitInventoryUpdate = (warehouseId, data) => {
    io.to(`warehouse-${warehouseId}`).emit('inventory-update', data);
    io.to('global').emit('inventory-update', data);
  };

  io.emitOrderUpdate = (data) => {
    io.to('global').emit('order-update', data);
  };

  io.emitNotification = (userId, data) => {
    io.to(`user-${userId}`).emit('notification', data);
    io.to('global').emit('notification', data);
  };

  io.emitLowStock = (data) => {
    io.to('global').emit('low-stock-alert', data);
  };

  return io;
};

module.exports = socketHandler;
