import { useTheme } from '../../contexts/ThemeContext';
import { BaseButton } from '../base';

interface ContentErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
}

export function ContentErrorFallback({ error, onRetry }: ContentErrorFallbackProps) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-6 ${
      theme === 'dark'
        ? 'bg-gray-800'
        : theme === 'neurodivergent'
        ? 'bg-amber-100/50'
        : 'bg-white'
    }`}>
      <div className="text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
          theme === 'dark'
            ? 'bg-red-900/20'
            : theme === 'neurodivergent'
            ? 'bg-red-50'
            : 'bg-red-100'
        }`}>
          <span className="text-3xl">⚠️</span>
        </div>

        <h3 className={`text-lg font-medium mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Failed to load content
        </h3>

        <p className={`mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          There was an error loading this content. Please try again.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className={`mb-4 p-3 rounded text-left text-sm ${
            theme === 'dark'
              ? 'bg-gray-900 text-gray-300'
              : theme === 'neurodivergent'
              ? 'bg-white text-gray-800'
              : 'bg-gray-50 text-gray-800'
          }`}>
            <pre className="whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        )}

        {onRetry && (
          <BaseButton
            variant="primary"
            onClick={onRetry}
          >
            Try Again
          </BaseButton>
        )}
      </div>
    </div>
  );
}