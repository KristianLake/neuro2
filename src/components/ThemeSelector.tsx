import { useTheme } from '../contexts/ThemeContext';
import type { ThemeMode } from '../contexts/ThemeContext';

const themes: { id: ThemeMode; name: string; description: string; icon: string }[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Default light theme with clean, crisp visuals',
    icon: '☀️'
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Reduced eye strain in low-light conditions',
    icon: '🌙'
  },
  {
    id: 'neurodivergent',
    name: 'Focus',
    description: 'Enhanced readability with warm, calming colors',
    icon: '🎯'
  }
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`shadow sm:rounded-lg overflow-hidden ${
      theme === 'dark'
        ? 'bg-gray-800'
        : theme === 'neurodivergent'
        ? 'bg-amber-100/50'
        : 'bg-white'
    }`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className={`text-lg font-medium leading-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Theme Settings
        </h3>
        <div className={`mt-2 max-w-xl text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Choose a theme that works best for you.</p>
        </div>
        <div className="mt-5 space-y-4">
          {themes.map((themeOption) => (
            <div
              key={themeOption.id}
              className={`relative flex items-start cursor-pointer p-4 rounded-lg transition-colors ${
                theme === themeOption.id
                  ? theme === 'dark'
                    ? 'bg-indigo-900/50 border-2 border-indigo-400'
                    : theme === 'neurodivergent'
                    ? 'bg-teal-50 border-2 border-teal-600'
                    : 'bg-indigo-50 border-2 border-indigo-500'
                  : theme === 'dark'
                  ? 'hover:bg-gray-700 border-2 border-transparent'
                  : theme === 'neurodivergent'
                  ? 'hover:bg-amber-200/50 border-2 border-transparent'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => setTheme(themeOption.id)}
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="theme"
                  checked={theme === themeOption.id}
                  onChange={() => setTheme(themeOption.id)}
                  className={`h-4 w-4 border-gray-300 focus:ring-2 ${
                    theme === 'dark'
                      ? 'text-indigo-400 focus:ring-indigo-400'
                      : theme === 'neurodivergent'
                      ? 'text-teal-600 focus:ring-teal-600'
                      : 'text-indigo-600 focus:ring-indigo-500'
                  }`}
                />
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{themeOption.icon}</span>
                  <label className={`font-medium ${
                    theme === themeOption.id
                      ? theme === 'dark'
                        ? 'text-indigo-300'
                        : theme === 'neurodivergent'
                        ? 'text-teal-900'
                        : 'text-indigo-900'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}>
                    {themeOption.name}
                  </label>
                </div>
                <p className={`text-sm ${
                  theme === themeOption.id
                    ? theme === 'dark'
                      ? 'text-indigo-300'
                      : theme === 'neurodivergent'
                      ? 'text-teal-700'
                      : 'text-indigo-700'
                    : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}>
                  {themeOption.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}