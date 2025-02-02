import { useAuth } from '../contexts/AuthContext';
import { rateLimit } from '../middleware/rateLimit';
import { logError } from '../utils/errorHandling';
import { supabase } from '../lib/supabase';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  rateLimit?: boolean;
  timeout?: number;
  retries?: number;
}

export function useApi() {
  const { user } = useAuth();

  const api = async <T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      body,
      headers = {},
      rateLimit: shouldRateLimit = true,
      timeout = 10000,
      retries = 3
    } = options;

    try {
      // Rate limiting
      if (shouldRateLimit && user) {
        const { success, error } = await rateLimit('api')(user.id);
        if (!success) {
          throw new Error(error);
        }
      }

      // Add security headers
      const secureHeaders = {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        ...headers
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make request with retries
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          const { data, error } = await supabase
            .from(endpoint)
            .select('*')
            .single()
            .abortSignal(controller.signal);

          if (error) throw error;
          return data as T;
        } catch (error) {
          lastError = error;
          if (i < 2) { // Don't delay on last attempt
            await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
          }
        }
      }
      throw lastError;
    } catch (error) {
      logError(error as Error, {
        endpoint,
        method,
        userId: user?.id
      });
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return { api };
}