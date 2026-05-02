import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPlay, FiArrowRight, FiBox, FiLayers,
  FiFileText, FiAlertTriangle, FiRepeat, FiBarChart2,
  FiCheckCircle, FiZap, FiShield, FiMenu, FiX
} from 'react-icons/fi';

/* ─── Animated Counter ─────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const numeric = parseInt(target.replace(/\D/g, ''), 10);
          const duration = 1800;
          const steps = 60;
          const increment = numeric / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numeric) {
              setCount(numeric);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Fake Sparkline ────────────────────────────────────────────── */
function Sparkline() {
  const points = [30, 55, 40, 70, 50, 85, 65, 90, 75, 95];
  const w = 200, h = 60;
  const max = Math.max(...points);
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - (p / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={coords}
        fill="none"
        stroke="#f97316"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Mini Bar Chart ────────────────────────────────────────────── */
function MiniBarChart() {
  const bars = [
    { h: 40, color: '#f97316' },
    { h: 65, color: '#fbbf24' },
    { h: 50, color: '#f97316' },
    { h: 80, color: '#fbbf24' },
    { h: 55, color: '#f97316' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, padding: '8px 0' }}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${b.h}%`,
            background: b.color,
            borderRadius: '3px 3px 0 0',
            opacity: 0.85,
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Dashboard Mockup ──────────────────────────────────────────── */
function DashboardMockup() {
  const rows = [
    { name: 'SKU-A1042', qty: 1240, status: 'In Stock', color: '#22c55e' },
    { name: 'SKU-B0391', qty: 87,   status: 'Low Stock', color: '#fbbf24' },
    { name: 'SKU-C2210', qty: 0,    status: 'Out of Stock', color: '#ef4444' },
    { name: 'SKU-D0055', qty: 530,  status: 'In Stock', color: '#22c55e' },
  ];

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #1e1e1e',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.08)',
      width: '100%',
      maxWidth: 480,
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px',
        background: '#0d0d0d',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#94a3b8', fontWeight: 500, letterSpacing: '0.05em' }}>
          Live Inventory
        </span>
      </div>

      {/* Table */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto',
          gap: '6px 12px', fontSize: 11,
          color: '#64748b', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 8,
          paddingBottom: 6, borderBottom: '1px solid #1a1a1a',
        }}>
          <span>Product</span><span>Qty</span><span>Status</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto',
            gap: '6px 12px', fontSize: 12, color: '#cbd5e1',
            padding: '6px 0', borderBottom: i < rows.length - 1 ? '1px solid #141414' : 'none',
            alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{r.name}</span>
            <span style={{ color: '#94a3b8', textAlign: 'right' }}>{r.qty.toLocaleString()}</span>
            <span style={{
              background: `${r.color}18`,
              color: r.color,
              border: `1px solid ${r.color}40`,
              borderRadius: 4, padding: '2px 6px',
              fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
            }}>{r.status}</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Weekly Movement
        </div>
        <MiniBarChart />
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: '#0d0d0d',
        borderTop: '1px solid #1a1a1a',
        fontSize: 11, color: '#475569',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%', background: '#22c55e',
          display: 'inline-block', boxShadow: '0 0 6px #22c55e',
          animation: 'pulse 2s infinite',
        }} />
        Last sync: just now
        <span style={{ marginLeft: 'auto', color: '#f97316', fontWeight: 600 }}>LIVE</span>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* shared animation variants */
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  const stagger = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55, ease: 'easeOut', delay },
  });

  /* ── styles ── */
  const s = {
    page: {
      background: '#0a0a0a',
      color: '#f1f5f9',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: 'hidden',
      minHeight: '100vh',
    },

    /* Navbar */
    nav: {
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(20px, 6vw, 100px)',
      height: 64,
      background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    },
    navLogo: {
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
    },
    logoBox: {
      width: 32, height: 32, background: '#f97316', borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 16, color: '#0a0a0a', letterSpacing: '-0.02em',
    },
    logoText: {
      fontWeight: 700, fontSize: 18, color: '#f1f5f9', letterSpacing: '-0.03em',
    },
    navLinks: {
      display: 'flex', alignItems: 'center', gap: 32,
    },
    navLink: {
      color: '#94a3b8', fontSize: 14, fontWeight: 500,
      cursor: 'pointer', textDecoration: 'none',
      transition: 'color 0.2s',
    },
    navActions: {
      display: 'flex', alignItems: 'center', gap: 12,
    },
    btnOutline: {
      padding: '8px 18px', borderRadius: 8,
      border: '1px solid rgba(249,115,22,0.5)',
      color: '#f97316', background: 'transparent',
      fontSize: 14, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.2s',
    },
    btnOrange: {
      padding: '8px 18px', borderRadius: 8,
      background: '#f97316', color: '#0a0a0a',
      border: 'none', fontSize: 14, fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.2s',
    },

    /* Hero */
    hero: {
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: '100px clamp(20px, 6vw, 100px) 80px',
      position: 'relative', overflow: 'hidden',
    },
    heroInner: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'center',
      gap: 'clamp(40px, 5vw, 80px)',
      width: '100%', maxWidth: 1280, margin: '0 auto',
    },
    heroLeft: {
      minWidth: 0,
    },
    heroRight: {
      minWidth: 0,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
    },
    pill: {
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(249,115,22,0.08)',
      border: '1px solid rgba(249,115,22,0.2)',
      borderRadius: 100, padding: '5px 14px',
      fontSize: 12, fontWeight: 600, color: '#f97316',
      marginBottom: 24, letterSpacing: '0.02em',
    },
    greenDot: {
      width: 7, height: 7, borderRadius: '50%',
      background: '#22c55e', boxShadow: '0 0 6px #22c55e',
    },
    heroHeading: {
      fontSize: 'clamp(34px, 4vw, 58px)',
      fontWeight: 800, lineHeight: 1.08,
      letterSpacing: '-0.04em', margin: '0 0 20px',
      color: '#f1f5f9',
    },
    heroGradient: {
      background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    heroSub: {
      fontSize: 'clamp(14px, 1.4vw, 17px)',
      color: '#94a3b8', lineHeight: 1.75,
      maxWidth: 460, margin: '0 0 32px',
    },
    heroCtas: {
      display: 'flex', alignItems: 'center', gap: 14,
      flexWrap: 'wrap', marginBottom: 36,
    },
    btnLarge: {
      padding: '13px 26px', borderRadius: 10,
      background: '#f97316', color: '#0a0a0a',
      border: 'none', fontSize: 15, fontWeight: 700,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      transition: 'all 0.2s',
    },
    btnGhost: {
      padding: '13px 24px', borderRadius: 10,
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#f1f5f9', fontSize: 15, fontWeight: 600,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
      transition: 'all 0.2s',
    },
    metricRow: {
      display: 'flex', gap: 12, flexWrap: 'wrap',
    },
    metricCard: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '14px 20px',
      display: 'flex', flexDirection: 'column', gap: 4,
      flex: '1 1 auto',
    },
    metricVal: {
      fontSize: 20, fontWeight: 800, color: '#f97316',
      letterSpacing: '-0.02em',
    },
    metricLabel: {
      fontSize: 12, color: '#64748b', fontWeight: 500,
    },
  };

  return (
    <div style={s.page}>
      {/* ── Keyframes injected ── */}
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
          50%       { opacity: 0.5; box-shadow: 0 0 12px #22c55e; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.6; }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-link-hover:hover { color: #f1f5f9 !important; }
        .btn-outline-hover:hover {
          background: rgba(249,115,22,0.08) !important;
          border-color: #f97316 !important;
        }
        .btn-orange-hover:hover { background: #ea6c0a !important; }
        .btn-large-hover:hover  { background: #ea6c0a !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(249,115,22,0.35) !important; }
        .btn-ghost-hover:hover  { background: rgba(255,255,255,0.06) !important; }
        .feature-card:hover {
          border-color: rgba(249,115,22,0.4) !important;
          background: rgba(249,115,22,0.04) !important;
          box-shadow: inset 3px 0 0 #f97316 !important;
          transform: translateY(-2px);
        }
        .workflow-step:hover .step-circle {
          background: rgba(249,115,22,0.2) !important;
          border-color: #f97316 !important;
        }
        /* Mobile nav */
        .mobile-menu {
          display: none;
          position: fixed; top: 64px; left: 0; right: 0; z-index: 99;
          background: rgba(10,10,10,0.97);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 20px clamp(16px,5vw,40px) 28px;
          flex-direction: column; gap: 4px;
          animation: fadeDown 0.2s ease;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu-link {
          padding: 12px 0; font-size: 16px; font-weight: 500;
          color: #94a3b8; cursor: pointer; border: none; background: none;
          text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: color 0.2s;
        }
        .mobile-menu-link:hover { color: #f1f5f9; }
        .mobile-menu-actions { display: flex; gap: 12px; margin-top: 16px; }
        .hamburger { display: none; }
        .nav-links-desktop { display: flex; }
        .nav-actions-desktop { display: flex; }
        @media (max-width: 768px) {
          .hamburger { display: flex !important; }
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop { display: none !important; }
          .hero-right { display: none !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-span2 { grid-column: span 1 !important; }
          .workflow-inner { flex-direction: column !important; align-items: center !important; }
          .workflow-connector { display: none !important; }
          .workflow-step { max-width: 100% !important; width: 100% !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cta-clip { clip-path: none !important; padding-top: 80px !important; padding-bottom: 80px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .metric-row { flex-direction: column !important; }
        }
        @media (min-width: 769px) and (max-width: 1100px) {
          .hero-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
          .bento-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bento-span2 { grid-column: span 2 !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav style={s.nav}>
        <div style={s.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={s.logoBox}>W</div>
          <span style={s.logoText}>WMS Pro</span>
        </div>

        <div style={s.navLinks} className="nav-links-desktop">
          {['Features', 'Workflow'].map(link => (
            <a key={link} style={s.navLink} className="nav-link-hover"
              href={`#${link.toLowerCase()}`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
              }}>
              {link}
            </a>
          ))}
        </div>

        <div style={s.navActions} className="nav-actions-desktop">
          <button style={s.btnOutline} className="btn-outline-hover" onClick={() => navigate('/login')}>
            Login
          </button>
          <button style={s.btnOrange} className="btn-orange-hover" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          style={{
            background: 'none', border: 'none', color: '#f1f5f9',
            cursor: 'pointer', padding: 8, display: 'none',
          }}>
          {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        {['Features', 'Workflow'].map(link => (
          <button key={link} className="mobile-menu-link"
            onClick={() => {
              setMobileMenuOpen(false);
              document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
            }}>
            {link}
          </button>
        ))}
        <div className="mobile-menu-actions">
          <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
            Login
          </button>
          <button style={{ ...s.btnOrange, flex: 1 }} onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
            Get Started
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={s.hero}>
        {/* Dot-grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          animation: 'dotPulse 4s ease-in-out infinite',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }} />
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '10%', left: '30%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ ...s.heroInner, position: 'relative', zIndex: 1 }} className="hero-grid">
          {/* LEFT */}
          <motion.div style={s.heroLeft} className="hero-left" {...stagger(0)}>
            <div style={s.pill}>
              <span style={s.greenDot} />
              v2.0 — Now with real-time sync
            </div>

            <h1 style={s.heroHeading}>
              Your Warehouse.<br />
              Fully Under<br />
              <span style={s.heroGradient}>Control.</span>
            </h1>

            <p style={s.heroSub}>
              WMS Pro gives your team complete visibility over every SKU, bin, and shipment —
              from receiving to dispatch, in real time.
            </p>

            <div style={s.heroCtas}>
              <button style={s.btnLarge} className="btn-large-hover" onClick={() => navigate('/register')}>
                Start Free Trial <FiArrowRight />
              </button>
              <button style={s.btnGhost} className="btn-ghost-hover">
                <FiPlay size={14} /> Watch Demo
              </button>
            </div>

            <div style={s.metricRow} className="metric-row">
              {[
                { val: '99.8%', label: 'Pick Accuracy' },
                { val: '< 2s',  label: 'Response Time' },
                { val: '6',     label: 'User Roles' },
              ].map(m => (
                <div key={m.label} style={s.metricCard}>
                  <span style={s.metricVal}>{m.val}</span>
                  <span style={s.metricLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Dashboard mockup */}
          <motion.div style={s.heroRight} className="hero-right"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}>
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MARQUEE TICKER
      ══════════════════════════════════════════ */}
      <div style={{
        borderTop: '1px solid rgba(249,115,22,0.3)',
        borderBottom: '1px solid rgba(249,115,22,0.3)',
        background: '#0d0d0d',
        overflow: 'hidden', padding: '14px 0',
      }}>
        <div style={{
          display: 'flex', width: 'max-content',
          animation: 'marqueeScroll 28s linear infinite',
        }}>
          {[...Array(2)].map((_, rep) => (
            <div key={rep} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {[
                '✦ Real-time Sync', '✦ Multi-Warehouse', '✦ Role-Based Access',
                '✦ Audit Trails', '✦ Barcode Scanning', '✦ Expiry Alerts',
                '✦ GRN Management', '✦ Stock Transfers',
              ].map((item, idx) => (
                <span key={`${rep}-${idx}`} style={{
                  padding: '0 32px', fontSize: 13, fontWeight: 600,
                  color: '#94a3b8', whiteSpace: 'nowrap', letterSpacing: '0.04em',
                }}>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS ROW
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(20px, 6vw, 100px)',
        width: '100%',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div {...fadeUp} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 40,
        }} className="stats-grid">
          {[
            { num: '10,000', suffix: '+', label: 'Products Tracked' },
            { num: '500',    suffix: '+', label: 'Daily Orders' },
            { num: '99',     suffix: '%', label: 'Pick Accuracy' },
            { num: '50',     suffix: '+', label: 'Warehouses' },
          ].map((stat, i) => (
            <motion.div key={stat.label} {...stagger(i * 0.1)} style={{
              borderLeft: '3px solid #f97316',
              paddingLeft: 24,
            }}>
              <div style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800, color: '#f97316',
                letterSpacing: '-0.04em', lineHeight: 1,
              }}>
                <AnimatedCounter target={stat.num.replace(/,/g, '')} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 8, fontWeight: 500 }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES BENTO GRID
      ══════════════════════════════════════════ */}
      <section id="features" style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(20px, 6vw, 100px)',
        background: '#080808',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{ marginBottom: 56, maxWidth: 560 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: '#f97316',
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              Platform Features
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
              letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0,
            }}>
              Everything your warehouse needs, nothing it doesn't.
            </h2>
          </motion.div>

          {/* Bento grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }} className="bento-grid">

            {/* Large card — spans 2 cols */}
            <motion.div {...stagger(0)} className="feature-card bento-span2" style={{
              gridColumn: 'span 2',
              background: '#0f0f0f',
              border: '1px solid #1a1a1a',
              borderRadius: 16, padding: 32,
              transition: 'all 0.25s ease',
              cursor: 'default',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(249,115,22,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <FiZap size={22} color="#f97316" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                Real-time Inventory
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 400 }}>
                Every stock movement — inbound, outbound, transfer — reflected instantly across all users and warehouses.
                No refresh needed, no stale data.
              </p>
              <Sparkline />
              <div style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
                Stock level trend — last 10 days
              </div>
            </motion.div>

            {/* Smart Bin Management */}
            <motion.div {...stagger(0.05)} className="feature-card" style={{
              background: '#0f0f0f', border: '1px solid #1a1a1a',
              borderRadius: 16, padding: 28,
              transition: 'all 0.25s ease', cursor: 'default',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(251,191,36,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                <FiLayers size={20} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Smart Bin Management
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Zone', 'Rack', 'Shelf', 'Bin'].map((level, i) => (
                  <div key={level} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    paddingLeft: i * 12,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: i === 0 ? '#f97316' : i === 1 ? '#fbbf24' : i === 2 ? '#94a3b8' : '#475569',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 13, color: i === 0 ? '#f1f5f9' : '#94a3b8', fontWeight: i === 0 ? 600 : 400 }}>
                      {level}
                    </span>
                    {i < 3 && (
                      <span style={{ fontSize: 11, color: '#334155', marginLeft: 'auto' }}>
                        {['A-01', 'R-04', 'S-02', 'B-07'][i]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Role-Based Access */}
            <motion.div {...stagger(0.1)} className="feature-card" style={{
              background: '#0f0f0f', border: '1px solid #1a1a1a',
              borderRadius: 16, padding: 28,
              transition: 'all 0.25s ease', cursor: 'default',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(249,115,22,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                <FiShield size={20} color="#f97316" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Role-Based Access
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Admin', 'Manager', 'Picker', 'Receiver', 'Auditor', 'Viewer'].map((role, i) => (
                  <span key={role} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: i === 0 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                    color: i === 0 ? '#f97316' : '#94a3b8',
                    border: `1px solid ${i === 0 ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                    {role}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Audit Logs */}
            <motion.div {...stagger(0.15)} className="feature-card" style={{
              background: '#0f0f0f', border: '1px solid #1a1a1a',
              borderRadius: 16, padding: 28,
              transition: 'all 0.25s ease', cursor: 'default',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(148,163,184,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                <FiFileText size={20} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Audit Logs
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Every action timestamped and attributed. Full traceability for compliance and accountability.
              </p>
            </motion.div>

            {/* Expiry Alerts */}
            <motion.div {...stagger(0.2)} className="feature-card" style={{
              background: '#0f0f0f', border: '1px solid #1a1a1a',
              borderRadius: 16, padding: 28,
              transition: 'all 0.25s ease', cursor: 'default',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(251,191,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                <FiAlertTriangle size={20} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Expiry Alerts
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Proactive notifications before stock expires. Reduce waste and stay compliant automatically.
              </p>
            </motion.div>

            {/* Stock Transfers */}
            <motion.div {...stagger(0.25)} className="feature-card" style={{
              background: '#0f0f0f', border: '1px solid #1a1a1a',
              borderRadius: 16, padding: 28,
              transition: 'all 0.25s ease', cursor: 'default',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'rgba(249,115,22,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 18,
              }}>
                <FiRepeat size={20} color="#f97316" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Stock Transfers
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Move stock between warehouses or bins with full audit trail and real-time balance updates.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WORKFLOW — Horizontal Timeline
      ══════════════════════════════════════════ */}
      <section id="workflow" style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(20px, 6vw, 100px)',
        maxWidth: 1280, margin: '0 auto', width: '100%',
      }}>
        <motion.div {...fadeUp} style={{ marginBottom: 56, textAlign: 'center' }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: '#f97316',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            How It Works
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0,
          }}>
            From dock to dispatch in four steps.
          </h2>
        </motion.div>

        <motion.div {...fadeUp} style={{
          display: 'flex', alignItems: 'flex-start',
          gap: 0, position: 'relative', flexWrap: 'wrap',
          justifyContent: 'center',
        }} className="workflow-inner">
          {[
            {
              num: '01', title: 'Receive GRN',
              desc: 'Log incoming goods with supplier details, quantities, and batch info.',
              icon: <FiBox size={18} color="#f97316" />,
            },
            {
              num: '02', title: 'Verify & Store',
              desc: 'Inspect items, assign bin locations, and confirm putaway.',
              icon: <FiCheckCircle size={18} color="#f97316" />,
            },
            {
              num: '03', title: 'Track Stock',
              desc: 'Monitor levels, movements, and alerts across all locations in real time.',
              icon: <FiBarChart2 size={18} color="#f97316" />,
            },
            {
              num: '04', title: 'Pick & Ship',
              desc: 'Fulfill orders with guided picking, packing, and dispatch confirmation.',
              icon: <FiRepeat size={18} color="#f97316" />,
            },
          ].map((step, i, arr) => (
            <div key={step.num} className="workflow-step" style={{
              display: 'flex', alignItems: 'flex-start', flex: '1 1 200px',
              minWidth: 180, maxWidth: 280,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                {/* Circle */}
                <div className="step-circle" style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(249,115,22,0.1)',
                  border: '2px solid rgba(249,115,22,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative', zIndex: 1,
                  marginBottom: 20, transition: 'all 0.2s',
                }}>
                  <span style={{
                    fontSize: 16, fontWeight: 800, color: '#f97316',
                    letterSpacing: '-0.02em',
                  }}>{step.num}</span>
                </div>
                {/* Content */}
                <div style={{ textAlign: 'center', padding: '0 12px' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#f1f5f9' }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
              {/* Connector line */}
              {i < arr.length - 1 && (
                <div className="workflow-connector" style={{
                  width: 40, height: 2, flexShrink: 0,
                  borderTop: '2px dashed rgba(249,115,22,0.25)',
                  marginTop: 27, alignSelf: 'flex-start',
                }} />
              )}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIAL / QUOTE
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(20px, 6vw, 100px)',
        background: '#080808',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{
            background: '#0f0f0f',
            border: '1px solid #1a1a1a',
            borderRadius: 20, padding: 'clamp(32px, 5vw, 56px)',
            textAlign: 'center', position: 'relative',
          }}>
            <div style={{
              fontSize: 80, lineHeight: 1, color: '#f97316',
              fontFamily: 'Georgia, serif', marginBottom: 16,
              opacity: 0.5, display: 'block',
            }}>
              "
            </div>
            <p style={{
              fontSize: 'clamp(17px, 2.5vw, 22px)',
              color: '#cbd5e1', lineHeight: 1.7,
              fontStyle: 'italic', margin: '0 0 32px',
              fontWeight: 400,
            }}>
              WMS Pro cut our picking errors by 94% in the first month. The real-time sync
              means our floor team and office team are always looking at the same data.
              It's the first system that actually fits how a warehouse operates.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 16, color: '#0a0a0a',
              }}>
                R
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                  Rajan Mehta
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Head of Operations, NovaDist Logistics
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA — Diagonal clip-path
      ══════════════════════════════════════════ */}
      <section className="cta-clip" style={{
        padding: 'clamp(100px, 12vw, 140px) clamp(20px, 6vw, 100px)',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(251,191,36,0.06) 100%)',
        clipPath: 'polygon(0 8%, 100% 0%, 100% 92%, 0% 100%)',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.4,
        }} />
        <motion.div {...fadeUp} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            margin: '0 0 16px',
          }}>
            Ready to take control of<br />
            <span style={s.heroGradient}>your warehouse?</span>
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)', color: '#94a3b8',
            margin: '0 auto 40px', maxWidth: 480, lineHeight: 1.6,
          }}>
            Join hundreds of warehouses already running on WMS Pro.
            Set up in minutes, scale without limits.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              ...s.btnLarge,
              padding: '16px 36px', fontSize: 16,
            }} className="btn-large-hover" onClick={() => navigate('/register')}>
              Start Free Trial <FiArrowRight />
            </button>
            <button style={{
              ...s.btnGhost,
              padding: '15px 32px', fontSize: 16,
            }} className="btn-ghost-hover" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{
        padding: 'clamp(24px, 4vw, 40px) clamp(20px, 6vw, 100px)',
        borderTop: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={s.navLogo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={s.logoBox}>W</div>
          <span style={s.logoText}>WMS Pro</span>
        </div>

        <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
          © {new Date().getFullYear()} WMS Pro. All rights reserved.
        </div>

        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
          Built for modern warehouses.
        </div>
      </footer>

    </div>
  );
}
