/**
 * StatCard - Dashboard stat card with icon, value, trend
 */

import { useEffect, useState } from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, trendLabel, suffix = '', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Count-up animation
  useEffect(() => {
    if (typeof value !== 'number') return;
    let start = 0;
    const end = value;
    const duration = 800;
    const step = end / (duration / 16);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  const colorMap = {
    primary: { bg: 'rgba(249,115,22,0.12)', color: '#f97316', glow: 'rgba(249,115,22,0.2)' },
    success: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
    warning: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
    error: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', glow: 'rgba(239,68,68,0.2)' },
    info: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: c.glow, filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text)', lineHeight: 1, marginBottom: '8px' }}>
            {prefix}{typeof value === 'number' ? displayValue.toLocaleString() : value}{suffix}
          </p>
          {trend !== undefined && (
            <p style={{ fontSize: '0.75rem', color: trend >= 0 ? '#22c55e' : '#ef4444', fontWeight: '500' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>

        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icon && <Icon size={22} style={{ color: c.color }} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
