# API Documentation

## Overview
Complete API documentation and integration guides for the NeuroCode Learning Platform.

## Endpoints
### Authentication
```typescript
interface AuthEndpoints {
  register: {
    method: 'POST';
    path: '/auth/register';
    body: {
      email: string;
      password: string;
      fullName: string;
    };
    response: {
      user: User;
      session: Session;
    };
  };
  login: {
    method: 'POST';
    path: '/auth/login';
    body: {
      email: string;
      password: string;
    };
    response: {
      user: User;
      session: Session;
    };
  };
  logout: {
    method: 'POST';
    path: '/auth/logout';
    response: {
      success: boolean;
    };
  };
  resetPassword: {
    method: 'POST';
    path: '/auth/reset-password';
    body: {
      email: string;
    };
    response: {
      success: boolean;
    };
  };
}

interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  token: string;
  expiresAt: string;
}
```

### Course Management
```typescript
interface CourseEndpoints {
  list: {
    method: 'GET';
    path: '/courses';
    query?: {
      page?: number;
      limit?: number;
      search?: string;
    };
    response: {
      courses: Course[];
      total: number;
      page: number;
      totalPages: number;
    };
  };
  get: {
    method: 'GET';
    path: '/courses/:id';
    response: {
      course: CourseDetail;
    };
  };
  modules: {
    method: 'GET';
    path: '/courses/:id/modules';
    response: {
      modules: Module[];
    };
  };
  progress: {
    method: 'GET';
    path: '/courses/:id/progress';
    response: {
      progress: CourseProgress;
    };
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

interface CourseDetail extends Course {
  modules: Module[];
  prerequisites: string[];
  objectives: string[];
  requirements: string[];
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  duration: number;
  order: number;
}

interface CourseProgress {
  courseId: string;
  userId: string;
  completedModules: string[];
  completedLessons: string[];
  startedAt: string;
  lastAccessedAt: string;
  completionPercentage: number;
}
```

### Progress Tracking
```typescript
interface ProgressEndpoints {
  update: {
    method: 'POST';
    path: '/progress/update';
    body: {
      courseId: string;
      moduleId?: string;
      lessonId?: string;
      status: 'started' | 'completed';
    };
    response: {
      progress: Progress;
    };
  };
  status: {
    method: 'GET';
    path: '/progress/status';
    query: {
      courseId: string;
    };
    response: {
      progress: Progress;
    };
  };
  completion: {
    method: 'GET';
    path: '/progress/completion';
    response: {
      courses: CourseCompletion[];
    };
  };
}

interface Progress {
  userId: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  updatedAt: string;
}

interface CourseCompletion {
  courseId: string;
  title: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  certificateUrl?: string;
}
```

## Error Handling
### Response Codes
```typescript
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_ERROR = 500
}

interface ApiError {
  code: string;
  message: string;
  status: HttpStatus;
  details?: Record<string, any>;
}

// Error response examples
const errors = {
  validation: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    status: HttpStatus.BAD_REQUEST,
    details: {
      field: 'email',
      error: 'Invalid email format'
    }
  },
  authentication: {
    code: 'AUTH_ERROR',
    message: 'Invalid credentials',
    status: HttpStatus.UNAUTHORIZED
  },
  notFound: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
    status: HttpStatus.NOT_FOUND
  }
};
```

## Rate Limiting
```typescript
interface RateLimits {
  public: {
    window: '15m';
    max: 100;
  };
  authenticated: {
    window: '15m';
    max: 1000;
  };
  premium: {
    window: '15m';
    max: 5000;
  };
}

// Rate limit headers
interface RateLimitHeaders {
  'X-RateLimit-Limit': number;
  'X-RateLimit-Remaining': number;
  'X-RateLimit-Reset': number;
}
```

## Authentication
### JWT Format
```typescript
interface JWTPayload {
  sub: string;        // User ID
  email: string;      // User email
  role: string;       // User role
  iat: number;        // Issued at
  exp: number;        // Expiration
}

// Authorization header
const authHeader = {
  Authorization: 'Bearer <jwt_token>'
};
```

## Versioning
```typescript
interface VersionInfo {
  current: string;    // Current API version
  supported: string[];// Supported versions
  deprecated: string[];// Deprecated versions
  sunset: Record<string, string>; // Version sunset dates
}

// Version header
const versionHeader = {
  'API-Version': '2023-08'
};
```