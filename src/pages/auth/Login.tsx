import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import AuthLayout from '../../components/AuthLayout';

export default function Login() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(email, password);
      navigate('/courses');
    } catch (err) {
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Error Modal */}
      <Dialog
        as="div"
        className="relative z-10"
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Dialog.Panel className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${
              theme === 'dark'
                ? 'bg-gray-800'
                : theme === 'neurodivergent'
                ? 'bg-amber-50'
                : 'bg-white'
            }`}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className={`h-6 w-6 ${
                      theme === 'dark'
                        ? 'text-red-400'
                        : theme === 'neurodivergent'
                        ? 'text-red-600'
                        : 'text-red-400'
                    }`} aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-base font-semibold ${
                      theme === 'dark'
                        ? 'text-red-400'
                        : theme === 'neurodivergent'
                        ? 'text-red-800'
                        : 'text-red-800'
                    }`}>
                      Login Failed
                    </h3>
                    <div className={`mt-2 text-sm ${
                      theme === 'dark'
                        ? 'text-gray-300'
                        : theme === 'neurodivergent'
                        ? 'text-gray-700'
                        : 'text-gray-500'
                    }`}>
                      <p>
                        The email or password you entered is incorrect. Please try again.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : theme === 'neurodivergent'
                        ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    onClick={() => setShowErrorModal(false)}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      <AuthLayout 
        title="Welcome back!"
        subtitle="Sign in to continue your learning journey"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50 border-amber-200 text-gray-900 placeholder-gray-400 focus:border-teal-600 focus:ring-teal-600'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50 border-amber-200 text-gray-900 placeholder-gray-400 focus:border-teal-600 focus:ring-teal-600'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/auth/reset-password"
                className={`font-medium ${
                  theme === 'dark'
                    ? 'text-indigo-400 hover:text-indigo-300'
                    : theme === 'neurodivergent'
                    ? 'text-teal-600 hover:text-teal-500'
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                theme === 'dark'
                  ? 'bg-indigo-500 hover:bg-indigo-400 focus:ring-indigo-400'
                  : theme === 'neurodivergent'
                  ? 'bg-teal-600 hover:bg-teal-500 focus:ring-teal-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Don't have an account?{' '}
            </span>
            <Link
              to="/auth/register"
              className={`font-medium ${
                theme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : theme === 'neurodivergent'
                  ? 'text-teal-600 hover:text-teal-500'
                  : 'text-indigo-600 hover:text-indigo-500'
              }`}
            >
              Sign up
            </Link>
          </div>
        </form>
      </AuthLayout>
    </>
  );
}