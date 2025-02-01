import { useTheme } from '../../contexts/ThemeContext';
import { BaseButton } from '../base';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg shadow-lg p-6 ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${
            theme === 'dark'
              ? 'bg-red-900/20'
              : theme === 'neurodivergent'
              ? 'bg-red-50'
              : 'bg-red-100'
          }`}>
            <span className="text-4xl">⚠️</span>
          </div>

          <h2 className={`text-xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Something went wrong
          </h2>

          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            We're sorry for the inconvenience. The error has been logged and we'll look into it.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className={`mb-6 p-4 rounded text-left overflow-auto ${
              theme === 'dark'
                ? 'bg-gray-900 text-gray-300'
                : theme === 'neurodivergent'
                ? 'bg-white text-gray-800'
                : 'bg-gray-50 text-gray-800'
            }`}>
              <pre className="text-sm whitespace-pre-wrap">
                {error.message}
                {error.stack}
              </pre>
            </div>
          )}

          <BaseButton
            variant="primary"
            onClick={resetError}
          >
            Try Again
          </BaseButton>
        </div>
      </div>
    </div>
  );
}