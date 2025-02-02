import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layouts';
import { BaseCard } from '../components/base';
import { Link } from 'react-router-dom';

const COURSES = [
  {
    id: 'full-course',
    title: 'The 90-Day Web Developer Program',
    description: 'Master web development with our structured, neurodivergent-friendly approach. Complete transformation program designed to take you from beginner to job-ready developer.',
    price: 2497,
    type: 'complete',
    slug: 'web-developer-program',
    features: [
      'Complete course access',
      'Group Q&A sessions',
      'Discord community',
      'Project feedback',
      'Free trial of first lesson'
    ]
  },
  {
    id: 'master-architecture',
    title: 'Architecture & Performance Masterclass',
    description: 'Deep dive into TypeScript design patterns, microservices architecture, and web performance optimization. Perfect for developers looking to level up their architectural skills.',
    price: 447,
    type: 'masterclass',
    slug: 'architecture-masterclass',
    features: [
      'Advanced TypeScript patterns',
      'Microservices architecture',
      'Performance optimization',
      'Real-world projects',
      'Free introduction lesson'
    ]
  }
];

const MINI_COURSES = [
  {
    id: 'web-basics',
    title: 'Web Basics Bundle',
    description: 'Essential web development fundamentals including HTML, CSS, and basic JavaScript.',
    price: 247,
    type: 'mini',
    slug: 'web-basics'
  },
  {
    id: 'mini-typescript',
    title: 'TypeScript Essentials',
    description: 'Master core TypeScript concepts with practical, hands-on exercises.',
    price: 397,
    type: 'mini',
    slug: 'typescript-essentials'
  },
  {
    id: 'mini-react',
    title: 'React Essentials',
    description: 'Build modern web applications with React through project-based learning.',
    price: 597,
    type: 'mini',
    slug: 'react-fundamentals'
  }
];

export default function Courses() {
  const { theme } = useTheme();

  const getPurchasePath = (course: typeof COURSES[0] | typeof MINI_COURSES[0]) => {
    switch (course.type) {
      case 'complete':
        return `/purchase/course/${course.id}`;
      case 'masterclass':
        return `/purchase/master/${course.id}`;
      case 'mini':
        return `/purchase/mini/${course.id}`;
      default:
        return `/purchase/${course.id}`;
    }
  };

  return (
    <PageLayout>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Complete Programs */}
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Programs & Masterclasses</h2>
            <p className={`mt-2 text-lg leading-8 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Comprehensive learning paths and specialized masterclasses.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-5xl">
            {COURSES.map((course) => (
              <BaseCard key={course.id}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {course.title}
                      </h3>
                      <p className={`mt-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className={`mb-6 rounded-lg p-4 ${
                    theme === 'dark'
                      ? 'bg-gray-700'
                      : theme === 'neurodivergent'
                      ? 'bg-amber-50'
                      : 'bg-gray-50'
                  }`}>
                    <ul className={`space-y-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to={`/courses/${course.slug}`}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-600 text-white hover:bg-gray-500'
                          : theme === 'neurodivergent'
                          ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      View Course Details →
                    </Link>
                    <Link
                      to={getPurchasePath(course)}
                      className={`px-4 py-2 rounded-md text-sm font-semibold ${
                        theme === 'dark'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                          : theme === 'neurodivergent'
                          ? 'bg-teal-600 text-white hover:bg-teal-500'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Purchase Course £{course.price}
                    </Link>
                  </div>
                </div>
              </BaseCard>
            ))}
          </div>

          {/* Mini Courses */}
          <div className="mx-auto mt-24 max-w-2xl lg:mx-0">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Mini Courses</h2>
            <p className={`mt-2 text-lg leading-8 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Focused learning paths for specific skills.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {MINI_COURSES.map((course) => (
              <BaseCard key={course.id}>
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {course.title}
                  </h3>
                  <p className={`mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/courses/${course.slug}`}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-gray-600 text-white hover:bg-gray-500'
                          : theme === 'neurodivergent'
                          ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      View Details →
                    </Link>
                    <Link
                      to={getPurchasePath(course)}
                      className={`px-4 py-2 rounded-md text-sm font-semibold ${
                        theme === 'dark'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                          : theme === 'neurodivergent'
                          ? 'bg-teal-600 text-white hover:bg-teal-500'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      £{course.price}
                    </Link>
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