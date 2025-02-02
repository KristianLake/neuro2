import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCourseAccess } from '../hooks/useCourseAccess';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

const achievements: Achievement[] = [
  {
    id: 'first-program',
    title: 'Hello, Coder!',
    description: 'Wrote your first program',
    icon: '🚀'
  },
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Completed your first lesson',
    icon: '🎯'
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Completed a lesson in one session',
    icon: '⚡'
  },
  {
    id: 'helper',
    title: 'Helpful Hand',
    description: 'Helped another student in the community',
    icon: '🤝'
  }
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { checkModuleAccess } = useCourseAccess();
  const [userProgress, setUserProgress] = useState({
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    achievements: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await updateProfile({ full_name: fullName });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profile Settings */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Settings</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Update your personal information and preferences.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-5">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              )}

              {message && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                  {message}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={user?.email}
                      disabled
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Your Progress</h3>
            
            {/* Level and XP */}
            <div className="mt-6 bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-2xl font-bold text-indigo-600">Level {userProgress.level}</span>
                  <span className="ml-2 text-sm text-indigo-600">
                    {userProgress.xp} / {userProgress.nextLevelXp} XP
                  </span>
                </div>
                <div className="text-3xl">🏆</div>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(userProgress.xp / userProgress.nextLevelXp) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Achievements</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      userProgress.achievements.includes(achievement.id)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{achievement.icon}</span>
                      <div>
                        <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Learning Streak */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Learning Streak</h3>
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <span className="text-xl font-bold text-gray-900">3 days</span>
              <span className="text-gray-500">Keep it up!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}