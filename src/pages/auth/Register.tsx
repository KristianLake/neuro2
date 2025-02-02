import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthLayout from '../../components/AuthLayout';

export default function Register() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(email, password, fullName);
      navigate('/courses');
    } catch (err) {
      setError('Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create your account"
      subtitle="Start your learning journey today"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className={`border px-4 py-3 rounded relative ${
            theme === 'dark'
              ? 'bg-red-900/20 border-red-800 text-red-400'
              : theme === 'neurodivergent'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className={`block text-sm font-medium ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Full name
          </label>
          <div className="mt-1">
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              autoComplete="new-password"
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
          <p className="mt-2 text-sm text-gray-500">
            Must be at least 8 characters long
          </p>
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <div className="text-sm text-center">
          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Already have an account?{' '}
          </span>
          <Link
            to="/auth/login"
            className={`font-medium ${
              theme === 'dark'
                ? 'text-indigo-400 hover:text-indigo-300'
                : theme === 'neurodivergent'
                ? 'text-teal-600 hover:text-teal-500'
                : 'text-indigo-600 hover:text-indigo-500'
            }`}
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}