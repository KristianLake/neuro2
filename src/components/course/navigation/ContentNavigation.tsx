import { useTheme } from '../../../contexts/ThemeContext';
import { ContentMetadata } from '../types';
import { BaseButton } from '../../base';

interface ContentNavigationProps {
  previousContent?: ContentMetadata;
  nextContent?: ContentMetadata;
  onNavigate: (contentId: string) => void;
  progress?: number;
}

export function ContentNavigation({
  previousContent,
  nextContent,
  onNavigate,
  progress = 0
}: ContentNavigationProps) {
  const { theme } = useTheme();

  return (
    <div className={`border-t ${
      theme === 'dark'
        ? 'border-gray-700'
        : theme === 'neurodivergent'
        ? 'border-amber-200'
        : 'border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Progress
            </span>
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className={`h-2 rounded-full ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div
              className={`h-full rounded-full transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-500'
                  : theme === 'neurodivergent'
                  ? 'bg-teal-600'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <BaseButton
            variant="secondary"
            onClick={() => previousContent && onNavigate(previousContent.id)}
            disabled={!previousContent}
            leftIcon={
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            }
          >
            {previousContent?.title || 'Previous'}
          </BaseButton>

          <BaseButton
            variant="primary"
            onClick={() => nextContent && onNavigate(nextContent.id)}
            disabled={!nextContent || progress < 100}
            rightIcon={
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            }
          >
            {nextContent?.title || 'Next'}
          </BaseButton>
        </div>
      </div>
    </div>
  );
}