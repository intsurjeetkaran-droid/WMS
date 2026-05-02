/**
 * Stock Movement Page
 * Full movement history with filters
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';

const typeColors = {
  inbound: 'success', outbound: 'error', transfer: 'primary',
  adjustment: 'warning', return: 'info', damage: 'error', expired: 'error',
};

const StockMovementPage = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['movements', page, type],
    queryFn: () => inventoryAPI.getMovements({ page, limit: 15, type }),
    select: (res) => res.data,
  });

  const movements = data?.data?.movements || [];
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
      key: 'type', label: 'Type',
      render: (v) => <Badge label={v} type={typeColors[v] || 'default'} />,
    },
    {
      key: 'quantity', label: 'Quantity',
      render: (v) => (
        <span style={{ fontWeight: '700', color: v > 0 ? '#22c55e' : '#ef4444' }}>
          {v > 0 ? '+' : ''}{v}
        </span>
      ),
    },
    {
      key: 'stockBefore', label: 'Before',
      render: (v) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{v}</span>,
    },
    {
      key: 'stockAfter', label: 'After',
      render: (v) => <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{v}</span>,
    },
    {
      key: 'fromLocation', label: 'From → To',
      render: (v, row) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {v || '—'} {row.toLocation ? `→ ${row.toLocation}` : ''}
        </span>
      ),
    },
    {
      key: 'referenceNumber', label: 'Reference',
      render: (v, row) => v ? (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)' }}>{v}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.referenceType}</div>
        </div>
      ) : '—',
    },
    {
      key: 'performedBy', label: 'By',
      render: (v) => <span style={{ fontSize: '0.8rem' }}>{v?.name || '—'}</span>,
    },
    {
      key: 'createdAt', label: 'Date',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v ? format(new Date(v), 'MMM d, HH:mm') : '—'}</span>,
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Stock Movement"
        subtitle="Complete history of all stock changes"
        breadcrumb="Stock Movement"
      />

      <div className="card">
        <div style={{ padding: '20px 20px 0' }}>
          <SearchFilter
            search=""
            onSearch={() => {}}
            placeholder="Filter movements..."
            filters={[
              {
                key: 'type', label: 'Type', value: type,
                onChange: (v) => { setType(v); setPage(1); },
                options: ['inbound', 'outbound', 'transfer', 'adjustment', 'return', 'damage', 'expired'].map((t) => ({ value: t, label: t })),
              },
            ]}
          />
        </div>
        <DataTable
          columns={columns}
          data={movements}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No stock movements found"
          emptyIcon="🔄"
        />
      </div>
    </div>
  );
};

export default StockMovementPage;
