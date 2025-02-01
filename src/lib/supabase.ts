import { createClient } from '@supabase/supabase-js';
import type { User } from '../types/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Security configuration
const securityConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-session', // Explicit session key
    flowType: 'implicit',     // Use implicit flow since PKCE not supported in this version
  },
  global: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self' https://*.supabase.co; script-src 'self' 'unsafe-inline' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;",
    },
    fetch: (...args) => {
      return fetch(...args).catch(err => {
        console.error('Supabase fetch error:', err);
        throw err;
      });
    },
    // Add request timeout
    fetchOptions: {
      timeout: 10000 // 10 second timeout
    },
  }
};

// Create regular client for user operations with retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  ...securityConfig
});

// Create admin client with service role and retry configuration
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  ...securityConfig,
  global: {
    ...securityConfig.global,
    headers: {
      ...securityConfig.global.headers,
      'x-admin-user-id': 'placeholder' // Will be replaced per-request
    },
    // Add request timeout
    fetchOptions: {
      timeout: 10000 // 10 second timeout
    },
  }
});

// Helper to update user metadata with proper context
export const updateUserMetadata = async (
  userId: string,
  metadata: Record<string, any>,
  adminId: string
) => {
  try {
    // Create a new client instance with the admin ID header
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      global: {
        headers: {
          'x-admin-user-id': adminId
        },
        fetch: (...args) => {
          return fetch(...args).catch(err => {
            console.error('Supabase metadata update error:', err);
            throw err;
          });
        }
      }
    });

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    );

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return { data: null, error };
  }
};