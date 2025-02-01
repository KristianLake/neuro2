import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourseAccess } from '../hooks/useCourseAccess';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import PurchaseModal from './PurchaseModal';

interface CourseCardProps {
  id: number;
  title: string;
  description: string;
  currency: string;
  price: number;
  lessons: {
    id: number;
    title: string;
    path: string;
    isPremium: boolean;
  }[];
}

export default function CourseCard({ id, title, description, currency, price, lessons }: CourseCardProps) {
  const { checkModuleAccess } = useCourseAccess();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setAccessError(null);
        const access = await checkModuleAccess(`module-${id}`);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking module access:', error);
        setAccessError('Failed to check module access');
      } finally {
        setLoading(false);
      }
    };
    checkAccess();
  }, [id]);

  // Function to determine if a lesson is accessible
  const isLessonAccessible = (lessonId: number, moduleId: number, isPremium: boolean) => {
    // First lesson of Module 1 is always free
    if (moduleId === 1 && lessonId === 1) {
      return true;
    }
    // All other lessons require access
    return hasAccess;
  };

  const handleLessonClick = (path: string, isPremium: boolean = true) => {
    if (!hasAccess && isPremium) {
      setSelectedLesson(path);
      setShowPurchaseModal(true);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse rounded-lg shadow-sm p-6 ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className={`h-4 rounded w-3/4 mb-4 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
        <div className={`h-4 rounded w-1/2 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
      </div>
    );
  }

  return (
    <>
      {/* Purchase Modal */}
      <PurchaseModal
        show={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        moduleId={`module-${id}`}
        moduleName={title}
        price={price}
      />

      <article className={`flex max-w-xl flex-col items-start justify-between rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="flex items-center gap-x-4 text-xs">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Module {id}
          </span>
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            Part of: The 90-Day Web Developer Program
          </span>
          <span className={`relative z-10 rounded-full px-3 py-1.5 font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : theme === 'neurodivergent'
              ? 'bg-amber-200 text-gray-700 hover:bg-amber-300'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}>
            {currency}
          </span>
        </div>
        <div className="group relative">
          <h3 className={`mt-3 text-lg font-semibold leading-6 group-hover:text-opacity-80 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className={`mt-5 line-clamp-3 text-sm leading-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{description}</p>
          <div className="mt-4 space-y-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between">
                {isLessonAccessible(lesson.id, id, lesson.isPremium) ? (
                  <Link
                    to={lesson.path}
                    className={`text-sm ${
                      theme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : theme === 'neurodivergent'
                        ? 'text-teal-600 hover:text-teal-500'
                        : 'text-indigo-600 hover:text-indigo-500'
                    }`}
                    onClick={(e) => {
                      if (!isLessonAccessible(lesson.id, id, lesson.isPremium)) {
                        e.preventDefault();
                        handleLessonClick(lesson.path, lesson.isPremium);
                      }
                    }}
                  >
                    {moduleId === 1 && lesson.id === 1 ? 'Try Free Lesson →' : 'Start Lesson →'}
                  </Link>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>{lesson.title}</span>
                    {user ? (
                      <button
                        onClick={() => handleLessonClick(lesson.path, lesson.isPremium)}
                        className={`ml-2 text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300'
                          : theme === 'neurodivergent'
                          ? 'bg-teal-100 hover:bg-teal-200 text-teal-600'
                          : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                      }`}>
                        {id === 1 ? `Unlock Programming Primer for £${price}` : `Unlock for £${price}`}
                      </button>
                    ) : (
                      <Link
                        to="/auth/login"
                        className={`ml-2 text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300'
                            : theme === 'neurodivergent'
                            ? 'bg-teal-100 hover:bg-teal-200 text-teal-600'
                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                        }`}
                      >
                        Sign in to access
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}