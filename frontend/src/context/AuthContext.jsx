/**
 * Auth Context
 * Global authentication state management
 * Provides user, token, login/logout functions
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wms_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('wms_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.data.user);
        } catch {
          localStorage.removeItem('wms_token');
          localStorage.removeItem('wms_user');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user, token } = res.data.data;
    localStorage.setItem('wms_token', token);
    localStorage.setItem('wms_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    toast.success(`Welcome back, ${user.name}!`);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('wms_token');
    localStorage.removeItem('wms_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('wms_user', JSON.stringify(updatedUser));
  }, []);

  // Role checks
  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.role === 'super_admin';
  }, [user]);

  const canWrite = useCallback(() => {
    return user && ['super_admin', 'warehouse_manager', 'inventory_manager', 'staff'].includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      hasRole,
      isAdmin,
      canWrite,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
