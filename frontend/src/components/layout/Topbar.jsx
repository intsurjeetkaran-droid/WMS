/**
 * Topbar Component
 * Search, notifications, profile menu, theme toggle
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiSun, FiMoon, FiUser, FiSettings, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

const Topbar = ({ onMenuToggle, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll({ limit: 5 }),
    refetchInterval: 30000,
    select: (res) => res.data.data,
  });

  const unreadCount = notifData?.unreadCount || 0;
  const notifications = notifData?.notifications || [];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: `${sidebarWidth}px`,
      right: 0,
      height: '64px',
      background: 'var(--topbar-bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 99,
      transition: 'left 0.3s ease',
      gap: '16px',
    }}>
      {/* Left: Mobile menu + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '480px' }}>
        <button
          onClick={onMenuToggle}
          className="btn-ghost btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
        >
          <FiMenu size={20} />
        </button>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch size={16} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            type="text"
            placeholder="Search products, orders..."
            className="input"
            style={{ paddingLeft: '38px', height: '38px' }}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost btn-icon"
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          style={{ color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px' }}
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="btn-ghost btn-icon"
            style={{ color: 'var(--text-secondary)', borderRadius: '8px', padding: '8px', position: 'relative' }}
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '16px', height: '16px',
                background: 'var(--error)', color: 'white',
                borderRadius: '50%', fontSize: '0.65rem', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '320px', background: 'var(--card)',
              border: '1px solid var(--border)', borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)', zIndex: 200,
              overflow: 'hidden',
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="badge badge-primary">{unreadCount} new</span>
                )}
              </div>
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: n.isRead ? 'transparent' : 'rgba(249,115,22,0.04)',
                      cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{
                          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                          background: n.severity === 'error' ? 'var(--error)' : n.severity === 'warning' ? 'var(--warning)' : 'var(--info)',
                        }} />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => { navigate('/alerts'); setNotifOpen(false); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
              color: 'var(--text)', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '0.8rem',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </span>
          </button>

          {profileOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '200px', background: 'var(--card)',
              border: '1px solid var(--border)', borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
              {[
                { icon: FiUser, label: 'Profile', action: () => { navigate('/settings'); setProfileOpen(false); } },
                { icon: FiSettings, label: 'Settings', action: () => { navigate('/settings'); setProfileOpen(false); } },
                { icon: FiLogOut, label: 'Logout', action: logout, danger: true },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                    cursor: 'pointer', color: item.danger ? '#ef4444' : 'var(--text)',
                    fontSize: '0.875rem', textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
