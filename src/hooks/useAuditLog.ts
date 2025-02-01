import { useState } from 'react';
import { auditLogger } from '../utils/auditLog';
import { useAdminAuth } from './useAdminAuth';

export function useAuditLog() {
  const { isAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuditLogs = async (options: {
    userId?: string;
    action?: string;
    targetId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) => {
    if (!isAdmin) {
      throw new Error('Unauthorized');
    }

    setLoading(true);
    setError(null);

    try {
      const logs = await auditLogger.getAuditTrail(options);
      return logs;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch audit logs';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    getAuditLogs,
    loading,
    error
  };
}