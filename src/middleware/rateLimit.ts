// Simple in-memory rate limiter implementation
interface RateLimitConfig {
  points: number;      // Number of points
  duration: number;    // Per duration in seconds
  blockDuration?: number; // Block duration in seconds
}

// Rate limiter instances
const limiters: Record<string, RateLimitConfig> = {
  api: {
    points: 100,       // 100 requests
    duration: 60,      // per 60 seconds
    blockDuration: 60  // Block for 60 seconds if exceeded
  },
  admin: {
    points: 60,        // 60 attempts
    duration: 60,      // per minute
    blockDuration: 300 // Block for 5 minutes if exceeded
  },
  auth: {
    points: 5,         // 5 attempts
    duration: 900,     // per 15 minutes
    blockDuration: 900 // Block for 15 minutes if exceeded
  }
};

// Store for rate limits
const rateLimitStore = new Map<string, {
  points: number;
  resetTime: number;
  blockedUntil?: number;
}>();

// Rate limit middleware
export const rateLimit = (type: keyof typeof limiters) => {
  const limiter = limiters[type];
  
  if (!limiter) {
    throw new Error(`Unknown rate limit type: ${type}`);
  }

  return async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const key = `${type}:${userId}`;
    const now = Date.now();

    // Ensure limiter exists
    if (!limiter) {
      console.error(`Rate limiter not found for type: ${type}`);
      return { success: true }; // Fail open in development
    }
    
    // Get current state
    let state = rateLimitStore.get(key);
    
    // Clean up expired state
    if (state && now > state.resetTime) {
      state = undefined;
    }
    
    // Check if blocked
    if (state?.blockedUntil && now < state.blockedUntil) {
      const retryAfter = Math.ceil((state.blockedUntil - now) / 1000);
      return {
        success: false,
        error: `Too many requests. Please try again in ${retryAfter} seconds.`
      };
    }
    
    // Initialize state if needed
    if (!state) {
      state = {
        points: limiter.points,
        resetTime: now + (limiter.duration * 1000)
      };
      rateLimitStore.set(key, state);
    }
    
    // Check points
    if (state.points <= 0) {
      // Block if duration specified
      if (limiter.blockDuration) {
        state.blockedUntil = now + (limiter.blockDuration * 1000);
      }
      
      const retryAfter = Math.ceil(
        ((state.blockedUntil || state.resetTime) - now) / 1000
      );
      
      return {
        success: false,
        error: `Too many requests. Please try again in ${retryAfter} seconds.`
      };
    }
    
    // Consume point
    state.points--;
    rateLimitStore.set(key, state);
    
    return { success: true };
  };
};

// Helper to check rate limit without consuming points
export const checkRateLimit = async (type: keyof typeof limiters, userId: string): Promise<boolean> => {
  const key = `${type}:${userId}`;
  const state = rateLimitStore.get(key);
  const now = Date.now();
  
  if (!state || now > state.resetTime) {
    return true;
  }
  
  if (state.blockedUntil && now < state.blockedUntil) {
    return false;
  }
  
  return state.points > 0;
};