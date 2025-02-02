import { Link } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Achievement } from '../../../../types/achievements';
import { useCourseAccess } from '../../../../hooks/useCourseAccess';
import { useState, useEffect } from 'react';
import { BaseModal, BaseButton } from '../../../../components/base';

interface CompletionModalProps {
  show: boolean;
  onClose: () => void;
  achievements: Achievement[];
  earnedAchievements: Achievement[];
}

export default function CompletionModal({ 
  show, 
  onClose, 
  achievements, 
  earnedAchievements
}: CompletionModalProps) {
  const { theme } = useTheme();
  const { checkModuleAccess } = useCourseAccess();
  const [hasNextModuleAccess, setHasNextModuleAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate total XP gained from earned achievements in this lesson
  const totalXp = earnedAchievements
    .filter(achievement => achievement.lessonPath === '/lessons/introduction')
    .filter(achievement => achievement.lessonPath === '/lessons/introduction')
    .reduce((total, achievement) => total + achievement.xp, 0);

  useEffect(() => {
    const checkAccess = async () => {
      const access = await checkModuleAccess('module-2');
      setHasNextModuleAccess(access);
      setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) {
    return null;
  }

  const modalFooter = hasNextModuleAccess ? (
    <div className="flex gap-4">
      <BaseButton
        variant="secondary"
        onClick={onClose}
      >
        Keep Practicing
      </BaseButton>
      <Link
        to="/lessons/variables"
        className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
          theme === 'dark'
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : theme === 'neurodivergent'
            ? 'bg-teal-600 text-white hover:bg-teal-500'
            : 'bg-white text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        Next Lesson
      </Link>
    </div>
  ) : (
    <div className="space-y-4">
      <div className={`rounded-lg p-4 ${
        theme === 'dark'
          ? 'bg-gray-700/50'
          : theme === 'neurodivergent'
          ? 'bg-amber-200/50'
          : 'bg-white/10'
      } backdrop-blur-sm`}>
        <div className={`text-2xl font-bold mb-1 ${
          theme === 'dark'
            ? 'text-white'
            : theme === 'neurodivergent'
            ? 'text-gray-900'
            : 'text-white'
        }`}>
          Module 1: £197
        </div>
        <div className={`text-sm ${
          theme === 'dark'
            ? 'text-gray-300'
            : theme === 'neurodivergent'
            ? 'text-gray-800'
            : 'text-white/80'
        }`}>
          Complete Programming Primer: Variables, Functions, and more
        </div>
      </div>

      <div className="flex gap-4">
        <BaseButton
          variant="secondary"
          onClick={onClose}
        >
          Maybe Later
        </BaseButton>
        <Link
          to="/purchase/module-1"
          className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
            theme === 'dark'
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : theme === 'neurodivergent'
              ? 'bg-teal-600 text-white hover:bg-teal-500'
              : 'bg-white text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          Unlock Programming Primer
        </Link>
      </div>
      <div className="text-center">
        <Link
          to="/purchase/full-course"
          className={`text-sm font-medium ${
            theme === 'dark'
              ? 'text-indigo-400 hover:text-indigo-300'
              : theme === 'neurodivergent'
              ? 'text-teal-600 hover:text-teal-500'
              : 'text-indigo-600 hover:text-indigo-500'
          }`}
        >
          View Full Course Details →
        </Link>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={show}
      onClose={onClose}
      title="Congratulations!"
      size="lg"
      footer={modalFooter}
    >
      <div className="text-center">
        {/* Celebration icon */}
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${
          theme === 'dark'
            ? 'bg-gray-700/50'
            : theme === 'neurodivergent'
            ? 'bg-amber-200/50'
            : 'bg-white/20'
        } backdrop-blur-sm`}>
          <span className="text-4xl animate-bounce">🎉</span>
        </div>

        {/* Completion message */}
        <p className={`text-lg mb-4 ${
          theme === 'dark'
            ? 'text-gray-300'
            : theme === 'neurodivergent'
            ? 'text-gray-800'
            : 'text-white/90'
        }`}>
          You've completed the introduction! {hasNextModuleAccess ? 'Ready to start Variables?' : 'Ready to unlock more content?'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700/50'
              : theme === 'neurodivergent'
              ? 'bg-amber-200/50'
              : 'bg-white/10'
          } backdrop-blur-sm`}>
            <div className={`text-3xl font-bold mb-1 ${
              theme === 'dark'
                ? 'text-white'
                : theme === 'neurodivergent'
                ? 'text-gray-900'
                : 'text-white'
            }`}>
              {earnedAchievements.length}
            </div>
            <div className={`text-sm ${
              theme === 'dark'
                ? 'text-gray-300'
                : theme === 'neurodivergent'
                ? 'text-gray-800'
                : 'text-white/80'
            }`}>
              Achievements Earned
            </div>
          </div>
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700/50'
              : theme === 'neurodivergent'
              ? 'bg-amber-200/50'
              : 'bg-white/10'
          } backdrop-blur-sm`}>
            <div className={`text-3xl font-bold mb-1 ${
              theme === 'dark'
                ? 'text-white'
                : theme === 'neurodivergent'
                ? 'text-gray-900'
                : 'text-white'
            }`}>
              {totalXp}
            </div>
            <div className={`text-sm ${
              theme === 'dark'
                ? 'text-gray-300'
                : theme === 'neurodivergent'
                ? 'text-gray-800'
                : 'text-white/80'
            }`}>
              XP Earned This Lesson
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}