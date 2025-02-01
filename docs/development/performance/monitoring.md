# Performance Monitoring Guidelines

## Key Metrics
### 1. Application Metrics
```typescript
interface AppMetrics {
  response: {
    avg: number;
    p95: number;
    p99: number;
  };
  errors: {
    rate: number;
    count: number;
    types: Record<string, number>;
  };
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  database: {
    queryTime: number;
    connections: number;
    poolSize: number;
  };
}

// Collect application metrics
async function collectAppMetrics(): Promise<AppMetrics> {
  return {
    response: await getResponseMetrics(),
    errors: await getErrorMetrics(),
    resources: await getResourceMetrics(),
    database: await getDatabaseMetrics()
  };
}
```

### 2. User Experience Metrics
```typescript
interface UXMetrics {
  performance: {
    fcp: number;    // First Contentful Paint
    lcp: number;    // Largest Contentful Paint
    fid: number;    // First Input Delay
    cls: number;    // Cumulative Layout Shift
    ttfb: number;   // Time to First Byte
  };
  engagement: {
    sessionDuration: number;
    bounceRate: number;
    pageViews: number;
  };
  errors: {
    jsErrors: number;
    apiErrors: number;
    resourceErrors: number;
  };
}

// Monitor user experience
const monitorUX = {
  performance: {
    observe: (metric: string, value: number) => {
      // Report to monitoring service
    },
    onFCP: (value: number) => {
      if (value > 2000) {
        Logger.warn('Slow First Contentful Paint', { value });
      }
    },
    onLCP: (value: number) => {
      if (value > 2500) {
        Logger.warn('Slow Largest Contentful Paint', { value });
      }
    }
  }
};
```

## Monitoring Setup
### 1. Tools Configuration
```typescript
interface MonitoringConfig {
  metrics: {
    collect: string[];
    interval: number;
    retention: string;
  };
  alerts: {
    cpu: { threshold: number };
    memory: { threshold: number };
    errors: { threshold: number };
  };
  reporting: {
    interval: number;
    detailed: boolean;
  };
}

const monitoringConfig: MonitoringConfig = {
  metrics: {
    collect: ['cpu', 'memory', 'requests', 'errors'],
    interval: 60000,
    retention: '30d'
  },
  alerts: {
    cpu: { threshold: 80 },
    memory: { threshold: 85 },
    errors: { threshold: 5 }
  },
  reporting: {
    interval: 300000,
    detailed: true
  }
};
```

### 2. Alert Configuration
```typescript
interface AlertConfig {
  metric: string;
  threshold: number;
  window: string;
  action: 'notify' | 'escalate' | 'shutdown';
  channels: string[];
}

const alerts: AlertConfig[] = [
  {
    metric: 'error_rate',
    threshold: 5,
    window: '5m',
    action: 'notify',
    channels: ['slack', 'email']
  },
  {
    metric: 'response_time',
    threshold: 1000,
    window: '1m',
    action: 'escalate',
    channels: ['pagerduty']
  },
  {
    metric: 'memory_usage',
    threshold: 90,
    window: '1m',
    action: 'shutdown',
    channels: ['slack', 'pagerduty']
  }
];

// Alert monitoring
function monitorAlerts() {
  alerts.forEach(async (alert) => {
    const value = await getMetricValue(alert.metric);
    if (value > alert.threshold) {
      triggerAlert(alert, value);
    }
  });
}

setInterval(monitorAlerts, 60000);
```

## Response Time Goals
```typescript
const responseTimeTargets = {
  api: {
    p95: 100,   // 95% of requests under 100ms
    p99: 200    // 99% of requests under 200ms
  },
  database: {
    query: 50,  // Database queries under 50ms
    write: 100  // Write operations under 100ms
  },
  cache: {
    read: 5,    // Cache reads under 5ms
    write: 10   // Cache writes under 10ms
  },
  static: {
    asset: 200, // Static assets under 200ms
    image: 500  // Images under 500ms
  }
};

// Monitor response times
function monitorResponseTimes() {
  Object.entries(responseTimeTargets).forEach(async ([service, targets]) => {
    const metrics = await getServiceMetrics(service);
    Object.entries(targets).forEach(([operation, target]) => {
      if (metrics[operation] > target) {
        Logger.warn(`Slow ${service} ${operation}`, {
          target,
          actual: metrics[operation]
        });
      }
    });
  });
}

setInterval(monitorResponseTimes, 60000);
```