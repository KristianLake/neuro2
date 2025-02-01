import { useTheme } from '../../../../contexts/ThemeContext';

export default function NextSteps() {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Next Steps</h2>
      <div className={`rounded-lg p-6 shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-6">
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            Great job on writing your first program! Here's what's coming up next:
          </p>

          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>In the Next Lesson:</h3>
            <ul className={`space-y-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>• Learn about variables - ways to store and use information</li>
              <li>• Work with different types of data (numbers, text, etc.)</li>
              <li>• Create more interactive programs</li>
              <li>• Build on what you've learned today</li>
            </ul>
          </div>

          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-green-900/20 border border-green-800'
              : theme === 'neurodivergent'
              ? 'bg-teal-50 border border-teal-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark'
                ? 'text-green-300'
                : theme === 'neurodivergent'
                ? 'text-teal-800'
                : 'text-green-800'
            }`}>Before You Go:</h3>
            <ul className={`space-y-2 ${
              theme === 'dark'
                ? 'text-green-200'
                : theme === 'neurodivergent'
                ? 'text-teal-700'
                : 'text-green-700'
            }`}>
              <li>• Try changing your program a few more times</li>
              <li>• Experiment with different messages</li>
              <li>• Practice fixing any errors you see</li>
              <li>• Have fun exploring!</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}