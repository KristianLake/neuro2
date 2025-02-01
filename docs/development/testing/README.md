# Testing Documentation

## Overview
Comprehensive testing strategy and implementation guidelines for the NeuroCode Learning Platform.

## Testing Strategy
### 1. Test Pyramid
```typescript
interface TestCoverage {
  unit: {
    target: number;      // 80% coverage
    focus: string[];     // ['Components', 'Hooks', 'Utils']
    priority: 'high';
  };
  integration: {
    target: number;      // 70% coverage
    focus: string[];     // ['API', 'Features', 'Flows']
    priority: 'medium';
  };
  e2e: {
    target: number;      // 50% coverage
    focus: string[];     // ['Critical Paths', 'User Journeys']
    priority: 'low';
  };
}
```

### 2. Testing Tools
```typescript
interface TestingStack {
  unit: {
    framework: 'Vitest';
    libraries: [
      '@testing-library/react',
      '@testing-library/user-event',
      'msw'
    ];
  };
  integration: {
    framework: 'Vitest';
    libraries: [
      'supertest',
      '@testing-library/react'
    ];
  };
  e2e: {
    framework: 'Playwright';
    browsers: ['chromium', 'firefox', 'webkit'];
  };
}
```

## Test Organization
### Directory Structure
```
tests/
├── unit/                    # Unit tests
│   ├── components/          # React component tests
│   ├── hooks/              # Custom hook tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── api/                # API endpoint tests
│   └── features/           # Feature integration tests
└── e2e/                    # End-to-end tests
    ├── flows/              # User flow tests
    └── journeys/           # Complete user journey tests
```

### Test Files
```typescript
// Unit test example
describe('Component: Button', () => {
  it('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should handle click events', async () => {
    const onClickMock = vi.fn();
    render(<Button onClick={onClickMock}>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalled();
  });
});

// Integration test example
describe('Feature: Course Enrollment', () => {
  it('should enroll user in course', async () => {
    const response = await request(app)
      .post('/api/courses/enroll')
      .send({ courseId: '123' })
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.enrolled).toBe(true);
  });
});

// E2E test example
test('complete course purchase flow', async ({ page }) => {
  await page.goto('/courses');
  await page.click('[data-testid="course-card"]');
  await page.click('[data-testid="enroll-button"]');
  await page.fill('[data-testid="card-number"]', '4242424242424242');
  await page.click('[data-testid="submit-payment"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Test Configuration
### 1. Vitest Config
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    },
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist']
  }
});
```

### 2. Playwright Config
```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' }
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'Safari',
      use: { browserName: 'webkit' }
    }
  ]
};

export default config;
```

## Test Utilities
### 1. Test Helpers
```typescript
// tests/utils/test-utils.ts
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter });
}

export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    ...overrides
  };
}

export function createMockCourse(overrides = {}) {
  return {
    id: 'test-course-id',
    title: 'Test Course',
    description: 'Test Description',
    ...overrides
  };
}
```

### 2. Test Fixtures
```typescript
// tests/fixtures/index.ts
export const mockUsers = [
  createMockUser({ id: 'user-1' }),
  createMockUser({ id: 'user-2' })
];

export const mockCourses = [
  createMockCourse({ id: 'course-1' }),
  createMockCourse({ id: 'course-2' })
];

export const mockProgress = {
  userId: 'user-1',
  courseId: 'course-1',
  completedModules: ['module-1'],
  completedLessons: ['lesson-1', 'lesson-2']
};
```

## Best Practices
### 1. Test Structure
```typescript
// Good test structure
describe('Feature: Authentication', () => {
  describe('when logging in', () => {
    it('should successfully log in with valid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Act
      const response = await loginUser(credentials);
      
      // Assert
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
    });
    
    it('should handle invalid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrong' };
      
      // Act
      const response = await loginUser(credentials);
      
      // Assert
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
    });
  });
});
```

### 2. Test Isolation
```typescript
describe('Component: CourseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render course details', () => {
    const course = createMockCourse();
    render(<CourseCard course={course} />);
    expect(screen.getByText(course.title)).toBeInTheDocument();
  });
});
```

### 3. Async Testing
```typescript
describe('API: Course Enrollment', () => {
  it('should handle enrollment process', async () => {
    await expect(
      enrollInCourse('course-id')
    ).resolves.toEqual({
      success: true,
      courseId: 'course-id'
    });
  });

  it('should handle enrollment errors', async () => {
    await expect(
      enrollInCourse('invalid-id')
    ).rejects.toThrow('Course not found');
  });
});
```