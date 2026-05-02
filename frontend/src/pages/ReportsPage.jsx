/**
 * Reports & Analytics Page
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FiBarChart2, FiTrendingUp, FiPackage, FiRepeat } from 'react-icons/fi';

const COLORS = ['#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
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

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [groupBy, setGroupBy] = useState('day');

  const { data: orderReport, isLoading: orderLoading } = useQuery({
    queryKey: ['report-orders', groupBy],
    queryFn: () => reportAPI.getOrders({ groupBy }),
    select: (res) => res.data.data,
    enabled: activeTab === 'orders',
  });

  const { data: inventoryReport, isLoading: invLoading } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => reportAPI.getInventory(),
    select: (res) => res.data.data,
    enabled: activeTab === 'inventory',
  });

  const { data: movementReport, isLoading: movLoading } = useQuery({
    queryKey: ['report-movements'],
    queryFn: () => reportAPI.getMovements(),
    select: (res) => res.data.data,
    enabled: activeTab === 'movements',
  });

  const tabs = [
    { key: 'orders', label: 'Order Analytics', icon: FiTrendingUp },
    { key: 'inventory', label: 'Inventory Report', icon: FiPackage },
    { key: 'movements', label: 'Movement Report', icon: FiRepeat },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Insights into your warehouse operations"
        breadcrumb="Reports"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Analytics */}
      {activeTab === 'orders' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Group by:</span>
            {['day', 'week', 'month'].map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`btn btn-sm ${groupBy === g ? 'btn-primary' : 'btn-outline'}`}
                style={{ textTransform: 'capitalize' }}
              >
                {g}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px' }}>Order Trend</h3>
              {orderLoading ? <div className="skeleton" style={{ height: '250px' }} /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={orderReport?.orderTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} name="Orders" />
                    <Line type="monotone" dataKey="delivered" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Delivered" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px' }}>Status Breakdown</h3>
              {orderLoading ? <div className="skeleton" style={{ height: '250px' }} /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={orderReport?.statusBreakdown || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}>
                      {(orderReport?.statusBreakdown || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px' }}>Stock by Category</h3>
            {invLoading ? <div className="skeleton" style={{ height: '300px' }} /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={inventoryReport?.report || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalQuantity" fill="#f97316" radius={[4, 4, 0, 0]} name="Total Qty" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {!invLoading && (inventoryReport?.report || []).map((cat) => (
            <div key={cat._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontWeight: '700' }}>{cat._id}</h4>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Items: <strong style={{ color: 'var(--text)' }}>{cat.totalItems}</strong></span>
                  <span>Qty: <strong style={{ color: 'var(--text)' }}>{cat.totalQuantity}</strong></span>
                  <span>Value: <strong style={{ color: '#f97316' }}>${Number(cat.totalValue || 0).toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Movement Report */}
      {activeTab === 'movements' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px' }}>Movement by Type</h3>
              {movLoading ? <div className="skeleton" style={{ height: '250px' }} /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={movementReport?.movementSummary || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="_id" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '16px' }}>Top Moved Products</h3>
              {movLoading ? <div className="skeleton" style={{ height: '250px' }} /> : (
                <div>
                  {(movementReport?.topMovedProducts || []).map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{p.product?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.product?.sku}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{p.totalMovements}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>movements</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
