/**
 * Badge - Status/label badge component
 */

const Badge = ({ label, type = 'default', size = 'sm' }) => {
  const typeMap = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    primary: 'badge-primary',
    default: 'badge-default',
  };

  return (
    <span
      className={`badge ${typeMap[type] || 'badge-default'}`}
      style={{ fontSize: size === 'xs' ? '0.65rem' : '0.75rem' }}
    >
      {label}
    </span>
  );
};

export default Badge;
