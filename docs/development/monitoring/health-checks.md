# Health Check Endpoints

## API Health Checks
### Endpoint Configuration
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: HealthChecks;
  metrics: HealthMetrics;
}

interface HealthChecks {
  database: boolean;
  cache: boolean;
  storage: boolean;
  external: boolean;
}

interface HealthMetrics {
  uptime: number;
  responseTime: number;
  memoryUsage: number;
  cpuLoad: number;
}

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const health: HealthStatus = await checkHealth();
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 503 : 500;
                    
  res.status(statusCode).json(health);
});

// Detailed health check implementation
async function checkHealth(): Promise<HealthStatus> {
  const startTime = Date.now();
  
  const checks = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkStorage(),
    checkExternalServices()
  ]);

  const [database, cache, storage, external] = checks;
  
  const status = checks.every(check => check) ? 'healthy' :
                checks.some(check => check) ? 'degraded' : 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    checks: {
      database,
      cache,
      storage,
      external
    },
    metrics: await getHealthMetrics(startTime)
  };
}
```

### Monitoring Metrics
```typescript
interface SystemMetrics {
  cpu: {
    usage: number;
    load: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    latency: number;
    bandwidth: number;
  };
}

// System metrics collection
async function getSystemMetrics(): Promise<SystemMetrics> {
  const metrics: SystemMetrics = {
    cpu: await getCpuMetrics(),
    memory: await getMemoryMetrics(),
    disk: await getDiskMetrics(),
    network: await getNetworkMetrics()
  };

  return metrics;
}

// Metrics monitoring
setInterval(async () => {
  const metrics = await getSystemMetrics();
  
  // Alert on high resource usage
  if (metrics.cpu.usage > 80) {
    Logger.warn('High CPU usage detected', metrics.cpu);
  }
  
  if (metrics.memory.percentage > 85) {
    Logger.warn('High memory usage detected', metrics.memory);
  }
  
  if (metrics.disk.percentage > 90) {
    Logger.warn('High disk usage detected', metrics.disk);
  }
  
  // Log metrics for monitoring
  Logger.info('System metrics', metrics);
}, 60000);
```