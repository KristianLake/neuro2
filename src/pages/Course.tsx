import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePurchases } from '../hooks/usePurchases';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layouts';
import { BaseCard } from '../components/base';
import { Course as CourseType } from '../types/content';

export default function Course() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId?: string; }>();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            modules:modules (
              *,
              lessons:lessons (*)
            )
          `)
          .eq('id', courseId)
          .single();

        if (error) throw error;

        const processedCourse = {
          ...data,
          modules: data.modules.map((module: any) => ({
            ...module,
            lessons: module.lessons.map((lesson: any) => ({
              ...lesson,
              isPremium: lesson.is_premium
            })).sort((a: any, b: any) => a.order_number - b.order_number)
          })).sort((a: any, b: any) => a.order_number - b.order_number),
          metadata: {
            targetAudience: data.metadata?.targetAudience || [],
            idealFor: data.metadata?.idealFor || [],
            notFor: data.metadata?.notFor || [],
            benefits: data.metadata?.benefits || {
              increase: [],
              decrease: []
            }
          }
        };

        setCourse(processedCourse);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (course && moduleId) {
      const module = course.modules.find(m => m.id === moduleId);
      setSelectedModule(module || null);
    } else {
      setSelectedModule(null);
    }
  }, [course, moduleId]);

  useEffect(() => {
    if (!loading && !course) {
      navigate('/courses');
    }
  }, [loading, course, navigate]);

  const handlePurchaseClick = () => {
    if (!user) {
      navigate('/auth/login', { state: { from: location.pathname } });
      return;
    }

    if (!course) return;

    let purchasePath = '/purchase/';
    switch (course.type) {
      case 'mini':
        purchasePath += `mini/${courseId}`;
        break;
      case 'masterclass':
        purchasePath += `master/${courseId}`;
        break;
      case 'complete':
        purchasePath += courseId;
        break;
      default:
        purchasePath += courseId;
    }

    navigate(purchasePath);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Course</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  if (moduleId && selectedModule)
  {
    return (
      <PageLayout>
        <div className="py-12">
          <div className={ `mb-8 p-6 rounded-lg ${ theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
              ? 'bg-amber-100/50'
              : 'bg-white'
            }` }>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Link
                  to={ `/courses/${ courseId }` }
                  className={ `text-sm font-medium ${ theme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : theme === 'neurodivergent'
                      ? 'text-teal-600 hover:text-teal-500'
                      : 'text-indigo-600 hover:text-indigo-500'
                    }` }
                >
                  ← Back to Course
                </Link>
                <h1 className={ `text-3xl font-bold mt-2 ${ theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }` }>
                  { selectedModule.title }
                </h1>
              </div>
              <button
                onClick={ handlePurchaseClick }
                className={ `px-4 py-2 rounded-md text-sm font-semibold ${ theme === 'dark'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : theme === 'neurodivergent'
                    ? 'bg-teal-600 text-white hover:bg-teal-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }` }
              >
                Get { course.type === 'masterclass' ? 'Masterclass' : 'Module' } Access
              </button>
            </div>
            <p className={ `${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }` }>
              { selectedModule.description }
            </p>
          </div>

          <div className="space-y-4">
            { selectedModule.lessons.map((lesson) => (
              <div
                key={ lesson.id }
                className={ `p-4 rounded-lg ${ theme === 'dark'
                  ? 'bg-gray-800'
                  : theme === 'neurodivergent'
                    ? 'bg-amber-100/50'
                    : 'bg-white'
                  }` }
              >
                <div className="flex items-center justify-between">
                  <h3 className={ `font-medium ${ theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }` }>
                    { lesson.title }
                  </h3>
                  { lesson.is_premium ? (
                    <button
                      onClick={ handlePurchaseClick }
                      className={ `text-sm font-medium px-3 py-1.5 rounded ${ theme === 'dark'
                        ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-900/75'
                        : theme === 'neurodivergent'
                          ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        }` }
                    >
                      Unlock { course.type === 'masterclass' ? 'Masterclass' : course.type === 'mini' ? 'Course' : 'Module' }
                    </button>
                  ) : (
                    <Link
                      to={ lesson.path }
                      className={ `text-sm font-medium ${ theme === 'dark'
                        ? 'text-indigo-400 hover:text-indigo-300'
                        : theme === 'neurodivergent'
                          ? 'text-teal-600 hover:text-teal-500'
                          : 'text-indigo-600 hover:text-indigo-500'
                        }` }
                    >
                      Start Free Lesson →
                    </Link>
                  ) }
                </div>
              </div>
            )) }
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="py-12">
        <div className={ `mb-8 p-6 rounded-lg ${ theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
          }` }>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link
                to="/courses"
                className={ `text-sm font-medium ${ theme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : theme === 'neurodivergent'
                    ? 'text-teal-600 hover:text-teal-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                  }` }
              >
                ← Back to Courses
              </Link>
              <h1 className={ `text-3xl font-bold mt-2 ${ theme === 'dark' ? 'text-white' : 'text-gray-900'
                }` }>
                { course.title }
              </h1>
            </div>
            <button
              onClick={ handlePurchaseClick }
              className={ `px-4 py-2 rounded-md text-sm font-semibold ${ theme === 'dark'
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : theme === 'neurodivergent'
                  ? 'bg-teal-600 text-white hover:bg-teal-500'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }` }
            >
              Purchase { course.type === 'masterclass' ? 'Masterclass' : 'Course' } £{ course.price }
            </button>
          </div>
          <p className={ `${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }` }>
            { course.description }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={ `p-4 rounded-lg ${ theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
                ? 'bg-amber-50'
                : 'bg-gray-50'
              }` }>
              <h3 className={ `font-semibold mb-3 ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }` }>Perfect For</h3>
              <ul className={ `space-y-2 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }` }>
                { course.metadata?.targetAudience?.map((audience, index) => (
                  <li key={ index } className="flex items-center">
                    <span className="mr-2">👥</span>
                    { audience }
                  </li>
                )) }
              </ul>
            </div>

            <div className={ `p-4 rounded-lg ${ theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
                ? 'bg-amber-50'
                : 'bg-gray-50'
              }` }>
              <h3 className={ `font-semibold mb-3 ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }` }>Ideal For You If</h3>
              <ul className={ `space-y-2 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }` }>
                { course.metadata?.idealFor?.map((trait, index) => (
                  <li key={ index } className="flex items-center">
                    <span className="mr-2">✓</span>
                    { trait }
                  </li>
                )) }
              </ul>
            </div>

            <div className={ `p-4 rounded-lg ${ theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
                ? 'bg-amber-50'
                : 'bg-gray-50'
              }` }>
              <h3 className={ `font-semibold mb-3 ${ theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }` }>Not For You If</h3>
              <ul className={ `space-y-2 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }` }>
                { course.metadata?.notFor?.map((trait, index) => (
                  <li key={ index } className="flex items-center">
                    <span className="mr-2">✗</span>
                    { trait }
                  </li>
                )) }
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={ `p-4 rounded-lg ${ theme === 'dark'
              ? 'bg-green-900/20'
              : theme === 'neurodivergent'
                ? 'bg-teal-50'
                : 'bg-green-50'
              }` }>
              <h3 className={ `font-semibold mb-3 ${ theme === 'dark'
                ? 'text-green-400'
                : theme === 'neurodivergent'
                  ? 'text-teal-800'
                  : 'text-green-800'
                }` }>What You'll Gain</h3>
              <ul className={ `space-y-2 ${ theme === 'dark'
                ? 'text-green-300'
                : theme === 'neurodivergent'
                  ? 'text-teal-700'
                  : 'text-green-700'
                }` }>
                { course.metadata?.benefits?.increase.map((benefit, index) => (
                  <li key={ index } className="flex items-center">
                    <span className="mr-2">↑</span>
                    { benefit }
                  </li>
                )) }
              </ul>
            </div>

            <div className={ `p-4 rounded-lg ${ theme === 'dark'
              ? 'bg-red-900/20'
              : theme === 'neurodivergent'
                ? 'bg-red-50'
                : 'bg-red-50'
              }` }>
              <h3 className={ `font-semibold mb-3 ${ theme === 'dark'
                ? 'text-red-400'
                : theme === 'neurodivergent'
                  ? 'text-red-800'
                  : 'text-red-800'
                }` }>What You'll Reduce</h3>
              <ul className={ `space-y-2 ${ theme === 'dark'
                ? 'text-red-300'
                : theme === 'neurodivergent'
                  ? 'text-red-700'
                  : 'text-red-700'
                }` }>
                { course.metadata?.benefits?.decrease.map((benefit, index) => (
                  <li key={ index } className="flex items-center">
                    <span className="mr-2">↓</span>
                    { benefit }
                  </li>
                )) }
              </ul>
            </div>
          </div>
        </div>

        <h2 className={ `text-2xl font-bold mb-6 ${ theme === 'dark' ? 'text-white' : 'text-gray-900'
          }` }>Course Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          { course.modules.map((module) => (
            <BaseCard key={ module.id }>
              <div className="p-6">
                <h3 className={ `text-xl font-bold mb-2 ${ theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }` }>
                  { module.title }
                </h3>
                <p className={ `mb-4 ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }` }>
                  { module.description }
                </p>

                <div className="space-y-2 mb-4">
                  { module.lessons.map((lesson) => (
                    <div
                      key={ lesson.id }
                      className={ `p-3 rounded-lg ${ theme === 'dark'
                        ? 'bg-gray-700'
                        : theme === 'neurodivergent'
                          ? 'bg-amber-50'
                          : 'bg-gray-50'
                        }` }
                    >
                      <div className="flex items-center justify-between">
                        <span className={ `text-sm ${ theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }` }>
                          { lesson.title }
                        </span>
                        { lesson.is_premium ? (
                          <span className={ `text-xs px-2 py-1 rounded-full ${ theme === 'dark'
                            ? 'bg-gray-600 text-gray-300'
                            : theme === 'neurodivergent'
                              ? 'bg-amber-200 text-gray-900'
                              : 'bg-gray-200 text-gray-700'
                            }` }>
                            Premium
                          </span>
                        ) : (
                          <span className={ `text-xs px-2 py-1 rounded-full ${ theme === 'dark'
                            ? 'bg-green-900/20 text-green-400'
                            : theme === 'neurodivergent'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-green-100 text-green-800'
                            }` }>
                            Free Trial
                          </span>
                        ) }
                      </div>
                    </div>
                  )) }
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to={ `/courses/${ course.id }/${ module.id }` }
                    className={ `text-sm font-medium ${ theme === 'dark'
                      ? 'text-indigo-400 hover:text-indigo-300'
                      : theme === 'neurodivergent'
                        ? 'text-teal-600 hover:text-teal-500'
                        : 'text-indigo-600 hover:text-indigo-500'
                      }` }
                  >
                    View Module →
                  </Link>
                  <button
                    onClick={ handlePurchaseClick }
                    className={ `text-sm font-medium ${ theme === 'dark'
                      ? 'text-gray-300 hover:text-gray-200'
                      : theme === 'neurodivergent'
                        ? 'text-gray-700 hover:text-gray-800'
                        : 'text-gray-600 hover:text-gray-700'
                      }` }
                  >
                    Purchase { course.type === 'masterclass' ? 'Masterclass' : course.type === 'mini' ? 'Course' : 'Module' }
                  </button>
                </div>
              </div>
            </BaseCard>
          )) }
        </div>
      </div>
    </PageLayout>
  );
}