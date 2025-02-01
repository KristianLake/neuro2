import { User } from '../types/auth';
import { logError } from '../utils/errorHandling';
import { rateLimit } from './rateLimit';

interface AdminAuthConfig {
  allowedRoles: string[];
  requireMFA?: boolean;
  ipWhitelist?: string[];
  maxSessionAge?: number;
}

export class AdminAuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export const adminAuth = (config: AdminAuthConfig) => {
  return async (user: User | null, ip?: string) => {
    try {
      // Check if user exists
      if (!user) {
        throw new AdminAuthError('Authentication required', 'AUTH_REQUIRED');
      }

      // Rate limit check
      const { success, error } = await rateLimit('admin')(user.id);
      if (!success) {
        throw new AdminAuthError(error || 'Rate limit exceeded', 'RATE_LIMIT');
      }

      // Role check
      if (!config.allowedRoles.includes(user.role)) {
        throw new AdminAuthError('Insufficient permissions', 'FORBIDDEN');
      }

      // IP whitelist check
      if (config.ipWhitelist && ip && !config.ipWhitelist.includes(ip)) {
        throw new AdminAuthError('Access denied from this IP', 'IP_FORBIDDEN');
      }

      // Session age check
      if (config.maxSessionAge) {
        const lastSignIn = user.last_sign_in_at || user.created_at;
        const sessionStart = new Date(lastSignIn).getTime();
        const now = Date.now();
        if (now - sessionStart > config.maxSessionAge) {
          throw new AdminAuthError('Session expired', 'SESSION_EXPIRED');
        }
      }

      return { success: true };
    } catch (error) {
      logError(error as Error, {
        userId: user?.id,
        ip,
        context: 'adminAuth'
      });
      throw error;
    }
  };
};