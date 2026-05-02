/**
 * Inventory Page
 * Real-time stock levels, adjust stock, transfer stock
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI, warehouseAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import StatCard from '../components/common/StatCard';
import { FiBox, FiAlertTriangle, FiRefreshCw, FiArrowRight, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

const AdjustForm = ({ warehouses, onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Warehouse *</label>
          <select {...register('warehouseId', { required: true })} className="input">
            <option value="">Select warehouse</option>
            {warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Product ID *</label>
          <input {...register('productId', { required: true })} className="input" placeholder="Product ID" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Bin Location</label>
          <input {...register('binLocation')} className="input" placeholder="e.g. A1-R1-S1-B1" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Quantity (+ to add, - to remove) *</label>
          <input {...register('quantity', { required: true, valueAsNumber: true })} type="number" className="input" placeholder="e.g. 50 or -10" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Reason</label>
          <input {...register('reason')} className="input" placeholder="Reason for adjustment" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adjusting...' : 'Adjust Stock'}
        </button>
      </div>
    </form>
  );
};

const InventoryPage = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [status, setStatus] = useState('');
  const [adjustModal, setAdjustModal] = useState(false);

  const { data: summaryData } = useQuery({
    queryKey: ['inventory-summary', warehouse],
    queryFn: () => inventoryAPI.getSummary({ warehouse }),
    select: (res) => res.data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', page, warehouse, status],
    queryFn: () => inventoryAPI.getAll({ page, limit: 15, warehouse, status }),
    select: (res) => res.data,
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => warehouseAPI.getAll({ limit: 100 }),
    select: (res) => res.data.data?.warehouses || [],
  });

  const adjustMutation = useMutation({
    mutationFn: (data) => inventoryAPI.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      queryClient.invalidateQueries(['inventory-summary']);
      toast.success('Stock adjusted!');
      setAdjustModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Adjustment failed'),
  });

  const summary = summaryData?.summary || {};
  const inventory = data?.data?.inventory || [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: 'product', label: 'Product',
      render: (v) => v ? (
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{v.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.sku}</div>
        </div>
      ) : '—',
    },
    {
      key: 'warehouse', label: 'Warehouse',
      render: (v) => v ? <span style={{ fontSize: '0.8rem' }}>{v.name}</span> : '—',
    },
    { key: 'binLocation', label: 'Bin Location', render: (v) => <code style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{v || '—'}</code> },
    {
      key: 'quantity', label: 'Total Qty',
      render: (v, row) => {
        const isLow = row.product && v <= row.product.minStockLevel;
        return <span style={{ fontWeight: '700', color: isLow ? '#ef4444' : 'var(--text)' }}>{v}</span>;
      },
    },
    { key: 'availableQuantity', label: 'Available', render: (v) => <span style={{ color: '#22c55e', fontWeight: '600' }}>{v}</span> },
    { key: 'reservedQuantity', label: 'Reserved', render: (v) => <span style={{ color: '#f59e0b', fontWeight: '600' }}>{v}</span> },
    {
      key: 'status', label: 'Status',
      render: (v) => {
        const map = { available: 'success', reserved: 'warning', damaged: 'error', expired: 'error', quarantine: 'warning' };
        return <Badge label={v} type={map[v] || 'default'} />;
      },
    },
    {
      key: 'expiryDate', label: 'Expiry',
      render: (v) => {
        if (!v) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>;
        const d = new Date(v);
        const isExpiring = d <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return <span style={{ fontSize: '0.8rem', color: isExpiring ? '#f59e0b' : 'var(--text)' }}>{format(d, 'MMM d, yyyy')}</span>;
      },
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Inventory"
        subtitle="Real-time stock levels across all warehouses"
        breadcrumb="Inventory"
        actions={
          canWrite() && (
            <button className="btn btn-primary" onClick={() => setAdjustModal(true)}>
              <FiPlus size={16} /> Adjust Stock
            </button>
          )
        }
      />

      {/* Summary Stats */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard title="Total Items" value={summary.totalItems || 0} icon={FiBox} color="primary" />
        <StatCard title="Total Quantity" value={summary.totalQuantity || 0} icon={FiBox} color="info" />
        <StatCard title="Low Stock" value={summaryData?.lowStockCount || 0} icon={FiAlertTriangle} color="warning" />
        <StatCard title="Expiring Soon" value={summaryData?.expiringSoon || 0} icon={FiAlertTriangle} color="error" />
      </div>

      <div className="card">
        <div style={{ padding: '20px 20px 0' }}>
          <SearchFilter
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search inventory..."
            filters={[
              {
                key: 'warehouse', label: 'Warehouse', value: warehouse,
                onChange: (v) => { setWarehouse(v); setPage(1); },
                options: (warehousesData || []).map((w) => ({ value: w._id, label: w.name })),
              },
              {
                key: 'status', label: 'Status', value: status,
                onChange: (v) => { setStatus(v); setPage(1); },
                options: ['available', 'reserved', 'damaged', 'expired', 'quarantine'].map((s) => ({ value: s, label: s })),
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={inventory}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No inventory records found"
          emptyIcon="📦"
        />
      </div>

      <Modal isOpen={adjustModal} onClose={() => setAdjustModal(false)} title="Adjust Stock">
        <AdjustForm
          warehouses={warehousesData}
          onSubmit={adjustMutation.mutate}
          loading={adjustMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
