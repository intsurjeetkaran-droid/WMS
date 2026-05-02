/**
 * Sidebar Component
 * Fixed dark sidebar with navigation, active states, and role-based menu
 */

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome, FiPackage, FiBox, FiTruck, FiArrowDown, FiArrowUp,
  FiShoppingCart, FiUsers, FiRepeat, FiBarChart2, FiBell,
  FiFileText, FiSettings, FiChevronLeft, FiChevronRight,
  FiGrid, FiLogOut, FiUser
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

const navItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['all'] },
  { path: '/inventory', icon: FiBox, label: 'Inventory', roles: ['all'] },
  { path: '/products', icon: FiPackage, label: 'Products', roles: ['all'] },
  { path: '/warehouse', icon: FiGrid, label: 'Warehouse', roles: ['super_admin', 'warehouse_manager', 'inventory_manager'] },
  { path: '/inbound', icon: FiArrowDown, label: 'Inbound', roles: ['super_admin', 'warehouse_manager', 'inventory_manager', 'staff'] },
  { path: '/outbound', icon: FiArrowUp, label: 'Outbound', roles: ['super_admin', 'warehouse_manager', 'inventory_manager', 'staff', 'dispatch_staff'] },
  { path: '/orders', icon: FiShoppingCart, label: 'Orders', roles: ['all'] },
  { path: '/suppliers', icon: FiTruck, label: 'Suppliers', roles: ['super_admin', 'warehouse_manager', 'inventory_manager'] },
  { path: '/stock-movement', icon: FiRepeat, label: 'Stock Movement', roles: ['all'] },
  { path: '/reports', icon: FiBarChart2, label: 'Reports', roles: ['super_admin', 'warehouse_manager', 'viewer'] },
  { path: '/alerts', icon: FiBell, label: 'Alerts', roles: ['all'] },
  { path: '/logs', icon: FiFileText, label: 'Audit Logs', roles: ['super_admin', 'warehouse_manager', 'viewer'] },
  { path: '/settings', icon: FiSettings, label: 'Settings', roles: ['super_admin'] },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const canAccess = (roles) => {
    if (roles.includes('all')) return true;
    return roles.includes(user?.role);
  };

  const filteredNav = navItems.filter((item) => canAccess(item.roles));

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '240px',
        minHeight: '100vh',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        overflowX: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 20px',
        borderBottom: '1px solid var(--sidebar-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: '64px',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: 'white',
              flexShrink: 0,
            }}>W</div>
            <span style={{ color: 'var(--sidebar-text)', fontWeight: '700', fontSize: '1rem', letterSpacing: '-0.02em' }}>
              {APP_NAME}
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '800', color: 'white',
          }}>W</div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--sidebar-text)', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <FiChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--sidebar-text)',
                background: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                position: 'relative',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--sidebar-hover)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '3px', height: '60%', background: 'var(--primary)',
                  borderRadius: '0 3px 3px 0',
                }} />
              )}
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div style={{
        padding: '12px 8px',
        borderTop: '1px solid var(--sidebar-border)',
      }}>
        {/* Collapse toggle when expanded */}
        {collapsed && (
          <button
            onClick={onToggle}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'var(--sidebar-text)', padding: '10px 0',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '8px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--sidebar-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FiChevronRight size={18} />
          </button>
        )}

        {!collapsed && user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px',
            background: 'var(--sidebar-hover)',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '0.875rem', flexShrink: 0,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ color: 'var(--sidebar-text)', fontWeight: '600', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title={collapsed ? 'Logout' : ''}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            cursor: 'pointer', color: '#ef4444', padding: collapsed ? '10px 0' : '10px 12px',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '12px', fontSize: '0.875rem', fontWeight: '500',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
