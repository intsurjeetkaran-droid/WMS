/**
 * Products Page
 * Full CRUD for product catalog with search, filter, modal form
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, supplierAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Badge from '../components/common/Badge';
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { PRODUCT_UNITS } from '../utils/constants';

const ProductForm = ({ product, suppliers, onSubmit, loading, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product
      ? {
          ...product,
          supplier: product.supplier?._id || product.supplier || '',
        }
      : {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Product Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="input"
            placeholder="e.g. Industrial Bolt M8"
          />
          {errors.name && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>SKU</label>
          <input {...register('sku')} className="input" placeholder="Auto-generated if empty" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Barcode</label>
          <input {...register('barcode')} className="input" placeholder="Barcode number" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Category *
          </label>
          <input
            {...register('category', { required: 'Category is required' })}
            className="input"
            placeholder="e.g. Electronics"
          />
          {errors.category && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.category.message}</p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Unit</label>
          <select {...register('unit')} className="input">
            {PRODUCT_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Unit Price</label>
          <input {...register('unitPrice')} type="number" step="0.01" min="0" className="input" placeholder="0.00" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Min Stock Level</label>
          <input {...register('minStockLevel')} type="number" min="0" className="input" placeholder="10" />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Supplier</label>
          <select {...register('supplier')} className="input">
            <option value="">Select supplier</option>
            {(suppliers || []).map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
          <textarea
            {...register('description')}
            className="input"
            rows={3}
            placeholder="Product description..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

const ProductsPage = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, category],
    queryFn: () => productAPI.getAll({ page, limit: 10, search, category }),
    select: (res) => res.data,
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => supplierAPI.getAll({ limit: 100 }),
    select: (res) => res.data.data?.suppliers || [],
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productAPI.getCategories(),
    select: (res) => res.data.data?.categories || [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => productAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['categories']);
      toast.success('Product created successfully!');
      setModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product updated successfully!');
      setModalOpen(false);
      setEditProduct(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deactivated.');
      setConfirmOpen(false);
      setTargetProduct(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
      setConfirmOpen(false);
    },
  });

  const handleSubmit = (formData) => {
    // Clean empty supplier field
    if (!formData.supplier) delete formData.supplier;
    if (editProduct) {
      updateMutation.mutate({ id: editProduct._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (product) => {
    setTargetProduct(product);
    setConfirmOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <FiPackage size={16} style={{ color: '#f97316' }} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (v) => <span style={{ fontSize: '0.8rem' }}>{v}</span>,
    },
    {
      key: 'unit',
      label: 'Unit',
      render: (v) => <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{v}</span>,
    },
    {
      key: 'unitPrice',
      label: 'Price',
      render: (v) => <span style={{ fontWeight: '600' }}>${Number(v || 0).toFixed(2)}</span>,
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (v) => v
        ? <span style={{ fontSize: '0.8rem' }}>{v.name}</span>
        : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>,
    },
    {
      key: 'minStockLevel',
      label: 'Min Stock',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v ?? 10}</span>,
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
              onClick={() => { setEditProduct(row); setModalOpen(true); }}
              title="Edit product"
            >
              <FiEdit2 size={14} />
            </button>
          )}
          {canWrite() && row.isActive && (
            <button
              className="btn btn-danger btn-sm btn-icon"
              onClick={() => handleDeleteClick(row)}
              title="Deactivate product"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const products = data?.data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="page-container">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        breadcrumb="Inventory / Products"
        actions={
          canWrite() && (
            <button
              className="btn btn-primary"
              onClick={() => { setEditProduct(null); setModalOpen(true); }}
            >
              <FiPlus size={16} /> Add Product
            </button>
          )
        }
      />

      <div className="card">
        <div style={{ padding: '20px 20px 0' }}>
          <SearchFilter
            search={search}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by name, SKU, barcode..."
            filters={[
              {
                key: 'category',
                label: 'Category',
                value: category,
                onChange: (v) => { setCategory(v); setPage(1); },
                options: (categoriesData || []).map((c) => ({ value: c, label: c })),
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={products}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No products found"
          emptyIcon="📦"
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <ProductForm
          product={editProduct}
          suppliers={suppliersData}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
          onClose={() => { setModalOpen(false); setEditProduct(null); }}
        />
      </Modal>

      {/* Confirm Deactivate */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setTargetProduct(null); }}
        onConfirm={() => deleteMutation.mutate(targetProduct?._id)}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${targetProduct?.name}"? It will no longer appear in active listings.`}
        confirmLabel="Deactivate"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProductsPage;
