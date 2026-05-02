/**
 * Warehouse Structure Page
 * Manage warehouses and their zone/rack/shelf/bin hierarchy
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { FiPlus, FiGrid, FiChevronDown, FiChevronRight, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const WarehouseForm = ({ onSubmit, loading, onClose }) => {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Warehouse Name *</label>
          <input {...register('name', { required: true })} className="input" placeholder="Main Warehouse" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Code *</label>
          <input {...register('code', { required: true })} className="input" placeholder="WH-001" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>City</label>
          <input {...register('address.city')} className="input" placeholder="City" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Country</label>
          <input {...register('address.country')} className="input" placeholder="Country" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone</label>
          <input {...register('phone')} className="input" placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email</label>
          <input {...register('email')} type="email" className="input" placeholder="warehouse@email.com" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
          <textarea {...register('description')} className="input" rows={2} placeholder="Warehouse description..." />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Creating...' : 'Create Warehouse'}
        </button>
      </div>
    </form>
  );
};

const ZoneForm = ({ onSubmit, loading, onClose }) => {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Zone Name *</label>
          <input {...register('name', { required: true })} className="input" placeholder="Zone A" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Code *</label>
          <input {...register('code', { required: true })} className="input" placeholder="A" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Type</label>
          <select {...register('type')} className="input">
            {['storage', 'receiving', 'dispatch', 'quarantine', 'cold_storage'].map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Adding...' : 'Add Zone'}
        </button>
      </div>
    </form>
  );
};

const WarehouseCard = ({ warehouse, onAddZone }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div
        style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiGrid size={20} style={{ color: '#f97316' }} />
          </div>
          <div>
            <h3 style={{ fontWeight: '700', fontSize: '1rem' }}>{warehouse.name}</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: <strong>{warehouse.code}</strong></span>
              {warehouse.address?.city && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <FiMapPin size={11} /> {warehouse.address.city}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{warehouse.zones?.length || 0} zones</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge label={warehouse.isActive ? 'Active' : 'Inactive'} type={warehouse.isActive ? 'success' : 'error'} />
          {expanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Zones</h4>
            <button className="btn btn-outline btn-sm" onClick={() => onAddZone(warehouse._id)}>
              <FiPlus size={13} /> Add Zone
            </button>
          </div>

          {warehouse.zones?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No zones yet. Add a zone to get started.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {warehouse.zones?.map((zone) => (
                <div key={zone._id} style={{
                  background: 'var(--bg-secondary)', borderRadius: '10px', padding: '14px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{zone.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Code: {zone.code}</div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: '600', padding: '2px 8px', borderRadius: '9999px',
                      background: 'rgba(249,115,22,0.1)', color: '#f97316', textTransform: 'capitalize',
                    }}>
                      {zone.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {zone.racks?.length || 0} racks
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WarehousePage = () => {
  const { canWrite } = useAuth();
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [zoneModal, setZoneModal] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => warehouseAPI.getAll({ limit: 50 }),
    select: (res) => res.data.data?.warehouses || [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => warehouseAPI.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['warehouses']); toast.success('Warehouse created!'); setCreateModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const addZoneMutation = useMutation({
    mutationFn: ({ id, data }) => warehouseAPI.addZone(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['warehouses']); toast.success('Zone added!'); setZoneModal(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const warehouses = data || [];

  return (
    <div className="page-container">
      <PageHeader
        title="Warehouse Structure"
        subtitle="Manage warehouses, zones, racks, shelves and bins"
        breadcrumb="Warehouse"
        actions={canWrite() && (
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            <FiPlus size={16} /> Add Warehouse
          </button>
        )}
      />

      {isLoading ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
        </div>
      ) : warehouses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiGrid size={40} style={{ opacity: 0.3 }} />
            <h3>No warehouses yet</h3>
            <p>Create your first warehouse to get started</p>
            {canWrite() && (
              <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
                <FiPlus size={15} /> Create Warehouse
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {warehouses.map((w) => (
            <WarehouseCard
              key={w._id}
              warehouse={w}
              onAddZone={(id) => { setSelectedWarehouseId(id); setZoneModal(true); }}
            />
          ))}
        </div>
      )}

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Warehouse" size="lg">
        <WarehouseForm
          onSubmit={createMutation.mutate}
          loading={createMutation.isPending}
          onClose={() => setCreateModal(false)}
        />
      </Modal>

      <Modal isOpen={zoneModal} onClose={() => setZoneModal(false)} title="Add Zone">
        <ZoneForm
          onSubmit={(data) => addZoneMutation.mutate({ id: selectedWarehouseId, data })}
          loading={addZoneMutation.isPending}
          onClose={() => setZoneModal(false)}
        />
      </Modal>
    </div>
  );
};

export default WarehousePage;
