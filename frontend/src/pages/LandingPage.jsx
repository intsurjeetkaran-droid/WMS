/**
 * Landing Page
 * Unique hero with animations, stats, features, workflow, CTA
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage, FiBarChart2, FiBell, FiZap, FiArrowRight,
  FiCheckCircle, FiTruck, FiBox, FiRepeat, FiShield
} from 'react-icons/fi';

// Animated counter
const Counter = ({ end, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1500;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: FiBox, title: 'Inventory Tracking', desc: 'Real-time stock levels across all warehouses with instant alerts.' },
    { icon: FiPackage, title: 'Smart Storage', desc: 'Hierarchical bin management: Zone → Rack → Shelf → Bin.' },
    { icon: FiBell, title: 'Real-time Alerts', desc: 'Low stock, expiry warnings, and delayed order notifications.' },
    { icon: FiBarChart2, title: 'Barcode System', desc: 'Scan-based entry to reduce manual errors and speed up operations.' },
    { icon: FiShield, title: 'Audit Logs', desc: 'Complete action history with before/after state tracking.' },
    { icon: FiRepeat, title: 'Stock Movement', desc: 'Full transfer history with bin-to-bin movement tracking.' },
  ];

  const workflow = [
    { icon: FiTruck, label: 'Receive', desc: 'Goods arrive from supplier' },
    { icon: FiBox, label: 'Store', desc: 'Assign to bin locations' },
    { icon: FiBarChart2, label: 'Track', desc: 'Monitor in real-time' },
    { icon: FiZap, label: 'Ship', desc: 'Pick, pack and dispatch' },
  ];

  const stats = [
    { value: 10000, suffix: '+', label: 'Products Tracked' },
    { value: 500, suffix: '+', label: 'Daily Orders' },
    { value: 99, suffix: '%', label: 'Accuracy Rate' },
    { value: 50, suffix: '+', label: 'Warehouses' },
  ];

  return (
    <div style={{ background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #f97316, #fbbf24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '18px', color: 'white',
          }}>W</div>
          <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>WMS Pro</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: '#f1f5f9', padding: '8px 20px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#f1f5f9'; }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none', color: 'white', padding: '8px 20px',
              borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
              transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '120px 40px 80px', textAlign: 'center', position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '800px', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: '9999px', padding: '6px 16px', marginBottom: '24px',
            fontSize: '0.8rem', color: '#f97316', fontWeight: '600',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', animation: 'pulse-glow 2s infinite' }} />
            Real-time Warehouse Intelligence
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '800',
            lineHeight: 1.1, marginBottom: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Smart Warehouse<br />
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #fbbf24)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Management System</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: '#94a3b8',
            marginBottom: '40px', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 40px',
          }}>
            Track. Manage. Optimize inventory in real-time.<br />
            Built for modern warehouses with role-based access and full audit trails.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                border: 'none', color: 'white', padding: '14px 32px',
                borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: '700',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(249,115,22,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(249,115,22,0.4)'; }}
            >
              Get Started Free <FiArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f1f5f9', padding: '14px 32px', borderRadius: '10px',
                cursor: 'pointer', fontSize: '1rem', fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800',
                  background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                }}>
                  <Counter end={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: '800', marginBottom: '16px' }}>
              Everything you need to manage your warehouse
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              From receiving goods to shipping orders — all in one platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px', padding: '28px',
                  transition: 'all 0.3s', cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(249,115,22,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(249,115,22,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <f.icon size={22} style={{ color: '#f97316' }} />
                </div>
                <h3 style={{ fontWeight: '700', marginBottom: '8px', fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: '800', marginBottom: '16px' }}>
            Simple, powerful workflow
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '60px' }}>Four steps from receiving to shipping</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0' }}>
            {workflow.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0 20px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,191,36,0.1))',
                    border: '2px solid rgba(249,115,22,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <step.icon size={28} style={{ color: '#f97316' }} />
                  </div>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>{step.label}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{step.desc}</div>
                </div>
                {i < workflow.length - 1 && (
                  <div style={{ color: '#f97316', fontSize: '1.5rem', padding: '0 8px', marginBottom: '32px' }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: '800', marginBottom: '16px' }}>
            Start Managing Your Warehouse
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '1rem' }}>
            Join thousands of warehouses already using WMS Pro to streamline operations.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              border: 'none', color: 'white', padding: '16px 40px',
              borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '700',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 8px 32px rgba(249,115,22,0.4)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(249,115,22,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(249,115,22,0.4)'; }}
          >
            Get Started Now <FiArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>© 2024 WMS Pro. All rights reserved.</span>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Built for modern warehouses</span>
      </footer>
    </div>
  );
};

export default LandingPage;
