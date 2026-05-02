/**
 * Pagination Component
 */

import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPages = () => {
    const arr = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      arr.push(i);
    }
    return arr;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-700 dark:text-gray-300">{start}–{end}</span> of{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-dark-card2 transition-colors"
        >
          <MdChevronLeft size={18} />
        </button>

        {page > 3 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-dark-card2 transition-colors">1</button>
            {page > 4 && <span className="text-gray-400 px-1">…</span>}
          </>
        )}

        {getPages().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary-500 text-white shadow-glow-orange'
                : 'hover:bg-gray-100 dark:hover:bg-dark-card2 text-gray-700 dark:text-gray-300'
            }`}
          >
            {p}
          </button>
        ))}

        {page < pages - 2 && (
          <>
            {page < pages - 3 && <span className="text-gray-400 px-1">…</span>}
            <button onClick={() => onPageChange(pages)} className="px-3 py-1.5 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-dark-card2 transition-colors">{pages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-dark-card2 transition-colors"
        >
          <MdChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
