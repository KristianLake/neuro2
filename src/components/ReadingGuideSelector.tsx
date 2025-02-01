import { useTheme } from '../contexts/ThemeContext';
import type { ReadingGuideMode } from '../contexts/ThemeContext';

const guideOptions: { id: ReadingGuideMode; name: string; description: string; icon: string }[] = [
  {
    id: 'off',
    name: 'Off',
    description: 'No reading guide',
    icon: '⭕'
  },
  {
    id: 'line',
    name: 'Line Guide',
    description: 'Highlight the current line being read',
    icon: '📏'
  },
  {
    id: 'paragraph',
    name: 'Paragraph Focus',
    description: 'Dim surrounding text to focus on current paragraph',
    icon: '📄'
  }
];

export default function ReadingGuideSelector() {
  const { theme, readingGuide, setReadingGuide } = useTheme();

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
          Reading Guide
        </h3>
        <div className={`mt-2 max-w-xl text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p>Choose a reading guide to help maintain focus while reading.</p>
        </div>
        <div className="mt-5 space-y-4">
          {guideOptions.map((option) => (
            <div
              key={option.id}
              className={`relative flex items-start cursor-pointer p-4 rounded-lg transition-colors ${
                readingGuide === option.id
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
              onClick={() => setReadingGuide(option.id)}
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name="readingGuide"
                  checked={readingGuide === option.id}
                  onChange={() => setReadingGuide(option.id)}
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
                    readingGuide === option.id
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
                  readingGuide === option.id
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
                <div className={`guide-${option.id}`}>
                  <p className={`text-sm mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    This is a preview of how the reading guide will work.
                    Move your mouse over the text to see the effect.
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    The guide helps you focus on specific parts of the text
                    while reducing distractions from surrounding content.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}