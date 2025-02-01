import { useTheme } from '../../../contexts/ThemeContext';

interface ContentStateIndicatorProps {
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  publishAt?: string;
}

export function ContentStateIndicator({ status, publishAt }: ContentStateIndicatorProps) {
  const { theme } = useTheme();

  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return {
          bg: theme === 'dark'
            ? 'bg-gray-900/20'
            : theme === 'neurodivergent'
            ? 'bg-amber-100'
            : 'bg-gray-100',
          text: theme === 'dark'
            ? 'text-gray-400'
            : theme === 'neurodivergent'
            ? 'text-gray-700'
            : 'text-gray-700',
          icon: '📝'
        };
      case 'in_review':
        return {
          bg: theme === 'dark'
            ? 'bg-yellow-900/20'
            : theme === 'neurodivergent'
            ? 'bg-amber-100'
            : 'bg-yellow-100',
          text: theme === 'dark'
            ? 'text-yellow-400'
            : theme === 'neurodivergent'
            ? 'text-amber-700'
            : 'text-yellow-700',
          icon: '👀'
        };
      case 'approved':
        return {
          bg: theme === 'dark'
            ? 'bg-green-900/20'
            : theme === 'neurodivergent'
            ? 'bg-teal-100'
            : 'bg-green-100',
          text: theme === 'dark'
            ? 'text-green-400'
            : theme === 'neurodivergent'
            ? 'text-teal-700'
            : 'text-green-700',
          icon: '✅'
        };
      case 'published':
        return {
          bg: theme === 'dark'
            ? 'bg-blue-900/20'
            : theme === 'neurodivergent'
            ? 'bg-teal-100'
            : 'bg-blue-100',
          text: theme === 'dark'
            ? 'text-blue-400'
            : theme === 'neurodivergent'
            ? 'text-teal-700'
            : 'text-blue-700',
          icon: '🌟'
        };
      case 'archived':
        return {
          bg: theme === 'dark'
            ? 'bg-red-900/20'
            : theme === 'neurodivergent'
            ? 'bg-red-100'
            : 'bg-red-100',
          text: theme === 'dark'
            ? 'text-red-400'
            : theme === 'neurodivergent'
            ? 'text-red-700'
            : 'text-red-700',
          icon: '📦'
        };
      default:
        return {
          bg: theme === 'dark'
            ? 'bg-gray-900/20'
            : theme === 'neurodivergent'
            ? 'bg-amber-100'
            : 'bg-gray-100',
          text: theme === 'dark'
            ? 'text-gray-400'
            : theme === 'neurodivergent'
            ? 'text-gray-700'
            : 'text-gray-700',
          icon: '❓'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
      <span className="mr-1">{styles.icon}</span>
      <span className="capitalize">{status}</span>
      {publishAt && status === 'approved' && (
        <span className="ml-1">
          (Scheduled: {new Date(publishAt).toLocaleDateString()})
        </span>
      )}
    </div>
  );
}