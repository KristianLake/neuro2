import { useAuth } from '../contexts/AuthContext';
import { adminAuth } from '../middleware/adminAuth';
import { useCallback } from 'react';

const ADMIN_CONFIG = {
  allowedRoles: ['admin'],
  requireMFA: true,
  maxSessionAge: 24 * 60 * 60 * 1000, // 24 hours
  ipWhitelist: import.meta.env.VITE_ADMIN_IP_WHITELIST?.split(',')
};

export function useAdminAuth() {
  const { user } = useAuth();

  const checkAdminAccess = useCallback(async (ip?: string) => {
    return adminAuth(ADMIN_CONFIG)(user, ip);
  }, [user]);

  return {
    checkAdminAccess,
    isAdmin: user?.role === 'admin'
  };
}