import { useTheme } from '../../../contexts/ThemeContext';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ErrorDisplayProps {
  type: 'loading' | 'purchase' | 'owned';
  message: string;
}

export function ErrorDisplay({ type, message }: ErrorDisplayProps) {
  const { theme } = useTheme();

  const getStyles = () => {
    switch (type) {
      case 'owned':
        return {
          bg: theme === 'dark'
            ? 'bg-green-900/20 border border-green-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-green-50 border border-green-200',
          icon: theme === 'dark'
            ? 'text-green-400'
            : theme === 'neurodivergent'
            ? 'text-teal-600'
            : 'text-green-400',
          title: theme === 'dark'
            ? 'text-green-400'
            : theme === 'neurodivergent'
            ? 'text-teal-800'
            : 'text-green-800',
          text: theme === 'dark'
            ? 'text-green-300'
            : theme === 'neurodivergent'
            ? 'text-teal-700'
            : 'text-green-700'
        };
      default:
        return {
          bg: theme === 'dark'
            ? 'bg-red-900/20 border border-red-800'
            : theme === 'neurodivergent'
            ? 'bg-red-50 border border-red-200'
            : 'bg-red-50 border border-red-200',
          icon: theme === 'dark'
            ? 'text-red-400'
            : theme === 'neurodivergent'
            ? 'text-red-600'
            : 'text-red-400',
          title: theme === 'dark'
            ? 'text-red-400'
            : theme === 'neurodivergent'
            ? 'text-red-800'
            : 'text-red-800',
          text: theme === 'dark'
            ? 'text-red-300'
            : theme === 'neurodivergent'
            ? 'text-red-700'
            : 'text-red-700'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`mb-6 rounded-lg p-4 ${styles.bg}`}>
      <div className="flex">
        {type === 'owned' ? (
          <CheckCircleIcon className={`h-5 w-5 ${styles.icon}`} />
        ) : (
          <XCircleIcon className={`h-5 w-5 ${styles.icon}`} />
        )}
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {type === 'loading' ? 'Error' : type === 'owned' ? 'Already Purchased' : 'Purchase Error'}
          </h3>
          <div className={`mt-2 text-sm ${styles.text}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}