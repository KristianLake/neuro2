import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, type ThemeMode } from '../contexts/ThemeContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'neurodivergent'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`border-b ${
      theme === 'dark'
        ? 'bg-gray-900 border-gray-800'
        : theme === 'neurodivergent'
        ? 'bg-amber-50 border-amber-200'
        : 'bg-white border-gray-200'
    }`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center">
            <img src="/logo.svg" alt="NeuroCode Logo" className="h-8 w-auto" />
            <span className={`ml-2 text-2xl font-bold ${
              theme === 'dark'
                ? 'text-indigo-400'
                : theme === 'neurodivergent'
                ? 'text-teal-600'
                : 'text-indigo-600'
            }`}>NeuroCode</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ${
              theme === 'dark'
                ? 'text-gray-200 hover:text-gray-300'
                : 'text-gray-700 hover:text-gray-600'
            }`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            to="/"
            className={`text-sm font-semibold leading-6 ${
              theme === 'dark'
                ? 'text-gray-100 hover:text-gray-300'
                : 'text-gray-900 hover:text-gray-600'
            }`}
          >
            Home
          </Link>
          
          <Link
            to="/courses"
            className={`text-sm font-semibold leading-6 ${
              theme === 'dark'
                ? 'text-gray-100 hover:text-gray-300'
                : 'text-gray-900 hover:text-gray-600'
            }`}
          >
            Courses
          </Link>
          
          <Link
            to="#about"
            className={`text-sm font-semibold leading-6 ${
              theme === 'dark'
                ? 'text-gray-100 hover:text-gray-300'
                : 'text-gray-900 hover:text-gray-600'
            }`}
          >
            About
          </Link>
          
          <Link
            to="#contact"
            className={`text-sm font-semibold leading-6 ${
              theme === 'dark'
                ? 'text-gray-100 hover:text-gray-300'
                : 'text-gray-900 hover:text-gray-600'
            }`}
          >
            Contact
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
          {/* Theme Toggle */}
          <div className="flex items-center">
            <button
              onClick={cycleTheme}
              className={`p-2 rounded-lg transition-colors flex items-center ${
                theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'hover:bg-amber-200/50'
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <SunIcon className="h-5 w-5 text-gray-600 my-auto" />
              ) : theme === 'dark' ? (
                <MoonIcon className="h-5 w-5 text-gray-300 my-auto" />
              ) : (
                <SparklesIcon className="h-5 w-5 text-gray-600 my-auto" />
              )}
            </button>
          </div>
          {user ? (
            <>
              <Link
                to="/profile"
                className={`text-sm font-semibold leading-6 flex items-center ${
                  theme === 'dark'
                    ? 'text-gray-100 hover:text-gray-300'
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                Profile
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`text-sm font-semibold leading-6 flex items-center ${
                    theme === 'dark'
                      ? 'text-gray-100 hover:text-gray-300'
                      : 'text-gray-900 hover:text-gray-600'
                  }`}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className={`text-sm font-semibold leading-6 flex items-center ${
                  theme === 'dark'
                    ? 'text-gray-100 hover:text-gray-300'
                    : 'text-gray-900 hover:text-gray-600'
                }`}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth/login"
              className={`text-sm font-semibold leading-6 flex items-center ${
                theme === 'dark'
                  ? 'text-gray-100 hover:text-gray-300'
                  : 'text-gray-900 hover:text-gray-600'
              }`}
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className={`fixed inset-0 z-10 ${
          theme === 'dark'
            ? 'bg-gray-900/80'
            : theme === 'neurodivergent'
            ? 'bg-amber-900/20'
            : 'bg-gray-500/75'
        }`} />
        <Dialog.Panel className={`fixed inset-y-0 right-0 z-10 w-full overflow-y-auto px-6 py-6 sm:max-w-sm sm:ring-1 ${
          theme === 'dark'
            ? 'bg-gray-800 sm:ring-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50 sm:ring-amber-200'
            : 'bg-white sm:ring-gray-900/10'
        }`}>
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center">
              <img src="/logo.svg" alt="NeuroCode Logo" className="h-8 w-auto" />
              <span className={`ml-2 text-2xl font-bold ${
                theme === 'dark'
                  ? 'text-indigo-400'
                  : theme === 'neurodivergent'
                  ? 'text-teal-600'
                  : 'text-indigo-600'
              }`}>NeuroCode</span>
            </Link>
            <button
              type="button"
              className={`-m-2.5 rounded-md p-2.5 ${
                theme === 'dark'
                  ? 'text-gray-200 hover:text-gray-300'
                  : 'text-gray-700 hover:text-gray-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className={`-my-6 divide-y ${
              theme === 'dark'
                ? 'divide-gray-700'
                : theme === 'neurodivergent'
                ? 'divide-amber-200'
                : 'divide-gray-100'
            }`}>
              <div className="space-y-2 py-6">
                {/* Theme Toggle */}
                <button
                  onClick={cycleTheme}
                  className={`-mx-3 flex w-full items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                    theme === 'dark'
                      ? 'text-gray-200 hover:bg-gray-700'
                      : theme === 'neurodivergent'
                      ? 'text-gray-900 hover:bg-amber-100'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">
                    {theme === 'light' ? (
                      <SunIcon className="h-5 w-5" />
                    ) : theme === 'dark' ? (
                      <MoonIcon className="h-5 w-5" />
                    ) : (
                      <SparklesIcon className="h-5 w-5" />
                    )}
                  </span>
                  {theme === 'light' ? 'Light Mode' : theme === 'dark' ? 'Dark Mode' : 'Focus Mode'}
                </button>
                <Link
                  to="/"
                  className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                    theme === 'dark'
                      ? 'text-gray-200 hover:bg-gray-700'
                      : theme === 'neurodivergent'
                      ? 'text-gray-900 hover:bg-amber-100'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/courses"
                  className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                    theme === 'dark'
                      ? 'text-gray-200 hover:bg-gray-700'
                      : theme === 'neurodivergent'
                      ? 'text-gray-900 hover:bg-amber-100'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Courses
                </Link>
                <Link
                  to="#about"
                  className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                    theme === 'dark'
                      ? 'text-gray-200 hover:bg-gray-700'
                      : theme === 'neurodivergent'
                      ? 'text-gray-900 hover:bg-amber-100'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="#contact"
                  className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                    theme === 'dark'
                      ? 'text-gray-200 hover:bg-gray-700'
                      : theme === 'neurodivergent'
                      ? 'text-gray-900 hover:bg-amber-100'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
              <div className="py-6">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className={`-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 ${
                        theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-700'
                          : theme === 'neurodivergent'
                          ? 'text-gray-900 hover:bg-amber-100'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className={`-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 ${
                          theme === 'dark'
                            ? 'text-gray-200 hover:bg-gray-700'
                            : theme === 'neurodivergent'
                            ? 'text-gray-900 hover:bg-amber-100'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className={`-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 w-full text-left ${
                        theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-700'
                          : theme === 'neurodivergent'
                          ? 'text-gray-900 hover:bg-amber-100'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth/login"
                    className={`-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 ${
                      theme === 'dark'
                        ? 'text-gray-200 hover:bg-gray-700'
                        : theme === 'neurodivergent'
                        ? 'text-gray-900 hover:bg-amber-100'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}