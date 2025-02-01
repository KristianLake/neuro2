# Error Handling Guidelines

## Error Types
### 1. Application Errors
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Business logic errors
class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

// Authentication errors
class AuthError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('AUTH_ERROR', message, 401, details);
  }
}

// Authorization errors
class ForbiddenError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('FORBIDDEN', message, 403, details);
  }
}

// Not found errors
class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('NOT_FOUND', message, 404, details);
  }
}
```

### 2. Error Categories
1. **Validation Errors**
   - Invalid input
   - Missing fields
   - Type mismatches
   - Format errors

2. **Authentication Errors**
   - Invalid credentials
   - Expired tokens
   - Missing permissions
   - Rate limiting

3. **API Errors**
   - Network failures
   - Timeout errors
   - Service unavailable
   - Integration errors

## Error Handling Patterns
### 1. Async Error Handling
```typescript
const asyncHandler = (fn: AsyncRequestHandler) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Usage example
app.get('/api/users', asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
}));
```

### 2. Global Error Handler
```typescript
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  // Log error details for debugging
  console.error({
    error: err.name,
    code: err.code,
    message: err.message,
    stack: err.stack,
    details: err.details
  });

  // Send appropriate response to client
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      code: err.code,
      message,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined
    }
  });
});
```

## Error Logging
### 1. Logging Levels
```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface ErrorLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

class Logger {
  static error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context);
  }

  static warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  static info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  static debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  private static log(level: LogLevel, message: string, context?: Record<string, any>) {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
    } else {
      console.log(JSON.stringify(log, null, 2));
    }
  }
}
```

### 2. Error Monitoring
```typescript
interface ErrorMonitor {
  capture(error: Error): void;
  notify(message: string, context?: Record<string, any>): void;
  breadcrumb(message: string, category: string): void;
}

class ErrorMonitoring implements ErrorMonitor {
  capture(error: Error) {
    Logger.error(error.message, {
      name: error.name,
      stack: error.stack
    });
  }

  notify(message: string, context?: Record<string, any>) {
    Logger.warn(message, context);
  }

  breadcrumb(message: string, category: string) {
    Logger.info(message, { category });
  }
}
```