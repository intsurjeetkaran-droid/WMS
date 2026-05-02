/**
 * App-wide constants
 * Colors, roles, status maps, etc.
 */

export const APP_NAME = 'WMS Pro';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  INVENTORY_MANAGER: 'inventory_manager',
  STAFF: 'staff',
  DISPATCH_STAFF: 'dispatch_staff',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  warehouse_manager: 'Warehouse Manager',
  inventory_manager: 'Inventory Manager',
  staff: 'Staff / Operator',
  dispatch_staff: 'Dispatch Staff',
  viewer: 'Viewer / Auditor',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PICKING: 'picking',
  PICKED: 'picked',
  PACKING: 'packing',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

export const ORDER_STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'info',
  picking: 'info',
  picked: 'info',
  packing: 'info',
  packed: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  returned: 'error',
};

export const INBOUND_STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  receiving: 'info',
  received: 'primary',
  verified: 'success',
  completed: 'success',
  cancelled: 'error',
};

export const MOVEMENT_TYPES = ['inbound', 'outbound', 'transfer', 'adjustment', 'return', 'damage', 'expired'];

export const PRODUCT_UNITS = ['piece', 'kg', 'liter', 'box', 'pallet', 'meter', 'set'];

export const ZONE_TYPES = ['storage', 'receiving', 'dispatch', 'quarantine', 'cold_storage'];

export const PRIORITY_COLORS = {
  low: 'default',
  normal: 'info',
  high: 'warning',
  urgent: 'error',
};

export const SEVERITY_COLORS = {
  info: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
  success: '#22c55e',
};
