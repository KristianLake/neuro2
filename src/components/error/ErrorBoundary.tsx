import { ErrorInfo } from 'react';
import { BaseErrorBoundary } from '../base/BaseErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

export function ErrorBoundary({ 
  children,
  fallback = ErrorFallback,
  onError,
  onReset
}: Props) {
  return (
    <BaseErrorBoundary
      fallback={fallback}
      onError={onError}
      onReset={onReset}
    >
      {children}
    </BaseErrorBoundary>
  );
}