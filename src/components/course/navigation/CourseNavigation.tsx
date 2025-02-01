import { useTheme } from '../../../contexts/ThemeContext';
import { Course, ContentModule } from '../types';
import { BaseButton } from '../../base';

interface CourseNavigationProps {
  course: Course;
  currentModuleId?: string;
  currentContentId?: string;
  onModuleSelect: (moduleId: string) => void;
  onContentSelect: (contentId: string) => void;
}

export function CourseNavigation({
  course,
  currentModuleId,
  currentContentId,
  onModuleSelect,
  onContentSelect
}: CourseNavigationProps) {
  const { theme } = useTheme();

  return (
    <nav className={`w-64 flex-shrink-0 border-r overflow-y-auto ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : theme === 'neurodivergent'
        ? 'bg-amber-100/50 border-amber-200'
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <h2 className={`text-lg font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {course.title}
        </h2>

        <div className="space-y-4">
          {course.modules.map((module) => (
            <div key={module.id}>
              {/* Module Header */}
              <button
                onClick={() => onModuleSelect(module.id)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  currentModuleId === module.id
                    ? theme === 'dark'
                      ? 'bg-indigo-900/20 text-indigo-400'
                      : theme === 'neurodivergent'
                      ? 'bg-teal-50 text-teal-900'
                      : 'bg-indigo-50 text-indigo-700'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : theme === 'neurodivergent'
                    ? 'text-gray-900 hover:bg-amber-200/50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Module {module.order}</span>
                  <span className="text-xs">
                    {module.contents.length} lessons
                  </span>
                </div>
                <p className={`text-sm mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {module.title}
                </p>
              </button>

              {/* Module Contents */}
              {currentModuleId === module.id && (
                <div className="mt-2 ml-4 space-y-1">
                  {module.contents.map((content) => (
                    <button
                      key={content.id}
                      onClick={() => onContentSelect(content.id)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        currentContentId === content.id
                          ? theme === 'dark'
                            ? 'bg-indigo-900/20 text-indigo-400'
                            : theme === 'neurodivergent'
                            ? 'bg-teal-50 text-teal-900'
                            : 'bg-indigo-50 text-indigo-700'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700'
                          : theme === 'neurodivergent'
                          ? 'text-gray-900 hover:bg-amber-200/50'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {content.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}