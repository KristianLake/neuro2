import { useTheme } from '../../../contexts/ThemeContext';
import { Course } from '../types';
import { BaseCard, BaseButton } from '../../base';

interface CourseOverviewProps {
  course: Course;
  onModuleSelect: (moduleId: string) => void;
}

export function CourseOverview({ course, onModuleSelect }: CourseOverviewProps) {
  const { theme } = useTheme();

  return (
    <BaseCard>
      <div className="space-y-6">
        {/* Course Info */}
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {course.title}
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {course.description}
          </p>
        </div>

        {/* Course Metadata */}
        <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50'
            : 'bg-gray-50'
        }`}>
          <div>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Difficulty
            </span>
            <p className={`font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {course.metadata.difficulty}
            </p>
          </div>
          <div>
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Duration
            </span>
            <p className={`font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {course.metadata.estimatedTime} hours
            </p>
          </div>
        </div>

        {/* Module List */}
        <div>
          <h2 className={`text-lg font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Course Modules
          </h2>
          <div className="space-y-2">
            {course.modules.map((module, index) => (
              <div
                key={module.id}
                className={`p-4 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Module {index + 1}
                    </span>
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {module.title}
                    </h3>
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {module.contents.length} lessons
                  </div>
                </div>

                {module.description && (
                  <p className={`text-sm mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {module.description}
                  </p>
                )}

                {module.objectives && (
                  <div className={`mb-4 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <strong>You'll learn:</strong>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {module.objectives.map((objective, i) => (
                        <li key={i}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <BaseButton
                  variant="primary"
                  onClick={() => onModuleSelect(module.id)}
                >
                  Start Module
                </BaseButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseCard>
  );
}