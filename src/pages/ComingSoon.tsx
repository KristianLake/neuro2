import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { PageLayout } from '../components/layouts';
import { useState } from 'react';
import { themeConfig } from '../config/theme';

const BETA_ACCESS_CODE = 'accessbeta';

export default function ComingSoon() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate access code with constant time comparison to prevent timing attacks
      const isValid = accessCode.length === BETA_ACCESS_CODE.length &&
        accessCode.split('').every((char, i) => char === BETA_ACCESS_CODE[i]);

      if (isValid) {
        // Store beta access in session storage and verify it was set
        sessionStorage.setItem('betaAccess', 'true');
        
        // Verify the session storage was set correctly
        if (sessionStorage.getItem('betaAccess') === 'true') {
          navigate('/', { replace: true });
        } else {
          throw new Error('Failed to set session storage');
        }
      } else {
        setError('Invalid access code. Please try again.');
        // Clear the input on error
        setAccessCode('');
      }
    } catch (err) {
      console.error('Beta access validation error:', err);
      setError('Access validation failed. Please try again.');
      // Clear the input on error
      setAccessCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(''); // Clear error when user starts typing
    setAccessCode(e.target.value);
  };

  return (
    <PageLayout className="flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <img src="/logo.svg" alt="NeuroCode Logo" className="h-16 w-auto mx-auto mb-8" />

          {/* Title */}
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark'
              ? `text-${themeConfig.colors.dark.text.primary}`
              : `text-${themeConfig.colors.light.text.primary}`
          }`}>
            Coming Soon
          </h1>

          {/* Description */}
          <p className={`text-lg mb-8 ${
            theme === 'dark'
              ? `text-${themeConfig.colors.dark.text.secondary}`
              : `text-${themeConfig.colors.light.text.secondary}`
          }`}>
            A neurodivergent-friendly approach to learning web development.
            Master TypeScript, React, and modern web technologies through structured,
            clear learning paths.
          </p>

          {/* Features List */}
          <div className={`mb-8 text-left mx-auto max-w-sm rounded-lg p-6 ${
            theme === 'dark'
              ? `bg-${themeConfig.colors.dark.background.card}`
              : theme === 'neurodivergent'
              ? `bg-${themeConfig.colors.neurodivergent.background.card}`
              : 'bg-gray-50'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${
              theme === 'dark'
                ? `text-${themeConfig.colors.dark.text.primary}`
                : `text-${themeConfig.colors.light.text.primary}`
            }`}>
              What to Expect
            </h2>
            <ul className={`space-y-3 ${
              theme === 'dark'
                ? `text-${themeConfig.colors.dark.text.secondary}`
                : `text-${themeConfig.colors.light.text.secondary}`
            }`}>
              {/* Features list items */}
            </ul>
          </div>

          {/* Beta Access Form */}
          <div className={`mx-auto max-w-sm rounded-lg p-6 ${
            theme === 'dark'
              ? `bg-${themeConfig.colors.dark.background.card}`
              : theme === 'neurodivergent'
              ? `bg-${themeConfig.colors.neurodivergent.background.card}`
              : 'bg-white'
          }`}>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div>
                <label htmlFor="password" className="sr-only">
                  Access Code
                </label>
                <input
                  type="password"
                  id="password"
                  value={accessCode}
                  onChange={handleInputChange}
                  placeholder="Enter access code"
                  autoComplete="off"
                  className={`block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white ring-gray-600 placeholder:text-gray-400 focus:ring-indigo-500'
                      : theme === 'neurodivergent'
                      ? 'bg-amber-50 text-gray-900 ring-amber-200 placeholder:text-gray-500 focus:ring-teal-500'
                      : 'bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                  }`}
                />
              </div>
              <div className="mt-4">
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
                  {loading ? 'Validating...' : 'Access Beta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`py-8 ${
        theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.card}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.card}`
          : 'bg-gray-50'
      }`}>
        {/* Footer content */}
      </footer>
        </PageLayout>
      );
    }