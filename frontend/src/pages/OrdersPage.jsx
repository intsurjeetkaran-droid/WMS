/**
 * Orders Page
 * Full order management with status tracking
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI, warehouseAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { FiPlus, FiEdit2, FiEye, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ORDER_STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';

const StatusUpdateModal = ({ order, onSubmit, loading, onClose }) => {
  const { register, handleSubmit } = useForm({ defaultValues: { status: order?.status } });
  const statuses = ['pending', 'confirmed', 'picking', 'picked', 'packing', 'packed', 'shipped', 'delivered', 'cancelled'];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>New Status</label>
          <select {...register('status')} className="input">
            {statuses.map((s) => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Tracking Number</label>
          <input {...register('trackingNumber')} className="input" placeholder="Optional tracking number" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Note</label>
          <textarea {...register('note')} className="input" rows={2} placeholder="Status change note..." />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </form>
  );
};

const CreateOrderModal = ({ warehouses, onSubmit, loading, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Customer Name *</label>
          <input {...register('customer.name', { required: true })} className="input" placeholder="Customer name" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Customer Email</label>
          <input {...register('customer.email')} type="email" className="input" placeholder="customer@email.com" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Customer Phone</label>
          <input {...register('customer.phone')} className="input" placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Priority</label>
          <select {...register('priority')} className="input">
            {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Warehouse</label>
          <select {...register('warehouse')} className="input">
            <option value="">Select warehouse</option>
            {warehouses?.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Expected Delivery</label>
          <input {...register('expectedDelivery')} type="date" className="input" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Notes</label>
          <textarea {...register('notes')} className="input" rows={2} placeholder="Order notes..." />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
};

const OrdersPage = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, status, priority],
    queryFn: () => orderAPI.getAll({ page, limit: 10, search, status, priority }),
    select: (res) => res.data,
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => warehouseAPI.getAll({ limit: 100 }),
    select: (res) => res.data.data?.warehouses || [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => orderAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast.success('Order created!');
      setCreateModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, data }) => orderAPI.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      toast.success('Order status updated!');
      setStatusModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const orders = data?.data?.orders || [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: 'orderNumber', label: 'Order',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--primary)' }}>{v}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.createdAt ? format(new Date(row.createdAt), 'MMM d, yyyy') : '—'}</div>
        </div>
      ),
    },
    {
      key: 'customer', label: 'Customer',
      render: (v) => (
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{v?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v?.email}</div>
        </div>
      ),
    },
    {
      key: 'items', label: 'Items',
      render: (v) => <span style={{ fontWeight: '600' }}>{v?.length || 0} items</span>,
    },
    {
      key: 'priority', label: 'Priority',
      render: (v) => <Badge label={v} type={PRIORITY_COLORS[v] || 'default'} />,
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge label={v} type={ORDER_STATUS_COLORS[v] || 'default'} />,
    },
    {
      key: 'totalAmount', label: 'Amount',
      render: (v) => <span style={{ fontWeight: '600' }}>${Number(v || 0).toFixed(2)}</span>,
    },
    {
      key: '_id', label: 'Actions', align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {canWrite() && !['delivered', 'cancelled'].includes(row.status) && (
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => { setSelectedOrder(row); setStatusModal(true); }}
              title="Update Status"
            >
              <FiEdit2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Orders"
        subtitle="Manage and track all warehouse orders"
        breadcrumb="Orders"
        actions={
          canWrite() && (
            <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
              <FiPlus size={16} /> New Order
            </button>
          )
        }
      />

      <div className="card">
        <div style={{ padding: '20px 20px 0' }}>
          <SearchFilter
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by order number, customer..."
            filters={[
              {
                key: 'status', label: 'Status', value: status,
                onChange: (v) => { setStatus(v); setPage(1); },
                options: ['pending', 'confirmed', 'picking', 'picked', 'packing', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => ({ value: s, label: s })),
              },
              {
                key: 'priority', label: 'Priority', value: priority,
                onChange: (v) => { setPriority(v); setPage(1); },
                options: ['low', 'normal', 'high', 'urgent'].map((p) => ({ value: p, label: p })),
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No orders found"
          emptyIcon="🛒"
        />
      </div>

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Order" size="lg">
        <CreateOrderModal
          warehouses={warehousesData}
          onSubmit={createMutation.mutate}
          loading={createMutation.isPending}
          onClose={() => setCreateModal(false)}
        />
      </Modal>

      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title={`Update Order: ${selectedOrder?.orderNumber}`}>
        {selectedOrder && (
          <StatusUpdateModal
            order={selectedOrder}
            onSubmit={(data) => statusMutation.mutate({ id: selectedOrder._id, data })}
            loading={statusMutation.isPending}
            onClose={() => setStatusModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
