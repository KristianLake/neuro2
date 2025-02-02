import { useTheme } from '../../../../contexts/ThemeContext';

export default function DataTypes() {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Types of Data</h2>
      <div className={`rounded-lg p-6 shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}>
        {/* Visual Break - Take a Breath */}
        <div className={`mb-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-blue-900/20 border border-blue-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <span className="text-xl mr-2">💭</span>
            <div className={`text-sm ${
              theme === 'dark'
                ? 'text-blue-300'
                : theme === 'neurodivergent'
                ? 'text-teal-700'
                : 'text-blue-700'
            }`}>
              Just like we store different things in different containers (like food in the fridge and clothes in the closet),
              variables can store different types of information.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Text (Strings) */}
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 flex items-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <span className="text-xl mr-2">📝</span>
              Text (Strings)
            </h3>
            <div className="mb-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                For storing words, names, or any text:
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <span>🔤</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Always use quotes (" " or ' ')</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✨</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Can include letters, numbers, spaces, and symbols</span>
                </div>
              </div>
            </div>
            <div className={`mb-2 font-mono text-sm p-2 rounded ${
              theme === 'dark'
                ? 'bg-gray-800'
                : theme === 'neurodivergent'
                ? 'bg-white'
                : 'bg-gray-100'
            }`}>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                let name = "Alex";<br />
                let message = 'Hello, World!';<br />
                let emoji = "🌟";
              </p>
            </div>
          </div>

          {/* Numbers */}
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 flex items-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <span className="text-xl mr-2">🔢</span>
              Numbers
            </h3>
            <div className="mb-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                For storing any kind of number:
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <span>1️⃣</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Whole numbers (like 42)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>💰</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Decimal numbers (like 3.14)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>❌</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No quotes needed!</span>
                </div>
              </div>
            </div>
            <div className={`mb-2 font-mono text-sm p-2 rounded ${
              theme === 'dark'
                ? 'bg-gray-800'
                : theme === 'neurodivergent'
                ? 'bg-white'
                : 'bg-gray-100'
            }`}>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                let age = 25;<br />
                let price = 19.99;<br />
                let temperature = -5;
              </p>
            </div>
          </div>

          {/* True/False (Booleans) */}
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 flex items-center ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <span className="text-xl mr-2">✅</span>
              True/False (Booleans)
            </h3>
            <div className="mb-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                For yes/no or true/false situations:
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>true (yes)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>❌</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>false (no)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>⚠️</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>No quotes needed!</span>
                </div>
              </div>
            </div>
            <div className={`mb-2 font-mono text-sm p-2 rounded ${
              theme === 'dark'
                ? 'bg-gray-800'
                : theme === 'neurodivergent'
                ? 'bg-white'
                : 'bg-gray-100'
            }`}>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                let isStudent = true;<br />
                let hasAccount = false;<br />
                let isLoggedIn = true;
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className={`mt-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-green-900/20 border border-green-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-green-50 border border-green-200'
        }`}>
          <h3 className={`font-semibold mb-2 flex items-center ${
            theme === 'dark'
              ? 'text-green-300'
              : theme === 'neurodivergent'
              ? 'text-teal-800'
              : 'text-green-800'
          }`}>
            <span className="text-xl mr-2">💡</span>
            Remember:
          </h3>
          <ul className={`space-y-2 ${
            theme === 'dark'
              ? 'text-green-200'
              : theme === 'neurodivergent'
              ? 'text-teal-700'
              : 'text-green-700'
          }`}>
            <li className="flex items-center space-x-2">
              <span>📝</span>
              <span>Text needs quotes: "Hello" or 'Hello'</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>🔢</span>
              <span>Numbers don't need quotes: 42</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>✅</span>
              <span>true/false don't need quotes: true</span>
            </li>
          </ul>
        </div>

        {/* Take a Break Reminder */}
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
              Take a moment to absorb these different types. It's okay if you need to come back and review them later!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}