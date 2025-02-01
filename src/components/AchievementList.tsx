import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Achievement } from '../types/achievements';
import AchievementChallengeModal from './AchievementChallengeModal';

interface AchievementListProps {
  earnedAchievements: Achievement[];
  availableAchievements: Achievement[];
  achievementQueue?: Achievement[];
  showViewAll?: boolean;
  showLessonLinks?: boolean;
  showSource?: boolean;
  onAchievementClick?: (achievement: Achievement) => void;
}

export default function AchievementList({
  earnedAchievements,
  availableAchievements,
  achievementQueue = [],
  showViewAll = true,
  showLessonLinks = true,
  showSource = false,
  onAchievementClick,
}: AchievementListProps) {
  const { theme } = useTheme();
  const achievementsRef = useRef<HTMLDivElement>(null);
  const previousEarnedCountRef = useRef(earnedAchievements.length);
  const scrollTimeoutRef = useRef<number>();

  // Scroll to achievements section when we earn new achievements
  useEffect(() => {
    const earnedCount = earnedAchievements.length;
    
    // Only scroll if we've earned new achievements and the modal is dismissed
    if (earnedCount > previousEarnedCountRef.current && achievementQueue.length === 0) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }

      // Set new timeout for scroll
      scrollTimeoutRef.current = window.setTimeout(() => {
        achievementsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300); // Longer delay to ensure modal is fully closed
    }

    previousEarnedCountRef.current = earnedCount;

    // Cleanup timeout on unmount
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [earnedAchievements.length, achievementQueue.length]);

  return (
    <div ref={achievementsRef} className={`rounded-lg p-6 ${
      theme === 'dark'
        ? 'bg-gray-800 text-white'
        : theme === 'neurodivergent'
        ? 'bg-amber-100/50 text-gray-900'
        : 'bg-white text-gray-900'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-bold ${
          theme === 'dark'
            ? 'text-gray-100'
            : theme === 'neurodivergent'
            ? 'text-gray-900'
            : 'text-gray-900'
        }`}>Achievements</h3>
        {showViewAll && (
          <Link
            to="/profile?tab=gamification" 
            className={`text-sm font-medium ${
              theme === 'dark'
                ? 'text-indigo-400 hover:text-indigo-300'
                : theme === 'neurodivergent'
                ? 'text-teal-600 hover:text-teal-700'
                : 'text-indigo-600 hover:text-indigo-700'
            }`}
          >
            View All Achievements →
          </Link>
        )}
      </div>
      
      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="mb-8">
          <h4 className={`text-lg font-semibold mb-4 ${
            theme === 'dark'
              ? 'text-gray-100'
              : theme === 'neurodivergent'
              ? 'text-gray-900'
              : 'text-gray-900'
          }`}>Earned</h4>
          <div className="space-y-4">
            {earnedAchievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`rounded-lg p-4 shadow-sm border-2 transition-all duration-500 flex items-center cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-green-600 text-white hover:bg-gray-600'
                    : theme === 'neurodivergent'
                    ? 'bg-white border-teal-400 text-gray-900 hover:bg-amber-50'
                    : 'bg-white border-green-200 text-gray-900 hover:bg-gray-50'
                } ${
                  achievementQueue.find(a => a.id === achievement.id) 
                    ? theme === 'dark'
                      ? 'animate-pulse bg-green-900/20'
                      : theme === 'neurodivergent'
                      ? 'animate-pulse bg-teal-50'
                      : 'animate-pulse bg-green-50'
                    : ''
                }`} 
                onClick={() => onAchievementClick?.(achievement)}
              >
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div className="flex-grow">
                  <h4 className={`font-medium ${
                    theme === 'dark'
                      ? 'text-gray-100'
                      : 'text-gray-900'
                  }`}>{achievement.title}</h4>
                  <p className={`text-sm ${
                    theme === 'dark'
                      ? 'text-gray-200'
                      : 'text-gray-500'
                  }`}>{achievement.description}</p>
                  {showSource && (
                    <p className={`text-sm ${
                      theme === 'dark'
                        ? 'text-gray-300'
                        : theme === 'neurodivergent'
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}>
                      {achievement.lessonPath === '/lessons/introduction' 
                        ? 'Earned in: Module 1: Introduction to Programming'
                        : achievement.lessonPath === '/learn/comments'
                        ? 'Earned in: Help Guide: Understanding Comments'
                        : ''}
                    </p>
                  )}
                  <p className={`text-sm font-medium ${
                    theme === 'dark'
                      ? 'text-green-400'
                      : theme === 'neurodivergent'
                      ? 'text-teal-600'
                      : 'text-green-600'
                  }`}>+{achievement.xp} XP</p>
                </div>
                {showLessonLinks && achievement.lessonPath && (
                  <Link 
                    to={achievement.lessonPath}
                    className={`text-sm font-medium ml-4 ${
                      theme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : theme === 'neurodivergent'
                        ? 'text-teal-600 hover:text-teal-700'
                        : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Lesson →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Available Achievements */}
      <div>
        <h4 className={`text-lg font-semibold mb-4 ${
          theme === 'dark'
            ? 'text-gray-100'
            : theme === 'neurodivergent'
            ? 'text-gray-900'
            : 'text-gray-900'
        }`}>Available</h4>
        <div className="space-y-4">
          {availableAchievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`rounded-lg p-4 shadow-sm border-2 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50'
                  : theme === 'neurodivergent'
                  ? 'bg-white/50 border-amber-200 text-gray-900 hover:bg-amber-50/50'
                  : 'bg-white/50 border-gray-200 text-gray-900 hover:bg-gray-50/50'
              }`}
              onClick={() => onAchievementClick?.(achievement)}
            >
              <div className="flex items-center justify-between opacity-75">
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div className="flex-grow">
                  <h4 className={`font-medium ${
                    theme === 'dark'
                      ? 'text-gray-100'
                      : 'text-gray-900'
                  }`}>{achievement.title}</h4>
                  <p className={`text-sm ${
                    theme === 'dark'
                      ? 'text-gray-200'
                      : 'text-gray-500'
                  }`}>{achievement.description}</p>
                  {showSource && (
                    <p className={`text-sm ${
                      theme === 'dark'
                        ? 'text-gray-300'
                        : theme === 'neurodivergent'
                        ? 'text-gray-500'
                        : 'text-gray-400'
                    }`}>
                      {achievement.lessonPath === '/lessons/introduction' 
                        ? 'Available in: Module 1: Introduction to Programming'
                        : achievement.lessonPath === '/learn/comments'
                        ? 'Available in: Help Guide: Understanding Comments'
                        : ''}
                    </p>
                  )}
                  <p className={`text-sm font-medium ${
                    theme === 'dark'
                      ? 'text-indigo-400'
                      : theme === 'neurodivergent'
                      ? 'text-teal-600'
                      : 'text-indigo-600'
                  }`}>+{achievement.xp} XP</p>
                </div>
                {showLessonLinks && achievement.lessonPath && (
                  <Link 
                    to={achievement.lessonPath}
                    className={`text-sm font-medium ml-4 ${
                      theme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : theme === 'neurodivergent'
                        ? 'text-teal-600 hover:text-teal-700'
                        : 'text-indigo-600 hover:text-indigo-700'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Try Lesson →
                  </Link>
                )}
                <span className="text-lg ml-4">🔒</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}