/**
 * DataTable - Reusable table with pagination, search, loading states
 */

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DataTable = ({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  emptyMessage = 'No data found',
  emptyIcon,
}) => {
  if (loading) {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <div className="skeleton" style={{ height: '16px', width: '80%' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="empty-state">
          {emptyIcon && <span style={{ fontSize: '2.5rem' }}>{emptyIcon}</span>}
          <h3>{emptyMessage}</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  const { total, page, limit, pages } = pagination || {};
  const start = ((page - 1) * limit) + 1;
  const end = Math.min(page * limit, total);

  return (
    <div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row._id || idx}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {start}–{end} of {total} results
          </span>
          <div className="pagination-controls">
            <button
              className="page-btn"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <FiChevronLeft size={14} />
            </button>

            {[...Array(Math.min(pages, 5))].map((_, i) => {
              let pageNum;
              if (pages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pages - 2) {
                pageNum = pages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`page-btn ${page === pageNum ? 'active' : ''}`}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="page-btn"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
