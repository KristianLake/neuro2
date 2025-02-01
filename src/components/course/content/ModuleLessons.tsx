import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useCourseAccess } from '../../../hooks/useCourseAccess';
import { BaseCard } from '../../base';

interface ModuleLessonsProps {
  moduleId: string;
  title: string;
  description: string;
  lessons: {
    id: number;
    title: string;
    path: string;
    isPremium: boolean;
  }[];
}

export function ModuleLessons({ moduleId, title, description, lessons }: ModuleLessonsProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { checkModuleAccess } = useCourseAccess();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await checkModuleAccess(moduleId);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking module access:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAccess();
  }, [moduleId, checkModuleAccess]);

  if (loading) {
    return (
      <BaseCard>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard>
      <div className="space-y-6">
        {/* Module Header */}
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {description}
          </p>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`p-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {lesson.title}
                  </h3>
                </div>
                {user ? (
                  hasAccess || !lesson.isPremium ? (
                    <Link
                      to={lesson.path}
                      className={`text-sm font-medium ${
                        theme === 'dark'
                          ? 'text-indigo-400 hover:text-indigo-300'
                          : theme === 'neurodivergent'
                          ? 'text-teal-600 hover:text-teal-500'
                          : 'text-indigo-600 hover:text-indigo-500'
                      }`}
                    >
                      Start Lesson →
                    </Link>
                  ) : (
                    <Link
                      to={`/purchase/${moduleId}`}
                      className={`text-sm font-medium px-3 py-1.5 rounded ${
                        theme === 'dark'
                          ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-900/75'
                          : theme === 'neurodivergent'
                          ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      Unlock Lesson
                    </Link>
                  )
                ) : (
                  <Link
                    to="/auth/login"
                    className={`text-sm font-medium ${
                      theme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : theme === 'neurodivergent'
                        ? 'text-teal-600 hover:text-teal-500'
                        : 'text-indigo-600 hover:text-indigo-500'
                    }`}
                  >
                    Sign in to access
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseCard>
  );
}