import { Dialog } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Achievement } from '../../../../types/achievements';
import { useCourseAccess } from '../../../../hooks/useCourseAccess';
import { useState, useEffect } from 'react';

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

  // Calculate total XP gained from earned achievements
  const totalXp = earnedAchievements.reduce((total, achievement) => total + achievement.xp, 0);

  useEffect(() => {
    const checkAccess = async () => {
      const access = await checkModuleAccess('module-4');
      setHasNextModuleAccess(access);
      setLoading(false);
    };
    checkAccess();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Dialog
      as="div"
      className="relative z-50"
      open={show}
      onClose={onClose}
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-800 to-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-gradient-to-r from-amber-100 to-amber-50'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}>
            <div className="px-4 py-5 sm:p-6">
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
                <h3 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark'
                    ? 'text-white'
                    : theme === 'neurodivergent'
                    ? 'text-gray-900'
                    : 'text-white'
                }`}>
                  Congratulations!
                </h3>
                <p className={`text-lg mb-4 ${
                  theme === 'dark'
                    ? 'text-gray-300'
                    : theme === 'neurodivergent'
                    ? 'text-gray-800'
                    : 'text-white/90'
                }`}>
                  You've completed Syntax Sculptor! {hasNextModuleAccess ? 'Ready to start React Catalyst?' : 'Ready to unlock more content?'}
                </p>
                <p className={`text-sm mb-6 ${
                  theme === 'dark'
                    ? 'text-gray-400'
                    : theme === 'neurodivergent'
                    ? 'text-gray-700'
                    : 'text-white/80'
                }`}>
                  The React Catalyst module is available for £347, or get the full course for £2,497
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
                      {achievements.length}
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
                      Total XP Gained
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                {hasNextModuleAccess ? (
                  // User has access - show next lesson button
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                          : theme === 'neurodivergent'
                          ? 'bg-amber-200 text-gray-900 hover:bg-amber-300 border border-amber-300'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      } backdrop-blur-sm`}
                      onClick={onClose}
                    >
                      Keep Practicing
                    </button>
                    <Link
                      to="/lessons/react"
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
                  // User needs to purchase - show pricing and purchase button
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
                        Module 4: £347
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : theme === 'neurodivergent'
                          ? 'text-gray-800'
                          : 'text-white/80'
                      }`}>
                        Complete React Catalyst: Master React fundamentals and component architecture
                      </div>
                    </div>

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
                        Full Course: £2,497
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark'
                          ? 'text-gray-300'
                          : theme === 'neurodivergent'
                          ? 'text-gray-800'
                          : 'text-white/80'
                      }`}>
                        Get all 9 modules and save £1,000+
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                            : theme === 'neurodivergent'
                            ? 'bg-amber-200 text-gray-900 hover:bg-amber-300 border border-amber-300'
                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                        } backdrop-blur-sm`}
                        onClick={onClose}
                      >
                        Maybe Later
                      </button>
                      <Link
                        to="/purchase/module-4"
                        className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
                          theme === 'dark'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                            : theme === 'neurodivergent'
                            ? 'bg-teal-600 text-white hover:bg-teal-500'
                            : 'bg-white text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        Unlock React Catalyst
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
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}