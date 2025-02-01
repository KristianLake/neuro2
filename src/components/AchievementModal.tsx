import { useTheme } from '../contexts/ThemeContext';
import { Achievement } from '../types/achievements';
import { BaseModal } from './base';

interface AchievementModalProps {
  showing: boolean;
  achievement: Achievement | null;
  queue: Achievement[];
  onDismiss: () => void;
}

export default function AchievementModal({ showing, achievement, queue, onDismiss }: AchievementModalProps) {
  const { theme } = useTheme();

  const showConfetti = () => {
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti({
      emojis: ['⭐', '🎉', '✨', '💫'],
      emojiSize: 50,
      confettiNumber: 40,
    });
  };

  if (!showing || !achievement) return null;

  const modalFooter = (
    <button
      type="button"
      onClick={() => {
        onDismiss();
        showConfetti();
      }}
      className={`w-full rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
        theme === 'dark'
          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
          : theme === 'neurodivergent'
          ? 'bg-teal-600 text-white hover:bg-teal-500'
          : 'bg-white text-indigo-600 hover:bg-indigo-50'
      }`}
    >
      {queue.length > 1 ? (
        <>Next Achievement! <span className="ml-1">🎉</span></>
      ) : (
        <>Awesome! <span className="ml-1">🌟</span></>
      )}
    </button>
  );

  return (
    <BaseModal
      isOpen={showing}
      onClose={() => {
        onDismiss();
        showConfetti();
      }}
      title="Achievement Unlocked!"
      size="sm"
      footer={modalFooter}
    >
      <div className="text-center">
        {/* Achievement icon */}
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full animate-bounce ${
          theme === 'dark'
            ? 'bg-indigo-900/20'
            : theme === 'neurodivergent'
            ? 'bg-teal-50'
            : 'bg-indigo-50'
        } backdrop-blur-sm`}>
          <span className="text-2xl">{achievement.icon}</span>
        </div>

        {/* Achievement details */}
        <div className="mt-2">
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
              ? 'text-gray-300'
              : theme === 'neurodivergent'
              ? 'text-gray-700'
              : 'text-gray-600'
          }`}>
            {achievement.description}
          </p>
          <div className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 mt-2 ${
            theme === 'dark'
              ? 'bg-indigo-900/20'
              : theme === 'neurodivergent'
              ? 'bg-teal-50'
              : 'bg-indigo-50'
          } backdrop-blur-sm`}>
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

        {/* Achievement counter */}
        {queue.length > 1 && (
          <p className={`mt-2 text-center text-xs ${
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
    </BaseModal>
  );
}