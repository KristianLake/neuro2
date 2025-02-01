# API Rate Limiting

## Configuration
### Default Limits
```typescript
interface RateLimitConfig {
  window: string;
  max: number;
  message?: string;
}

const rateLimits: Record<string, RateLimitConfig> = {
  public: {
    window: '15m',
    max: 100,
    message: 'Too many requests from this IP'
  },
  authenticated: {
    window: '15m',
    max: 1000,
    message: 'Too many requests from this user'
  },
  premium: {
    window: '15m',
    max: 5000,
    message: 'Premium tier rate limit exceeded'
  }
};
```

### Rate Limit Headers
```typescript
interface RateLimitHeaders {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
  'X-RateLimit-Reset': number;
  'Retry-After'?: number;
}

function setRateLimitHeaders(res: Response, limit: RateLimitInfo): void {
  const headers: RateLimitHeaders = {
    'X-RateLimit-Limit': limit.max,
    'X-RateLimit-Remaining': limit.remaining,
    'X-RateLimit-Reset': limit.reset
  };

  if (limit.exceeded) {
    headers['Retry-After'] = Math.ceil((limit.reset - Date.now()) / 1000);
  }

  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value.toString());
  });
}
```

## Implementation
### 1. Middleware Setup
```typescript
interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

const rateLimit = (options: RateLimitOptions) => 
  async (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const limit = await getRateLimit(key, options);
    
    if (limit.exceeded) {
      const error = new AppError(
        'RATE_LIMIT_EXCEEDED',
        options.message || 'Too many requests',
        429
      );
      
      setRateLimitHeaders(res, limit);
      return next(error);
    }
    
    setRateLimitHeaders(res, limit);
    next();
  };
```

### 2. Route Configuration
```typescript
// Public routes
app.use('/api/public', rateLimit({
  ...rateLimits.public,
  skipSuccessfulRequests: true
}));

// Authenticated routes
app.use('/api/auth', rateLimit({
  ...rateLimits.authenticated,
  skipFailedRequests: true
}));

// Premium routes
app.use('/api/premium', rateLimit({
  ...rateLimits.premium,
  skipFailedRequests: true
}));
```

## Monitoring
### 1. Rate Limit Metrics
```typescript
interface RateLimitMetrics {
  total: number;
  exceeded: number;
  remaining: number;
  resetAt: Date;
}

async function getRateLimitMetrics(key: string): Promise<RateLimitMetrics> {
  // Implementation
}

// Monitor rate limits
setInterval(async () => {
  const metrics = await getRateLimitMetrics('global');
  Logger.info('Rate limit metrics', metrics);
}, 60000);
```

### 2. Alerts
```typescript
interface RateLimitAlert {
  type: 'warning' | 'critical';
  message: string;
  threshold: number;
  current: number;
}

async function checkRateLimitAlerts(): Promise<RateLimitAlert[]> {
  const metrics = await getRateLimitMetrics('global');
  const alerts: RateLimitAlert[] = [];

  if (metrics.exceeded > 1000) {
    alerts.push({
      type: 'critical',
      message: 'High rate of exceeded limits',
      threshold: 1000,
      current: metrics.exceeded
    });
  }

  if (metrics.remaining < 100) {
    alerts.push({
      type: 'warning',
      message: 'Low remaining rate limits',
      threshold: 100,
      current: metrics.remaining
    });
  }

  return alerts;
}

// Monitor for alerts
setInterval(async () => {
  const alerts = await checkRateLimitAlerts();
  alerts.forEach(alert => {
    Logger.warn('Rate limit alert', alert);
  });
}, 300000);
```