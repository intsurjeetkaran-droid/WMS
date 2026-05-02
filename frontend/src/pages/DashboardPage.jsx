/**
 * Dashboard Page
 * Role-based dashboard with stats, charts, recent activity
 */

import { useQuery } from '@tanstack/react-query';
import { reportAPI } from '../services/api';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import { FiPackage, FiShoppingCart, FiAlertTriangle, FiBox, FiTrendingUp, FiClock } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import { ORDER_STATUS_COLORS } from '../utils/constants';
import { format } from 'date-fns';

const CHART_COLORS = ['#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: '600' }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportAPI.getDashboard(),
    refetchInterval: 60000,
    select: (res) => res.data.data,
  });

  const stats = data?.stats || {};
  const ordersByStatus = data?.ordersByStatus || [];
  const monthlyOrders = data?.monthlyOrders || [];
  const recentMovements = data?.recentMovements || [];
  const lowStockItems = data?.lowStockItems || [];

  const pieData = ordersByStatus.map((s, i) => ({
    name: s._id,
    value: s.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <div className="page-container">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening in your warehouse today"
      />

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Products"
          value={isLoading ? 0 : stats.totalProducts}
          icon={FiPackage}
          color="primary"
        />
        <StatCard
          title="Total Orders"
          value={isLoading ? 0 : stats.totalOrders}
          icon={FiShoppingCart}
          color="info"
        />
        <StatCard
          title="Today's Orders"
          value={isLoading ? 0 : stats.todayOrders}
          icon={FiTrendingUp}
          color="success"
        />
        <StatCard
          title="Low Stock Items"
          value={isLoading ? 0 : stats.lowStockCount}
          icon={FiAlertTriangle}
          color="warning"
        />
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Total Stock"
          value={isLoading ? 0 : stats.totalStock}
          icon={FiBox}
          color="primary"
        />
        <StatCard
          title="Pending Orders"
          value={isLoading ? 0 : stats.pendingOrders}
          icon={FiClock}
          color="warning"
        />
        <StatCard
          title="Expiring Soon"
          value={isLoading ? 0 : stats.expiringSoonCount}
          icon={FiAlertTriangle}
          color="error"
        />
        <StatCard
          title="Inventory Items"
          value={isLoading ? 0 : stats.totalInventoryItems}
          icon={FiBox}
          color="info"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Monthly Orders Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text)' }}>
            Orders (Last 30 Days)
          </h3>
          {isLoading ? (
            <div className="skeleton" style={{ height: '200px' }} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by Status Pie */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text)' }}>
            Orders by Status
          </h3>
          {isLoading ? (
            <div className="skeleton" style={{ height: '200px' }} />
          ) : pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1, textTransform: 'capitalize' }}>{item.name}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>No order data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Stock Movements */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text)' }}>
            Recent Stock Movements
          </h3>
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '40px', marginBottom: '8px' }} />
            ))
          ) : recentMovements.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}><p>No movements yet</p></div>
          ) : (
            <div>
              {recentMovements.map((m) => (
                <div key={m._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: m.type === 'inbound' ? '#22c55e' : m.type === 'outbound' ? '#ef4444' : '#f97316',
                    }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)' }}>
                        {m.product?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {m.createdAt ? format(new Date(m.createdAt), 'MMM d, HH:mm') : '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: '700',
                      color: m.quantity > 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)' }}>Low Stock Alerts</h3>
            {lowStockItems.length > 0 && (
              <span className="badge badge-warning">{lowStockItems.length} items</span>
            )}
          </div>
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '40px', marginBottom: '8px' }} />
            ))
          ) : lowStockItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <p>All stock levels are healthy</p>
            </div>
          ) : (
            <div>
              {lowStockItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text)' }}>
                      {item.product?.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      SKU: {item.product?.sku}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ef4444' }}>
                      {item.quantity} left
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Min: {item.product?.minStockLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
