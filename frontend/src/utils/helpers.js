/**
 * Helper Utilities
 * Formatting, status colors, role labels, etc.
 */

import { format, formatDistanceToNow } from 'date-fns';

// Format date
export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—';
  try { return format(new Date(date), fmt); }
  catch { return '—'; }
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return '—';
  try { return format(new Date(date), 'dd MMM yyyy, HH:mm'); }
  catch { return '—'; }
};

// Relative time
export const timeAgo = (date) => {
  if (!date) return '—';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return '—'; }
};

// Format currency
export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined) return '—';
  return `${currency}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

// Format number
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-IN');
};

// Order status config
export const ORDER_STATUS = {
  pending:   { label: 'Pending',   color: 'badge-warning' },
  confirmed: { label: 'Confirmed', color: 'badge-info' },
  picking:   { label: 'Picking',   color: 'badge-info' },
  picked:    { label: 'Picked',    color: 'badge-info' },
  packing:   { label: 'Packing',   color: 'badge-orange' },
  packed:    { label: 'Packed',    color: 'badge-orange' },
  shipped:   { label: 'Shipped',   color: 'badge-success' },
  delivered: { label: 'Delivered', color: 'badge-success' },
  cancelled: { label: 'Cancelled', color: 'badge-error' },
  returned:  { label: 'Returned',  color: 'badge-gray' },
};

// Inbound status config
export const INBOUND_STATUS = {
  draft:      { label: 'Draft',      color: 'badge-gray' },
  pending:    { label: 'Pending',    color: 'badge-warning' },
  receiving:  { label: 'Receiving',  color: 'badge-info' },
  received:   { label: 'Received',   color: 'badge-orange' },
  verified:   { label: 'Verified',   color: 'badge-success' },
  completed:  { label: 'Completed',  color: 'badge-success' },
  cancelled:  { label: 'Cancelled',  color: 'badge-error' },
};

// Role labels
export const ROLE_LABELS = {
  super_admin:        { label: 'Super Admin',        color: 'badge-error' },
  warehouse_manager:  { label: 'Warehouse Manager',  color: 'badge-orange' },
  inventory_manager:  { label: 'Inventory Manager',  color: 'badge-info' },
  staff:              { label: 'Staff',               color: 'badge-gray' },
  dispatch_staff:     { label: 'Dispatch Staff',      color: 'badge-warning' },
  viewer:             { label: 'Viewer',              color: 'badge-gray' },
};

// Truncate text
export const truncate = (str, n = 30) =>
  str && str.length > n ? str.slice(0, n) + '…' : str || '—';

// Generate initials
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Debounce
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Stock status
export const getStockStatus = (quantity, minLevel) => {
  if (quantity === 0) return { label: 'Out of Stock', color: 'badge-error' };
  if (quantity <= minLevel) return { label: 'Low Stock', color: 'badge-warning' };
  return { label: 'In Stock', color: 'badge-success' };
};
