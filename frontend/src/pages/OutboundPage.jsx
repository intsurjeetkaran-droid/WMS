/**
 * Outbound Page
 * Pick list, packing, shipping management
 * Redirects to Orders with outbound-specific filters
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { FiArrowUp, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ORDER_STATUS_COLORS } from '../utils/constants';

const OutboundPage = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('picked');
  const [statusModal, setStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['outbound-orders', page, status],
    queryFn: () => orderAPI.getAll({ page, limit: 10, status }),
    select: (res) => res.data,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, data }) => orderAPI.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['outbound-orders']);
      toast.success('Order updated!');
      setStatusModal(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.pagination;

  const outboundStatuses = ['picking', 'picked', 'packing', 'packed', 'shipped'];

  const columns = [
    {
      key: 'orderNumber', label: 'Order',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{v}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.createdAt ? format(new Date(row.createdAt), 'MMM d') : '—'}</div>
        </div>
      ),
    },
    { key: 'customer', label: 'Customer', render: (v) => <span style={{ fontWeight: '500' }}>{v?.name}</span> },
    { key: 'items', label: 'Items', render: (v) => <span style={{ fontWeight: '600' }}>{v?.length}</span> },
    { key: 'priority', label: 'Priority', render: (v) => <Badge label={v} type={v === 'urgent' ? 'error' : v === 'high' ? 'warning' : 'default'} /> },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v} type={ORDER_STATUS_COLORS[v] || 'default'} /> },
    {
      key: '_id', label: 'Actions', align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {canWrite() && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setSelectedOrder(row); setStatusModal(true); }}
            >
              <FiArrowUp size={13} /> Update
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Outbound"
        subtitle="Pick, pack and ship orders"
        breadcrumb="Outbound"
      />

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {outboundStatuses.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            style={{
              padding: '16px', borderRadius: '12px', border: `2px solid ${status === s ? 'var(--primary)' : 'var(--border)'}`,
              background: status === s ? 'rgba(249,115,22,0.08)' : 'var(--card)',
              cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontWeight: '700', fontSize: '1.1rem', color: status === s ? 'var(--primary)' : 'var(--text)', textTransform: 'capitalize' }}>
              {s}
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage={`No orders in '${status}' status`}
          emptyIcon="📤"
        />
      </div>

      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title={`Update: ${selectedOrder?.orderNumber}`}>
        <form onSubmit={handleSubmit((data) => statusMutation.mutate({ id: selectedOrder._id, data }))}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>New Status</label>
              <select {...register('status')} className="input" defaultValue={selectedOrder?.status}>
                {['picking', 'picked', 'packing', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tracking Number</label>
              <input {...register('trackingNumber')} className="input" placeholder="Tracking number (for shipping)" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Note</label>
              <textarea {...register('note')} className="input" rows={2} placeholder="Status note..." />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={() => setStatusModal(false)} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={statusMutation.isPending} className="btn btn-primary">
              {statusMutation.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OutboundPage;
