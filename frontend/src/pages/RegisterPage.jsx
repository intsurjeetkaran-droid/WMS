/**
 * Register Page
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.register({ name: data.name, email: data.email, password: data.password });
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '11px 14px 11px 38px',
    background: '#111', border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px', color: 'white', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit',
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative',
    }}>
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none',
          marginBottom: '32px', transition: 'color 0.2s',
        }}>
          <FiArrowLeft size={14} /> Back to home
        </Link>

        <div style={{
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px', padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #f97316, #fbbf24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '24px', fontWeight: '800', color: 'white',
            }}>W</div>
            <h1 style={{ color: 'white', fontWeight: '800', fontSize: '1.5rem', marginBottom: '6px' }}>Create account</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Start managing your warehouse today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                  type="text" placeholder="John Doe"
                  style={inputStyle(errors.name)}
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = errors.name ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
              </div>
              {errors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  type="email" placeholder="you@example.com"
                  style={inputStyle(errors.email)}
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
              </div>
              {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  style={{ ...inputStyle(errors.password), paddingRight: '40px' }}
                  onFocus={(e) => e.target.style.borderColor = '#f97316'}
                  onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#7c3a1a' : 'linear-gradient(135deg, #f97316, #ea580c)',
                border: 'none', borderRadius: '10px', color: 'white',
                fontSize: '0.9rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(249,115,22,0.3)',
              }}
            >
              {loading ? (
                <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#f97316', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
