/**
 * Settings Page
 * Profile, password change, user management (admin)
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiLock, FiUsers, FiSun, FiMoon, FiSave } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ROLE_LABELS } from '../utils/constants';

const SettingsPage = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const { register: regProfile, handleSubmit: handleProfile } = useForm({ defaultValues: { name: user?.name } });
  const { register: regPass, handleSubmit: handlePass, reset: resetPass } = useForm();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authAPI.getUsers({ limit: 50 }),
    enabled: isAdmin() && activeTab === 'users',
    select: (res) => res.data.data?.users || [],
  });

  const profileMutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (res) => { updateUser(res.data.data.user); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const passMutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => { toast.success('Password changed!'); resetPass(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, data }) => authAPI.updateUserRole(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['users']); toast.success('Role updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const tabs = [
    { key: 'profile', label: 'Profile', icon: FiUser },
    { key: 'security', label: 'Security', icon: FiLock },
    { key: 'appearance', label: 'Appearance', icon: isDark ? FiMoon : FiSun },
    ...(isAdmin() ? [{ key: 'users', label: 'User Management', icon: FiUsers }] : []),
  ];

  return (
    <div className="page-container">
      <PageHeader title="Settings" subtitle="Manage your account and system preferences" breadcrumb="Settings" />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Sidebar tabs */}
        <div className="card" style={{ padding: '8px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '8px', border: 'none',
                background: activeTab === tab.key ? 'rgba(249,115,22,0.1)' : 'transparent',
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeTab === tab.key ? '600' : '400',
                textAlign: 'left', transition: 'all 0.2s', marginBottom: '2px',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Profile */}
          {activeTab === 'profile' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '24px' }}>Profile Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '800', fontSize: '1.5rem',
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{user?.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</div>
                  <Badge label={ROLE_LABELS[user?.role] || user?.role} type="primary" />
                </div>
              </div>

              <form onSubmit={handleProfile((data) => profileMutation.mutate(data))}>
                <div style={{ display: 'grid', gap: '16px', maxWidth: '480px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                    <input {...regProfile('name')} className="input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email (read-only)</label>
                    <input value={user?.email} disabled className="input" style={{ opacity: 0.6 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Role (read-only)</label>
                    <input value={ROLE_LABELS[user?.role] || user?.role} disabled className="input" style={{ opacity: 0.6 }} />
                  </div>
                  <button type="submit" disabled={profileMutation.isPending} className="btn btn-primary" style={{ width: 'fit-content' }}>
                    <FiSave size={15} /> {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '24px' }}>Change Password</h3>
              <form onSubmit={handlePass((data) => passMutation.mutate(data))}>
                <div style={{ display: 'grid', gap: '16px', maxWidth: '480px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Current Password</label>
                    <input {...regPass('currentPassword', { required: true })} type="password" className="input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>New Password</label>
                    <input {...regPass('newPassword', { required: true, minLength: 6 })} type="password" className="input" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={passMutation.isPending} className="btn btn-primary" style={{ width: 'fit-content' }}>
                    <FiLock size={15} /> {passMutation.isPending ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '24px' }}>Appearance</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { label: 'Light Mode', value: false, icon: FiSun },
                  { label: 'Dark Mode', value: true, icon: FiMoon },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    onClick={() => opt.value !== isDark && toggleTheme()}
                    style={{
                      padding: '20px 28px', borderRadius: '12px', cursor: 'pointer',
                      border: `2px solid ${isDark === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: isDark === opt.value ? 'rgba(249,115,22,0.08)' : 'var(--card)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <opt.icon size={24} style={{ color: isDark === opt.value ? 'var(--primary)' : 'var(--text-secondary)' }} />
                    <span style={{ fontWeight: '600', fontSize: '0.875rem', color: isDark === opt.value ? 'var(--primary)' : 'var(--text)' }}>
                      {opt.label}
                    </span>
                    {isDark === opt.value && <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Active</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && isAdmin() && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '24px' }}>User Management</h3>
              {usersLoading ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '8px' }} />)}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(usersData || []).map((u) => (
                    <div key={u._id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '10px',
                      border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: '700', fontSize: '0.875rem',
                        }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                          value={u.role}
                          onChange={(e) => roleMutation.mutate({ id: u._id, data: { role: e.target.value, isActive: u.isActive } })}
                          className="input"
                          style={{ width: 'auto', height: '34px', fontSize: '0.8rem' }}
                          disabled={u._id === user?._id}
                        >
                          {Object.entries(ROLE_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                        <Badge label={u.isActive ? 'Active' : 'Inactive'} type={u.isActive ? 'success' : 'error'} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
