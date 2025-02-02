import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const BETA_PASSWORD = 'neurocode2024'; // This would typically come from an environment variable

export default function ComingSoon() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password === BETA_PASSWORD) {
        // Store beta access in session storage
        sessionStorage.setItem('betaAccess', 'true');
        navigate(0);
      } else {
        setError('Invalid beta access code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      theme === 'dark'
        ? 'bg-gray-900'
        : theme === 'neurodivergent'
        ? 'bg-amber-50'
        : 'bg-white'
    }`}>
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <img src="/logo.svg" alt="NeuroCode Logo" className="h-16 w-auto mx-auto mb-8" />

          {/* Title */}
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Coming Soon
          </h1>

          {/* Description */}
          <p className={`text-lg mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            A neurodivergent-friendly approach to learning web development.
            Master TypeScript, React, and modern web technologies through structured,
            clear learning paths.
          </p>

          {/* Features List */}
          <div className={`mb-8 text-left mx-auto max-w-sm rounded-lg p-6 ${
            theme === 'dark'
              ? 'bg-gray-800'
              : theme === 'neurodivergent'
              ? 'bg-amber-100/50'
              : 'bg-gray-50'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              What to Expect
            </h2>
            <ul className={`space-y-3 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li className="flex items-center">
                <span className="text-xl mr-3">📚</span>
                <span>Structured learning paths</span>
              </li>
              <li className="flex items-center">
                <span className="text-xl mr-3">🎯</span>
                <span>Clear, focused lessons</span>
              </li>
              <li className="flex items-center">
                <span className="text-xl mr-3">👥</span>
                <span>Supportive community</span>
              </li>
              <li className="flex items-center">
                <span className="text-xl mr-3">🎮</span>
                <span>Achievement system</span>
              </li>
            </ul>
          </div>

          {/* Beta Access Form */}
          <div className={`mx-auto max-w-sm rounded-lg p-6 ${
            theme === 'dark'
              ? 'bg-gray-800'
              : theme === 'neurodivergent'
              ? 'bg-amber-100/50'
              : 'bg-white'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Beta Access
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className={`p-3 rounded-md text-sm ${
                  theme === 'dark'
                    ? 'bg-red-900/20 text-red-400'
                    : 'bg-red-50 text-red-800'
                }`}>
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="password" className="sr-only">
                  Beta Access Code
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter beta access code"
                  className={`block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white ring-gray-600 placeholder:text-gray-400 focus:ring-indigo-500'
                      : theme === 'neurodivergent'
                      ? 'bg-amber-50 text-gray-900 ring-amber-200 placeholder:text-gray-400 focus:ring-teal-600'
                      : 'bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                  }`}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
                  theme === 'dark'
                    ? 'bg-indigo-600 hover:bg-indigo-500'
                    : theme === 'neurodivergent'
                    ? 'bg-teal-600 hover:bg-teal-500'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                {loading ? 'Checking...' : 'Access Beta'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              © {new Date().getFullYear()} NeuroCode Learning. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}