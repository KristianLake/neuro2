import { useTheme } from '../contexts/ThemeContext';
import type { FontMode } from '../contexts/ThemeContext';

const fonts: { id: FontMode; name: string; description: string; icon: string }[] = [
  {
    id: 'system',
    name: 'System Font',
    description: 'Your device\'s default font',
    icon: '🖥️'
  },
  {
    id: 'dyslexic',
    name: 'OpenDyslexic',
    description: 'Designed for improved readability for dyslexic users',
    icon: '📖'
  }
];

export default function FontSelector() {
  const { theme, font, setFont } = useTheme();

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
          Font Settings
        </h3>
        <div className={`mt-2 max-w-xl text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Choose a font that works best for your reading needs.</p>
        </div>
        <div className="mt-5 space-y-4">
          {fonts.map((fontOption) => (
            <div
              key={fontOption.id}
              className={`relative flex items-start cursor-pointer p-4 rounded-lg transition-colors ${
                font === fontOption.id
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
              onClick={() => setFont(fontOption.id)}
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="font"
                  checked={font === fontOption.id}
                  onChange={() => setFont(fontOption.id)}
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
                  <span className="text-xl mr-2">{fontOption.icon}</span>
                  <label className={`font-medium ${
                    font === fontOption.id
                      ? theme === 'dark'
                        ? 'text-indigo-300'
                        : theme === 'neurodivergent'
                        ? 'text-teal-900'
                        : 'text-indigo-900'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}>
                    {fontOption.name}
                  </label>
                </div>
                <p className={`text-sm ${
                  font === fontOption.id
                    ? theme === 'dark'
                      ? 'text-indigo-300'
                      : theme === 'neurodivergent'
                      ? 'text-teal-700'
                      : 'text-indigo-700'
                    : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}>
                  {fontOption.description}
                </p>
              </div>
              {/* Font Preview */}
              <div className={`mt-2 p-3 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <p className={`text-sm ${fontOption.id === 'dyslexic' ? 'font-dyslexic' : ''} ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}