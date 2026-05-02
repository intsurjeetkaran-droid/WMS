/**
 * Audit Logs Page
 * Read-only view of all system actions
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchFilter from '../components/common/SearchFilter';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';

const actionColors = {
  CREATE: 'success', UPDATE: 'info', DELETE: 'error',
  LOGIN: 'primary', LOGOUT: 'default', APPROVE: 'success',
  REJECT: 'error', TRANSFER: 'warning', RECEIVE: 'info',
  SHIP: 'primary', SCAN: 'info',
};

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [module, setModule] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, action, module],
    queryFn: () => auditAPI.getAll({ page, limit: 20, action, module }),
    select: (res) => res.data,
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: 'userName', label: 'User',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{v}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{row.user?.role?.replace('_', ' ')}</div>
        </div>
      ),
    },
    {
      key: 'action', label: 'Action',
      render: (v) => <Badge label={v} type={actionColors[v] || 'default'} />,
    },
    {
      key: 'module', label: 'Module',
      render: (v) => <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{v}</span>,
    },
    {
      key: 'description', label: 'Description',
      render: (v) => <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{v}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (v) => <Badge label={v} type={v === 'SUCCESS' ? 'success' : 'error'} />,
    },
    {
      key: 'ipAddress', label: 'IP',
      render: (v) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v || '—'}</span>,
    },
    {
      key: 'createdAt', label: 'Timestamp',
      render: (v) => (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{v ? format(new Date(v), 'MMM d, yyyy') : '—'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{v ? format(new Date(v), 'HH:mm:ss') : ''}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Audit Logs"
        subtitle="Complete system activity trail — every action logged"
        breadcrumb="Audit Logs"
      />

      <div className="card">
        <div style={{ padding: '20px 20px 0' }}>
          <SearchFilter
            search=""
            onSearch={() => {}}
            placeholder="Filter logs..."
            filters={[
              {
                key: 'action', label: 'Action', value: action,
                onChange: (v) => { setAction(v); setPage(1); },
                options: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'TRANSFER', 'RECEIVE', 'SHIP'].map((a) => ({ value: a, label: a })),
              },
              {
                key: 'module', label: 'Module', value: module,
                onChange: (v) => { setModule(v); setPage(1); },
                options: ['AUTH', 'USER', 'PRODUCT', 'INVENTORY', 'WAREHOUSE', 'INBOUND', 'OUTBOUND', 'ORDER', 'SUPPLIER', 'STOCK_MOVEMENT'].map((m) => ({ value: m, label: m })),
              },
            ]}
          />
        </div>
        <DataTable
          columns={columns}
          data={logs}
          loading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No audit logs found"
          emptyIcon="📋"
        />
      </div>
    </div>
  );
};

export default AuditLogsPage;
