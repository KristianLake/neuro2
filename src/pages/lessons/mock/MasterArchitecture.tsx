import { useTheme } from '../../../contexts/ThemeContext';
import { PageLayout } from '../../../components/layouts';
import { BaseCard } from '../../../components/base';
import { Link } from 'react-router-dom';

// Mock data for Architecture & Performance Masterclass
const MOCK_MODULES = [
  {
    id: 'master-arch-module-1',
    title: 'TypeScript Design Patterns',
    description: 'Deep dive into advanced TypeScript patterns and their real-world applications.',
    lessons: [
      { id: 1, title: 'Introduction to Design Patterns', path: '/lessons/master-architecture/design-patterns/intro', isPremium: false },
      { id: 2, title: 'Factory Pattern', path: '/lessons/master-architecture/design-patterns/factory', isPremium: true },
      { id: 3, title: 'Observer Pattern', path: '/lessons/master-architecture/design-patterns/observer', isPremium: true }
    ]
  },
  {
    id: 'master-arch-module-2',
    title: 'Understanding Microservices',
    description: 'Learn how to design, build, and deploy scalable microservices architectures.',
    lessons: [
      { id: 1, title: 'Microservices Fundamentals', path: '/lessons/master-architecture/microservices/intro', isPremium: true },
      { id: 2, title: 'Service Communication', path: '/lessons/master-architecture/microservices/communication', isPremium: true }
    ]
  },
  {
    id: 'master-arch-module-3',
    title: 'Web Performance Optimization',
    description: 'Master advanced techniques for optimizing web application performance.',
    lessons: [
      { id: 1, title: 'Performance Metrics', path: '/lessons/master-architecture/performance/metrics', isPremium: true },
      { id: 2, title: 'Bundle Optimization', path: '/lessons/master-architecture/performance/bundling', isPremium: true }
    ]
  }
];

export default function MasterArchitecture() {
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
                  Architecture & Performance Masterclass
                </h1>
              </div>
              <div className={`text-sm px-3 py-1 rounded-full ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-200 text-gray-900'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                Mock Course
              </div>
            </div>
            <p className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Deep dive into TypeScript design patterns, microservices architecture, and web performance optimization.
              Perfect for developers looking to level up their architectural skills.
            </p>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 gap-6">
            {MOCK_MODULES.map((module) => (
              <BaseCard key={module.id}>
                <div className="p-6">
                  <h2 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {module.title}
                  </h2>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
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
              </BaseCard>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}