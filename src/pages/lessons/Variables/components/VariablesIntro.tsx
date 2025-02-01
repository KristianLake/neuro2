import { useTheme } from '../../../../contexts/ThemeContext';

export default function VariablesIntro() {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>What are Variables?</h2>
      <div className={`rounded-lg p-6 shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}>
        {/* Real-world Connection */}
        <div className={`mb-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-indigo-900/20'
            : theme === 'neurodivergent'
            ? 'bg-teal-50'
            : 'bg-indigo-50'
        }`}>
          <h3 className={`font-semibold mb-2 flex items-center ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            <span className="text-xl mr-2">🎒</span>
            Think About This...
          </h3>
          <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            <div className="mb-2">Imagine your backpack. You might have:</div>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>A pencil case for holding pens</li>
              <li>A water bottle for holding water</li>
              <li>A lunch box for holding food</li>
            </ul>
            <div className="mt-4 mb-2">Each container has:</div>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>A name (what we call it)</li>
              <li>A purpose (what it holds)</li>
              <li>Contents (what's inside)</li>
            </ul>
            <div className="mt-4">Variables in programming work the same way!</div>
          </div>
        </div>
        
        {/* Basic Concept */}
        <div className={`mb-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50'
            : 'bg-gray-50'
        }`}>
          <h3 className={`font-semibold mb-2 flex items-center ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            <span className="text-xl mr-2">📦</span>
            Variables Are Like Labeled Boxes
          </h3>
          <div className="space-y-4">
            <div className={`border-l-4 pl-4 ${
              theme === 'dark'
                ? 'border-green-500'
                : theme === 'neurodivergent'
                ? 'border-teal-400'
                : 'border-green-400'
            }`}>
              <p className={`font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                let playerName = "Alex";
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-2xl">📝</span>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>This creates a box labeled "playerName" that holds the text "Alex"</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Points with Visual Aids */}
        <div className={`rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-yellow-900/20'
            : theme === 'neurodivergent'
            ? 'bg-amber-100'
            : 'bg-yellow-50'
        }`}>
          <h3 className={`font-semibold mb-2 flex items-center ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            <span className="text-xl mr-2">💡</span>
            Remember These Points
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <span className="text-xl">🏷️</span>
              <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Variables need clear names (like labels on boxes)
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-xl">🔄</span>
              <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                You can change what's inside a variable (like swapping contents)
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-xl">📋</span>
              <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                Variables help us remember information in our program
              </div>
            </div>
          </div>
        </div>

        {/* Take a Break Prompt */}
        <div className={`mt-6 rounded-lg p-3 ${
          theme === 'dark'
            ? 'bg-purple-900/20 border border-purple-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-purple-50 border border-purple-200'
        }`}>
          <div className="flex items-center">
            <span className="text-xl mr-2">⏸️</span>
            <div className={`text-sm ${
              theme === 'dark'
                ? 'text-purple-300'
                : theme === 'neurodivergent'
                ? 'text-teal-700'
                : 'text-purple-700'
            }`}>
              Take a moment to think about these examples. When you're ready, we'll look at different types of data that variables can store.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}