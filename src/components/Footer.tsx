import { Link } from 'react-router-dom';

import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={`${
      theme === 'dark'
        ? 'bg-gray-900 border-t border-gray-800'
        : theme === 'neurodivergent'
        ? 'bg-amber-50 border-t border-amber-200'
        : 'bg-white border-t border-gray-200'
    }`}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link
            to="/terms"
            className={`${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : theme === 'neurodivergent'
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className={`${
              theme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : theme === 'neurodivergent'
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            Privacy Policy
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className={`text-center text-xs leading-5 ${
            theme === 'dark'
              ? 'text-gray-400'
              : theme === 'neurodivergent'
              ? 'text-gray-600'
              : 'text-gray-500'
          }`}>
            &copy; {new Date().getFullYear()} NeuroCode Learning. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}