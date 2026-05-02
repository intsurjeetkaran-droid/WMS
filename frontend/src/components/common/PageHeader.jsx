/**
 * PageHeader - Consistent page title + actions bar
 */

const PageHeader = ({ title, subtitle, actions, breadcrumb }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
    }}>
      <div>
        {breadcrumb && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            {breadcrumb}
          </p>
        )}
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
