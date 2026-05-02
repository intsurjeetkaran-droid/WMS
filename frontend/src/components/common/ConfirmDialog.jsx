/**
 * ConfirmDialog - Custom confirmation dialog
 * Replaces all window.confirm() calls with a styled modal
 */

import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) => {
  if (!isOpen) return null;

  const variantMap = {
    danger: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', btnClass: 'btn-danger' },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', btnClass: 'btn-secondary' },
    info: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', btnClass: 'btn-primary' },
  };
  const v = variantMap[variant] || variantMap.danger;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose()}
    >
      <div
        className="modal"
        style={{ maxWidth: '420px' }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: v.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FiAlertTriangle size={18} style={{ color: v.color }} />
            </div>
            <h2 id="confirm-title" style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>
              {title}
            </h2>
          </div>
          {!loading && (
            <button onClick={onClose} className="btn-ghost btn-icon" style={{ color: 'var(--text-secondary)' }}>
              <FiX size={18} />
            </button>
          )}
        </div>

        <div className="modal-body" style={{ paddingTop: '16px', paddingBottom: '8px' }}>
          <p id="confirm-message" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn ${v.btnClass}`}
            style={variant === 'danger' ? {
              background: loading ? 'rgba(239,68,68,0.5)' : '#ef4444',
              color: 'white',
              border: 'none',
            } : {}}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Processing...
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
