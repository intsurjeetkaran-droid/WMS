/**
 * Suppliers Page
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Badge from '../components/common/Badge';
import { FiPlus, FiEdit2, FiTrash2, FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const SupplierForm = ({ supplier, onSubmit, loading, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: supplier || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Supplier Name *
          </label>
          <input
            {...register('name', { required: 'Supplier name is required' })}
            className="input"
            placeholder="Supplier name"
          />
          {errors.name && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name.message}</p>
          )}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Contact Person</label>
          <input {...register('contactPerson')} className="input" placeholder="Contact name" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email</label>
          <input {...register('email')} type="email" className="input" placeholder="supplier@email.com" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone</label>
          <input {...register('phone')} className="input" placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Category</label>
          <input {...register('category')} className="input" placeholder="e.g. Electronics" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Payment Terms</label>
          <input {...register('paymentTerms')} className="input" placeholder="e.g. Net 30" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>City</label>
          <input {...register('address.city')} className="input" placeholder="City" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Country</label>
          <input {...register('address.country')} className="input" placeholder="Country" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Notes</label>
          <textarea {...register('notes')} className="input" rows={2} placeholder="Additional notes..." />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Add Supplier'}
        </button>
      </div>
    </form>
  );
};

const SuppliersPage = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetSupplier, setTargetSupplier] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => supplierAPI.getAll({ page, limit: 10, search }),
    select: (res) => res.data,
  });

  const createMutation = useMutation({
    mutationFn: (data) => supplierAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      queryClient.invalidateQueries(['suppliers-list']);
      toast.success('Supplier added!');
      setModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create supplier'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => supplierAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      queryClient.invalidateQueries(['suppliers-list']);
      toast.success('Supplier updated!');
      setModalOpen(false);
      setEditSupplier(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update supplier'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => supplierAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      queryClient.invalidateQueries(['suppliers-list']);
      toast.success('Supplier deactivated.');
      setConfirmOpen(false);
      setTargetSupplier(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
      setConfirmOpen(false);
    },
  });

  const suppliers = data?.data?.suppliers || [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: 'name',
      label: 'Supplier',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <FiTruck size={16} style={{ color: '#f97316' }} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{v}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.code}</div>
          </div>
        </div>
      ),
    },
    { key: 'contactPerson', label: 'Contact', render: (v) => <span style={{ fontSize: '0.875rem' }}>{v || '—'}</span> },
    { key: 'email', label: 'Email', render: (v) => <span style={{ fontSize: '0.8rem' }}>{v || '—'}</span> },
    { key: 'phone', label: 'Phone', render: (v) => <span style={{ fontSize: '0.8rem' }}>{v || '—'}</span> },
    { key: 'category', label: 'Category', render: (v) => <span style={{ fontSize: '0.8rem' }}>{v || '—'}</span> },
    {
      key: 'rating',
      label: 'Rating',
      render: (v) => (
        <span style={{ color: '#f59e0b', fontWeight: '700', letterSpacing: '1px' }}>
          {'★'.repeat(Math.min(v || 0, 5))}{'☆'.repeat(Math.max(0, 5 - (v || 0)))}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => <Badge label={v ? 'Active' : 'Inactive'} type={v ? 'success' : 'error'} />,
    },
    {
      key: '_id',
      label: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {canWrite() && (
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => { setEditSupplier(row); setModalOpen(true); }}
              title="Edit supplier"
            >
              <FiEdit2 size={14} />
            </button>
          )}
          {canWrite() && row.isActive && (
            <button
              className="btn btn-danger btn-sm btn-icon"
              onClick={() => { setTargetSupplier(row); setConfirmOpen(true); }}
              title="Deactivate supplier"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Suppliers"
        subtitle="Manage supplier relationships"
        breadcrumb="Suppliers"
        actions={
          canWrite() && (
            <button
              className="btn btn-primary"
              onClick={() => { setEditSupplier(null); setModalOpen(true); }}
            >
              <FiPlus size={16} /> Add Supplier
            </button>
          )
        }
      />

      <div className="card">
        <div style={{ padding: '20px 20px 0' }}>
          <SearchFilter
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search suppliers..."
          />
        </div>
        <DataTable
          columns={columns}
          data={suppliers}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No suppliers found"
          emptyIcon="🚛"
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditSupplier(null); }}
        title={editSupplier ? 'Edit Supplier' : 'Add Supplier'}
        size="lg"
      >
        <SupplierForm
          supplier={editSupplier}
          onSubmit={(data) =>
            editSupplier
              ? updateMutation.mutate({ id: editSupplier._id, data })
              : createMutation.mutate(data)
          }
          loading={createMutation.isPending || updateMutation.isPending}
          onClose={() => { setModalOpen(false); setEditSupplier(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setTargetSupplier(null); }}
        onConfirm={() => deleteMutation.mutate(targetSupplier?._id)}
        title="Deactivate Supplier"
        message={`Are you sure you want to deactivate "${targetSupplier?.name}"?`}
        confirmLabel="Deactivate"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default SuppliersPage;
