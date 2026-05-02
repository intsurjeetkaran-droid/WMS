/**
 * Inbound / GRN Page
 * Manage goods receipt notes
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inboundAPI, supplierAPI, warehouseAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Badge from '../components/common/Badge';
import { FiPlus, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { INBOUND_STATUS_COLORS } from '../utils/constants';

const CreateGRNForm = ({ suppliers, warehouses, onSubmit, loading, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Supplier *
          </label>
          <select {...register('supplier', { required: 'Supplier is required' })} className="input">
            <option value="">Select supplier</option>
            {(suppliers || []).map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          {errors.supplier && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.supplier.message}</p>
          )}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Warehouse *
          </label>
          <select {...register('warehouse', { required: 'Warehouse is required' })} className="input">
            <option value="">Select warehouse</option>
            {(warehouses || []).map((w) => (
              <option key={w._id} value={w._id}>{w.name}</option>
            ))}
          </select>
          {errors.warehouse && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.warehouse.message}</p>
          )}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>PO Number</label>
          <input {...register('purchaseOrderNumber')} className="input" placeholder="Purchase order number" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Invoice Number</label>
          <input {...register('invoiceNumber')} className="input" placeholder="Invoice number" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Expected Date</label>
          <input {...register('expectedDate')} type="date" className="input" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Initial Status</label>
          <select {...register('status')} className="input">
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Notes</label>
          <textarea {...register('notes')} className="input" rows={2} placeholder="Notes..." />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Creating...' : 'Create GRN'}
        </button>
      </div>
    </form>
  );
};

const InboundPage = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetGRN, setTargetGRN] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inbound', page, search, status],
    queryFn: () => inboundAPI.getAll({ page, limit: 10, search, status }),
    select: (res) => res.data,
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => supplierAPI.getAll({ limit: 100 }),
    select: (res) => res.data.data?.suppliers || [],
  });

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-list'],
    queryFn: () => warehouseAPI.getAll({ limit: 100 }),
    select: (res) => res.data.data?.warehouses || [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => inboundAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inbound']);
      toast.success('GRN created successfully!');
      setCreateModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create GRN'),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => inboundAPI.verify(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['inbound']);
      toast.success('GRN verified and completed!');
      setConfirmOpen(false);
      setTargetGRN(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Verification failed');
      setConfirmOpen(false);
    },
  });

  const inbounds = data?.data?.inbounds || [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: 'grnNumber',
      label: 'GRN Number',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--primary)' }}>{v}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.createdAt ? format(new Date(row.createdAt), 'MMM d, yyyy') : '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (v) => <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{v?.name || '—'}</span>,
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      render: (v) => <span style={{ fontSize: '0.875rem' }}>{v?.name || '—'}</span>,
    },
    {
      key: 'items',
      label: 'Items',
      render: (v) => <span style={{ fontWeight: '600' }}>{v?.length || 0}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} type={INBOUND_STATUS_COLORS[v] || 'default'} />,
    },
    {
      key: 'expectedDate',
      label: 'Expected',
      render: (v) => v
        ? <span style={{ fontSize: '0.8rem' }}>{format(new Date(v), 'MMM d, yyyy')}</span>
        : <span style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    {
      key: '_id',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {canWrite() && row.status === 'received' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setTargetGRN(row); setConfirmOpen(true); }}
            >
              <FiCheckCircle size={13} /> Verify
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Inbound / GRN"
        subtitle="Manage goods receipt notes and receiving"
        breadcrumb="Inbound"
        actions={
          canWrite() && (
            <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
              <FiPlus size={16} /> Create GRN
            </button>
          )
        }
      />

      <div className="card">
        <div style={{ padding: '20px 20px 0' }}>
          <SearchFilter
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search GRN number, PO number..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: status,
                onChange: (v) => { setStatus(v); setPage(1); },
                options: ['draft', 'pending', 'receiving', 'received', 'verified', 'completed', 'cancelled'].map((s) => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                })),
              },
            ]}
          />
        </div>
        <DataTable
          columns={columns}
          data={inbounds}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No GRN records found"
          emptyIcon="📥"
        />
      </div>

      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create GRN"
        size="lg"
      >
        <CreateGRNForm
          suppliers={suppliersData}
          warehouses={warehousesData}
          onSubmit={createMutation.mutate}
          loading={createMutation.isPending}
          onClose={() => setCreateModal(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setTargetGRN(null); }}
        onConfirm={() => verifyMutation.mutate(targetGRN?._id)}
        title="Verify GRN"
        message={`Verify GRN "${targetGRN?.grnNumber}"? This will mark it as verified and update inventory records.`}
        confirmLabel="Verify GRN"
        variant="info"
        loading={verifyMutation.isPending}
      />
    </div>
  );
};

export default InboundPage;
