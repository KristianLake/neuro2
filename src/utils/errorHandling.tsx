import React, { Component, ErrorInfo, ReactNode } from 'react';

// Error types
export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: Record<string, any>;

  constructor(code: string, message: string, status: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('AUTH_ERROR', message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('FORBIDDEN', message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('NOT_FOUND', message, 404, details);
  }
}

// Error logging
export const logError = (error: Error, context?: Record<string, any>) => {
  const errorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    environment: typeof import.meta !== 'undefined' ? import.meta.env.MODE : 'unknown'
  };

  // Log to console in development
  if (typeof import.meta !== 'undefined' && import.meta.env.DEV) {
    console.error('Error:', errorDetails);
  }

  // In production, would send to error monitoring service
  if (typeof import.meta !== 'undefined' && import.meta.env.PROD) {
    // TODO: Implement error reporting service integration
    // Example: Sentry.captureException(error, { extra: errorDetails });
  }

  return errorDetails;
};

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
