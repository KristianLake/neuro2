import { Link } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';

export default function GamificationCTA() {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
        theme === 'dark'
          ? 'bg-gray-800 border border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border border-amber-200'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">🎮</span>
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Want to track your progress?
            </h3>
            <div className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              <p>Sign up to earn achievements and track your learning journey!</p>
            </div>
            <div className="mt-3">
              <Link
                to="/auth/register"
                className={`text-sm font-medium ${
                  theme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : theme === 'neurodivergent'
                    ? 'text-teal-600 hover:text-teal-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                Create Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}