# Webhook Documentation

## Overview
### Supported Events
```typescript
interface WebhookEvent {
  type: WebhookEventType;
  timestamp: string;
  data: Record<string, any>;
  signature: string;
}

type WebhookEventType =
  | 'payment.success'
  | 'payment.failed'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'course.enrolled'
  | 'course.completed'
  | 'module.completed'
  | 'assessment.submitted';

interface WebhookConfig {
  endpoint: string;
  secret: string;
  events: WebhookEventType[];
  retries: number;
  timeout: number;
}
```

## Security
### 1. Signature Verification
```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = createHmac('sha256', secret);
  const expectedSignature = hmac.update(payload).digest('hex');
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 2. IP Whitelisting
```typescript
const ALLOWED_IPS = [
  '192.168.1.1',
  '10.0.0.1'
];

function validateIpAddress(ip: string): boolean {
  return ALLOWED_IPS.includes(ip);
}
```

### 3. Rate Limiting
```typescript
const webhookRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Implementation
### 1. Endpoint Setup
```typescript
app.post(
  '/api/webhooks/:provider',
  webhookRateLimit,
  validateWebhook,
  async (req, res) => {
    try {
      const { provider } = req.params;
      const payload = req.body;
      
      // Verify webhook signature
      if (!verifyWebhookSignature(
        JSON.stringify(payload),
        req.headers['x-webhook-signature'] as string,
        process.env.WEBHOOK_SECRET!
      )) {
        throw new Error('Invalid webhook signature');
      }
      
      // Process webhook
      await processWebhook(provider, payload);
      
      res.status(200).json({ received: true });
    } catch (error) {
      res.status(400).json({
        error: 'Webhook processing failed',
        message: error.message
      });
    }
  }
);
```

### 2. Event Processing
```typescript
async function processWebhook(
  provider: string,
  payload: WebhookEvent
): Promise<void> {
  // Log webhook receipt
  Logger.info('Webhook received', {
    provider,
    event: payload.type,
    timestamp: payload.timestamp
  });

  try {
    switch (payload.type) {
      case 'payment.success':
        await handlePaymentSuccess(payload.data);
        break;
      case 'course.enrolled':
        await handleCourseEnrollment(payload.data);
        break;
      case 'module.completed':
        await handleModuleCompletion(payload.data);
        break;
      default:
        throw new Error(`Unhandled webhook event: ${payload.type}`);
    }
  } catch (error) {
    // Log processing error
    Logger.error('Webhook processing failed', {
      provider,
      event: payload.type,
      error: error.message
    });
    
    // Retry processing if appropriate
    if (shouldRetry(error)) {
      await enqueueRetry(provider, payload);
    }
    
    throw error;
  }
}
```

## Retry Logic
### 1. Retry Configuration
```typescript
interface RetryConfig {
  maxAttempts: number;
  backoff: {
    initial: number;
    factor: number;
    maxDelay: number;
  };
}

const retryConfig: RetryConfig = {
  maxAttempts: 3,
  backoff: {
    initial: 1000, // 1 second
    factor: 2,     // exponential backoff
    maxDelay: 60000 // 1 minute
  }
};
```

### 2. Retry Implementation
```typescript
async function enqueueRetry(
  provider: string,
  payload: WebhookEvent,
  attempt: number = 1
): Promise<void> {
  if (attempt > retryConfig.maxAttempts) {
    Logger.error('Max retry attempts reached', {
      provider,
      event: payload.type
    });
    return;
  }

  const delay = Math.min(
    retryConfig.backoff.initial * Math.pow(retryConfig.backoff.factor, attempt - 1),
    retryConfig.backoff.maxDelay
  );

  // Add to retry queue
  await queue.add('webhook-retry', {
    provider,
    payload,
    attempt
  }, {
    delay,
    attempts: 1
  });
}
```

## Monitoring
### 1. Webhook Metrics
```typescript
interface WebhookMetrics {
  received: number;
  processed: number;
  failed: number;
  retried: number;
  avgProcessingTime: number;
}

async function getWebhookMetrics(): Promise<WebhookMetrics> {
  // Implementation
}

// Monitor webhook processing
setInterval(async () => {
  const metrics = await getWebhookMetrics();
  Logger.info('Webhook metrics', metrics);
  
  if (metrics.failed > 10) {
    Logger.warn('High webhook failure rate', metrics);
  }
}, 300000); // Every 5 minutes
```

### 2. Health Monitoring
```typescript
interface WebhookHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastProcessed: string;
  failureRate: number;
  queueSize: number;
}

async function checkWebhookHealth(): Promise<WebhookHealth> {
  const metrics = await getWebhookMetrics();
  const queueSize = await getQueueSize();
  
  return {
    status: determineHealthStatus(metrics, queueSize),
    lastProcessed: await getLastProcessedTimestamp(),
    failureRate: calculateFailureRate(metrics),
    queueSize
  };
}
```