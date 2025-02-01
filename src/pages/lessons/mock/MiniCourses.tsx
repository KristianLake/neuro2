import { useTheme } from '../../../contexts/ThemeContext';
import { PageLayout } from '../../../components/layouts';
import { BaseCard } from '../../../components/base';
import { Link } from 'react-router-dom';

// Mock data for mini courses
const MOCK_MINI_COURSES = {
  'mini-typescript': {
    title: 'TypeScript Essentials',
    description: 'Quick start guide to TypeScript fundamentals',
    modules: [
      {
        id: 'mini-ts-module-1',
        title: 'TypeScript Basics',
        description: 'Getting started with TypeScript',
        lessons: [
          { id: 1, title: 'TypeScript Introduction', path: '/lessons/mini-typescript/basics/intro', isPremium: false },
          { id: 2, title: 'Basic Types', path: '/lessons/mini-typescript/basics/types', isPremium: true }
        ]
      },
      {
        id: 'mini-ts-module-2',
        title: 'Advanced TypeScript',
        description: 'Advanced types and patterns',
        lessons: [
          { id: 1, title: 'Generics', path: '/lessons/mini-typescript/advanced/generics', isPremium: true },
          { id: 2, title: 'Utility Types', path: '/lessons/mini-typescript/advanced/utility-types', isPremium: true }
        ]
      }
    ]
  },
  'mini-react': {
    title: 'React Fundamentals',
    description: 'Build modern UIs with React',
    modules: [
      {
        id: 'mini-react-module-1',
        title: 'React Basics',
        description: 'Core React concepts',
        lessons: [
          { id: 1, title: 'Introduction to React', path: '/lessons/mini-react/fundamentals/intro', isPremium: false },
          { id: 2, title: 'Components', path: '/lessons/mini-react/fundamentals/components', isPremium: true }
        ]
      },
      {
        id: 'mini-react-module-2',
        title: 'React Hooks',
        description: 'Modern React with Hooks',
        lessons: [
          { id: 1, title: 'useState', path: '/lessons/mini-react/hooks/usestate', isPremium: true },
          { id: 2, title: 'useEffect', path: '/lessons/mini-react/hooks/useeffect', isPremium: true }
        ]
      }
    ]
  },
  'mini-testing': {
    title: 'Testing Essentials',
    description: 'Master unit testing and test-driven development',
    modules: [
      {
        id: 'mini-testing-module-1',
        title: 'Testing Fundamentals',
        description: 'Introduction to testing',
        lessons: [
          { id: 1, title: 'Introduction to Testing', path: '/lessons/mini-testing/fundamentals/intro', isPremium: false },
          { id: 2, title: 'Your First Test', path: '/lessons/mini-testing/fundamentals/first-test', isPremium: true }
        ]
      },
      {
        id: 'mini-testing-module-2',
        title: 'Unit Testing',
        description: 'Writing effective unit tests',
        lessons: [
          { id: 1, title: 'Test Structure', path: '/lessons/mini-testing/unit/structure', isPremium: true },
          { id: 2, title: 'Mocking', path: '/lessons/mini-testing/unit/mocking', isPremium: true }
        ]
      }
    ]
  }
};

export default function MiniCourses() {
  const { theme } = useTheme();

  return (
    <PageLayout>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Course Header */}
          <div className={`mb-8 p-6 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-800'
              : theme === 'neurodivergent'
              ? 'bg-amber-100/50'
              : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Link
                  to="/courses"
                  className={`text-sm font-medium ${
                    theme === 'dark'
                      ? 'text-indigo-400 hover:text-indigo-300'
                      : theme === 'neurodivergent'
                      ? 'text-teal-600 hover:text-teal-500'
                      : 'text-indigo-600 hover:text-indigo-500'
                  }`}
                >
                  ← Back to Courses
                </Link>
                <h1 className={`text-3xl font-bold mt-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Mini Courses
                </h1>
              </div>
              <div className={`text-sm px-3 py-1 rounded-full ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-200 text-gray-900'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                Mock Courses
              </div>
            </div>
            <p className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Focused learning paths for specific skills. Each mini course is designed to help you master
              a particular technology or concept.
            </p>
          </div>

          {/* Mini Courses Grid */}
          <div className="grid grid-cols-1 gap-8">
            {Object.entries(MOCK_MINI_COURSES).map(([courseId, course]) => (
              <BaseCard key={courseId}>
                <div className="p-6">
                  <h2 className={`text-2xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {course.title}
                  </h2>
                  <p className={`mb-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {course.description}
                  </p>

                  {/* Modules */}
                  <div className="space-y-6">
                    {course.modules.map((module) => (
                      <div key={module.id}>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {module.title}
                        </h3>
                        <p className={`mb-4 text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {module.description}
                        </p>

                        {/* Lessons */}
                        <div className="space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`p-3 rounded-lg ${
                                theme === 'dark'
                                  ? 'bg-gray-700'
                                  : theme === 'neurodivergent'
                                  ? 'bg-amber-50'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  {lesson.title}
                                </span>
                                {lesson.isPremium ? (
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    theme === 'dark'
                                      ? 'bg-gray-600 text-gray-300'
                                      : theme === 'neurodivergent'
                                      ? 'bg-amber-200 text-gray-900'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    Premium
                                  </span>
                                ) : (
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    theme === 'dark'
                                      ? 'bg-green-900/20 text-green-400'
                                      : theme === 'neurodivergent'
                                      ? 'bg-teal-100 text-teal-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    Free Trial
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BaseCard>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}