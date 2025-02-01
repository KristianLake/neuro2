import { useTheme } from '../contexts/ThemeContext';
import type { LineSpacingMode } from '../contexts/ThemeContext';

const spacingOptions: { id: LineSpacingMode; name: string; description: string; icon: string }[] = [
  {
    id: 'normal',
    name: 'Normal',
    description: 'Standard line spacing',
    icon: '📝'
  },
  {
    id: 'relaxed',
    name: 'Relaxed',
    description: 'More space between lines for easier reading',
    icon: '📖'
  },
  {
    id: 'loose',
    name: 'Loose',
    description: 'Maximum spacing for maximum readability',
    icon: '📑'
  }
];

export default function LineSpacingSelector() {
  const { theme, lineSpacing, setLineSpacing } = useTheme();

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
          Line Spacing
        </h3>
        <div className={`mt-2 max-w-xl text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Adjust the space between lines to make reading more comfortable.</p>
        </div>
        <div className="mt-5 space-y-4">
          {spacingOptions.map((option) => (
            <div
              key={option.id}
              className={`relative flex items-start cursor-pointer p-4 rounded-lg transition-colors ${
                lineSpacing === option.id
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
              onClick={() => setLineSpacing(option.id)}
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="lineSpacing"
                  checked={lineSpacing === option.id}
                  onChange={() => setLineSpacing(option.id)}
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
                  <span className="text-xl mr-2">{option.icon}</span>
                  <label className={`font-medium ${
                    lineSpacing === option.id
                      ? theme === 'dark'
                        ? 'text-indigo-300'
                        : theme === 'neurodivergent'
                        ? 'text-teal-900'
                        : 'text-indigo-900'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}>
                    {option.name}
                  </label>
                </div>
                <p className={`text-sm ${
                  lineSpacing === option.id
                    ? theme === 'dark'
                      ? 'text-indigo-300'
                      : theme === 'neurodivergent'
                      ? 'text-teal-700'
                      : 'text-indigo-700'
                    : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}>
                  {option.description}
                </p>
              </div>
              {/* Preview */}
              <div className={`mt-2 p-3 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <p className={`text-sm spacing-${option.id} ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  This is a preview of how the text will look with this line spacing.
                  Multiple lines help you see the difference between spacing options.
                  Choose what works best for you.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}