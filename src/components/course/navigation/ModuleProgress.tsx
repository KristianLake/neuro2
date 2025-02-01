import { useTheme } from '../../../contexts/ThemeContext';
import { ContentModule, Progress } from '../types';

interface ModuleProgressProps {
  module: ContentModule;
  progress: Record<string, Progress>;
}

export function ModuleProgress({ module, progress }: ModuleProgressProps) {
  const { theme } = useTheme();

  const calculateProgress = () => {
    const completedContent = module.contents.filter(
      content => progress[content.id]?.status === 'completed'
    ).length;
    return (completedContent / module.contents.length) * 100;
  };

  const moduleProgress = calculateProgress();

  return (
    <div className={`p-4 rounded-lg ${
      theme === 'dark'
        ? 'bg-gray-800'
        : theme === 'neurodivergent'
        ? 'bg-amber-100/50'
        : 'bg-white'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {module.title}
        </h3>
        <span className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {Math.round(moduleProgress)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
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
          style={{ width: `${moduleProgress}%` }}
        />
      </div>

      {/* Content List */}
      <div className="mt-4 space-y-2">
        {module.contents.map((content) => {
          const contentProgress = progress[content.id];
          const isCompleted = contentProgress?.status === 'completed';
          const isInProgress = contentProgress?.status === 'in_progress';

          return (
            <div
              key={content.id}
              className={`flex items-center justify-between p-2 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <span className={`mr-2 ${
                  isCompleted
                    ? theme === 'dark'
                      ? 'text-green-400'
                      : 'text-green-600'
                    : isInProgress
                    ? theme === 'dark'
                      ? 'text-yellow-400'
                      : 'text-yellow-600'
                    : theme === 'dark'
                    ? 'text-gray-500'
                    : 'text-gray-400'
                }`}>
                  {isCompleted ? '✓' : isInProgress ? '⋯' : '○'}
                </span>
                <span className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {content.title}
                </span>
              </div>
              {contentProgress && (
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {contentProgress.score ? `${contentProgress.score}%` : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}