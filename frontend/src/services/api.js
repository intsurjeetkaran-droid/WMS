/**
 * Axios API Service
 * Central HTTP client with auth token injection and error handling
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://wms-786w.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.');
    }

    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getUsers: (params) => api.get('/auth/users', { params }),
  updateUserRole: (id, data) => api.put(`/auth/users/${id}/role`, data),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  scan: (code) => api.get(`/products/scan/${code}`),
};

// Inventory
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getSummary: (params) => api.get('/inventory/summary', { params }),
  adjust: (data) => api.post('/inventory/adjust', data),
  transfer: (data) => api.post('/inventory/transfer', data),
  getMovements: (params) => api.get('/inventory/movements', { params }),
};

// Warehouses
export const warehouseAPI = {
  getAll: (params) => api.get('/warehouses', { params }),
  getOne: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  addZone: (id, data) => api.post(`/warehouses/${id}/zones`, data),
  addRack: (id, zoneId, data) => api.post(`/warehouses/${id}/zones/${zoneId}/racks`, data),
  getBins: (id) => api.get(`/warehouses/${id}/bins`),
};

// Suppliers
export const supplierAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getOne: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Orders
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getStats: () => api.get('/orders/stats'),
};

// Inbound
export const inboundAPI = {
  getAll: (params) => api.get('/inbound', { params }),
  getOne: (id) => api.get(`/inbound/${id}`),
  create: (data) => api.post('/inbound', data),
  receiveItems: (id, data) => api.put(`/inbound/${id}/receive`, data),
  verify: (id) => api.put(`/inbound/${id}/verify`),
};

// Audit Logs
export const auditAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getOne: (id) => api.get(`/logs/${id}`),
  getStats: () => api.get('/logs/stats'),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Reports
export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getInventory: (params) => api.get('/reports/inventory', { params }),
  getOrders: (params) => api.get('/reports/orders', { params }),
  getMovements: (params) => api.get('/reports/movements', { params }),
};

export default api;
