/**
 * App Layout
 * Main layout wrapper: Sidebar + Topbar + Content
 * Handles responsive sidebar collapse
 */

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, display: 'none',
          }}
          id="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      {/* Main content */}
      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease',
        minWidth: 0,
      }}>
        {/* Topbar */}
        <Topbar
          onMenuToggle={() => setCollapsed(!collapsed)}
          sidebarCollapsed={collapsed}
        />

        {/* Page content */}
        <main style={{
          flex: 1,
          marginTop: '64px',
          overflow: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
