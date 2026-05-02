/**
 * Alerts & Notifications Page
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import { FiBell, FiCheckCircle, FiAlertTriangle, FiInfo, FiXCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const severityConfig = {
  info: { icon: FiInfo, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  warning: { icon: FiAlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  error: { icon: FiXCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  success: { icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
};

const AlertsPage = () => {
  const queryClient = useQueryClient();
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', type],
    queryFn: () => notificationAPI.getAll({ limit: 50, type }),
    select: (res) => res.data.data,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => { queryClient.invalidateQueries(['notifications']); toast.success('All marked as read'); },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const types = ['low_stock', 'expiry_warning', 'order_delayed', 'order_status', 'system', 'info'];

  return (
    <div className="page-container">
      <PageHeader
        title="Alerts & Notifications"
        subtitle={`${unreadCount} unread notifications`}
        breadcrumb="Alerts"
        actions={
          unreadCount > 0 && (
            <button className="btn btn-outline" onClick={() => markAllMutation.mutate()}>
              <FiCheckCircle size={15} /> Mark All Read
            </button>
          )
        }
      />

      {/* Type filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button
          onClick={() => setType('')}
          className={`btn btn-sm ${!type ? 'btn-primary' : 'btn-outline'}`}
        >
          All
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`btn btn-sm ${type === t ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiBell size={40} style={{ opacity: 0.3 }} />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {notifications.map((n) => {
            const config = severityConfig[n.severity] || severityConfig.info;
            const Icon = config.icon;
            return (
              <div
                key={n._id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  background: n.isRead ? 'var(--card)' : 'var(--card)',
                  borderLeft: `3px solid ${n.isRead ? 'var(--border)' : config.color}`,
                  cursor: 'pointer',
                  opacity: n.isRead ? 0.7 : 1,
                }}
                onClick={() => !n.isRead && markReadMutation.mutate(n._id)}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={18} style={{ color: config.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text)' }}>{n.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!n.isRead && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color, flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {n.createdAt ? format(new Date(n.createdAt), 'MMM d, HH:mm') : '—'}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.message}</p>
                  <span style={{
                    display: 'inline-block', marginTop: '6px',
                    fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
                    color: config.color, letterSpacing: '0.05em',
                  }}>
                    {n.type?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
