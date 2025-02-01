import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      theme === 'dark' ? 'bg-gray-800' : theme === 'neurodivergent' ? 'bg-amber-50' : 'bg-gray-50'
    }`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <img src="/logo.svg" alt="NeuroCode Logo" className="h-12 w-auto" />
        </Link>
        <h2 className={`mt-6 text-center text-3xl font-bold tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>{title}</h2>
        <p className={`mt-2 text-center text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>{subtitle}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
}