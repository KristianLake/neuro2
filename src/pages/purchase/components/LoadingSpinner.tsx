import { useTheme } from '../../../contexts/ThemeContext';

export function LoadingSpinner() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
        theme === 'dark'
          ? 'border-indigo-500'
          : theme === 'neurodivergent'
          ? 'border-teal-600'
          : 'border-indigo-600'
      }`}></div>
    </div>
  );
}