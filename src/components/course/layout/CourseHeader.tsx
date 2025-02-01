import { useTheme } from '../../../contexts/ThemeContext';
import { Course } from '../types';
import { BaseButton } from '../../base';

interface CourseHeaderProps {
  course: Course;
  onBack?: () => void;
}

export function CourseHeader({ course, onBack }: CourseHeaderProps) {
  const { theme } = useTheme();

  return (
    <header className={`border-b ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : theme === 'neurodivergent'
        ? 'bg-amber-100/50 border-amber-200'
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            {onBack && (
              <BaseButton
                variant="secondary"
                onClick={onBack}
                className="mb-2"
                leftIcon={
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                }
              >
                Back to Courses
              </BaseButton>
            )}
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {course.title}
            </h1>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {course.description}
            </p>
          </div>

          {/* Course Metadata */}
          <div className="flex items-center gap-4">
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center gap-2">
                <span>Difficulty:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-200 text-gray-900'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {course.metadata.difficulty}
                </span>
              </div>
              <div className="mt-1">
                Duration: {course.metadata.estimatedTime} hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}