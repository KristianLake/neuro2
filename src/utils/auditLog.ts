import { supabase } from '../lib/supabase';
import { User } from '../types/auth';
import { logError } from './errorHandling';

export interface AuditLogEntry {
  action: string;
  userId: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private readonly TABLE_NAME = 'audit_logs';

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          action: entry.action,
          user_id: entry.userId,
          target_id: entry.targetId,
          target_type: entry.targetType,
          details: entry.details,
          ip_address: entry.ip,
          user_agent: entry.userAgent,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      logError(error as Error, {
        context: 'auditLog',
        entry
      });
    }
  }

  public async getAuditTrail(
    options: {
      userId?: string;
      action?: string;
      targetId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.action) {
        query = query.eq('action', options.action);
      }
      if (options.targetId) {
        query = query.eq('target_id', options.targetId);
      }
      if (options.startDate) {
        query = query.gte('created_at', options.startDate.toISOString());
      }
      if (options.endDate) {
        query = query.lte('created_at', options.endDate.toISOString());
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      logError(error as Error, {
        context: 'getAuditTrail',
        options
      });
      throw error;
    }
  }
}

export const auditLogger = AuditLogger.getInstance();