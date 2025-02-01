import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  BASE_URL: z.string().url().optional(),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

// Validate environment variables
const validateEnv = () => {
  try {
    return envSchema.parse({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
      MODE: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
};

// Export validated environment
export const env = validateEnv();

// Environment-specific configurations
export const config = {
  api: {
    baseUrl: env.VITE_SUPABASE_URL,
    timeout: 15000,
    retries: 3,
  },
  auth: {
    sessionDuration: 3600, // 1 hour
    refreshThreshold: 300, // 5 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 900, // 15 minutes
  },
  security: {
    passwordMinLength: 12,
    passwordRequirements: {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    },
    rateLimits: {
      api: 100, // requests per minute
      auth: 5,  // attempts per 15 minutes
    },
  },
  monitoring: {
    logLevel: env.PROD ? 'error' : 'debug',
    sampleRate: env.PROD ? 0.1 : 1.0,
  },
};