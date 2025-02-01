import { useTheme } from '../../../../contexts/ThemeContext';
import { Achievement } from '../../../../types/achievements';

interface AchievementDisplayProps {
  achievement: Achievement;
  queue: Achievement[];
  onDismiss: () => void;
}

export default function AchievementDisplay({ achievement, queue, onDismiss }: AchievementDisplayProps) {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="achievement-modal" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-center justify-center p-2">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <div className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:w-full sm:max-w-sm ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <div className="p-3">
            <div className="text-center">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full animate-bounce ${
                theme === 'dark'
                  ? 'bg-indigo-900/20'
                  : theme === 'neurodivergent'
                  ? 'bg-teal-50'
                  : 'bg-indigo-50'
              }`}>
                <span className="text-2xl">{achievement.icon}</span>
              </div>

              <div className="mt-2">
                <h3 className={`text-base font-bold ${
                  theme === 'dark'
                    ? 'text-gray-100'
                    : theme === 'neurodivergent'
                    ? 'text-gray-900'
                    : 'text-gray-900'
                }`}>
                  Achievement Unlocked!
                </h3>
                <div className="mt-1">
                  <p className={`text-sm font-semibold ${
                    theme === 'dark'
                      ? 'text-gray-300'
                      : theme === 'neurodivergent'
                      ? 'text-gray-800'
                      : 'text-gray-900'
                  }`}>
                    {achievement.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    theme === 'dark'
                      ? 'text-gray-400'
                      : theme === 'neurodivergent'
                      ? 'text-gray-700'
                      : 'text-gray-600'
                  }`}>
                    {achievement.description}
                  </p>
                  <div className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 mt-1 ${
                    theme === 'dark'
                      ? 'bg-indigo-900/20'
                      : theme === 'neurodivergent'
                      ? 'bg-teal-50'
                      : 'bg-indigo-50'
                  }`}>
                    <span className={`text-sm font-bold ${
                      theme === 'dark'
                        ? 'text-indigo-400'
                        : theme === 'neurodivergent'
                        ? 'text-teal-600'
                        : 'text-indigo-600'
                    }`}>
                      +{achievement.xp} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <button
                type="button"
                className={`w-full rounded-md px-3 py-1.5 text-sm font-medium shadow-sm transition-colors ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : theme === 'neurodivergent'
                    ? 'bg-teal-600 text-white hover:bg-teal-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                onClick={onDismiss}
              >
                {queue.length > 1 ? (
                  <>Next Achievement! <span className="ml-1">🎉</span></>
                ) : (
                  <>Awesome! <span className="ml-1">🌟</span></>
                )}
              </button>
            </div>

            {queue.length > 1 && (
              <p className={`mt-1 text-center text-xs ${
                theme === 'dark'
                  ? 'text-gray-400'
                  : theme === 'neurodivergent'
                  ? 'text-gray-600'
                  : 'text-gray-500'
              }`}>
                {queue.length - 1} more {queue.length - 1 === 1 ? 'achievement' : 'achievements'} to go!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}