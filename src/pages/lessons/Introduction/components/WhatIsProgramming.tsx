import { useTheme } from '../../../../contexts/ThemeContext';

export default function WhatIsProgramming() {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      {/* Visual Learning Option */}
      <div className={`mb-6 rounded-lg p-4 ${
        theme === 'dark'
          ? 'bg-indigo-900/20'
          : theme === 'neurodivergent'
          ? 'bg-teal-50'
          : 'bg-indigo-50'
      }`}>
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">🎥</span>
          <h3 className={`font-medium ${
            theme === 'dark'
              ? 'text-indigo-300'
              : theme === 'neurodivergent'
              ? 'text-teal-800'
              : 'text-indigo-800'
          }`}>
            Watch the Video Explanation
          </h3>
        </div>
        <div className="aspect-video rounded-lg bg-black mb-4">
          {/* Video player would go here */}
        </div>
        <div className={`text-sm ${
          theme === 'dark'
            ? 'text-indigo-200'
            : theme === 'neurodivergent'
            ? 'text-teal-700'
            : 'text-indigo-700'
        }`}>
          Prefer to read? The text version is available below.
        </div>
      </div>

      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>What is Programming?</h2>
      <div className={`rounded-lg p-6 shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}>
        <p className={`mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Programming is like giving instructions to a computer. Let's understand this with something we all know - making a sandwich!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>Making a Sandwich:</h3>
            <div className="space-y-4">
              <div className={`border-l-4 pl-4 ${
                theme === 'dark'
                  ? 'border-green-500'
                  : theme === 'neurodivergent'
                  ? 'border-teal-400'
                  : 'border-green-400'
              }`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  1. Get two slices of bread
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Clear and specific</p>
              </div>
              <div className={`border-l-4 pl-4 ${
                theme === 'dark'
                  ? 'border-green-500'
                  : theme === 'neurodivergent'
                  ? 'border-teal-400'
                  : 'border-green-400'
              }`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  2. Spread butter on one side
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>One step at a time</p>
              </div>
              <div className={`border-l-4 pl-4 ${
                theme === 'dark'
                  ? 'border-green-500'
                  : theme === 'neurodivergent'
                  ? 'border-teal-400'
                  : 'border-green-400'
              }`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  3. Add your fillings
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Exact instructions</p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>Programming a Computer:</h3>
            <div className="space-y-4">
              <div className={`border-l-4 pl-4 ${
                theme === 'dark'
                  ? 'border-blue-500'
                  : theme === 'neurodivergent'
                  ? 'border-teal-400'
                  : 'border-blue-400'
              }`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  1. Print "Hello, World!"
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Clear and specific</p>
              </div>
              <div className={`border-l-4 pl-4 ${
                theme === 'dark'
                  ? 'border-blue-500'
                  : theme === 'neurodivergent'
                  ? 'border-teal-400'
                  : 'border-blue-400'
              }`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  2. Wait for user input
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>One step at a time</p>
              </div>
              <div className={`border-l-4 pl-4 ${
                theme === 'dark'
                  ? 'border-blue-500'
                  : theme === 'neurodivergent'
                  ? 'border-teal-400'
                  : 'border-blue-400'
              }`}>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  3. Show the result
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Exact instructions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Recognition Section */}
        <div className={`mt-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-purple-900/20'
            : theme === 'neurodivergent'
            ? 'bg-teal-50'
            : 'bg-purple-50'
        }`}>
          <h3 className={`font-medium mb-3 ${
            theme === 'dark'
              ? 'text-purple-300'
              : theme === 'neurodivergent'
              ? 'text-teal-800'
              : 'text-purple-800'
          }`}>
            Pattern Recognition
          </h3>
          <p className={theme === 'dark' ? 'text-purple-200' : 'text-purple-700'}>
            Notice how each instruction follows a similar pattern:
          </p>
          <ul className="mt-2 space-y-2">
            <li className="flex items-center">
              <span className="w-8">1️⃣</span>
              <span>Action (what to do)</span>
            </li>
            <li className="flex items-center">
              <span className="w-8">2️⃣</span>
              <span>Object (what to do it to)</span>
            </li>
            <li className="flex items-center">
              <span className="w-8">3️⃣</span>
              <span>Details (how to do it)</span>
            </li>
          </ul>
        </div>

        <div className={`rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-yellow-900/20'
            : theme === 'neurodivergent'
            ? 'bg-amber-100'
            : 'bg-yellow-50'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            theme === 'dark'
              ? 'text-yellow-300'
              : theme === 'neurodivergent'
              ? 'text-amber-900'
              : 'text-yellow-800'
          }`}>Key Points:</h3>
          <ul className={`space-y-2 ${
            theme === 'dark'
              ? 'text-yellow-200'
              : theme === 'neurodivergent'
              ? 'text-amber-800'
              : 'text-yellow-700'
          }`}>
            <li>• Computers follow instructions exactly like a recipe</li>
            <li>• Each step needs to be clear and specific</li>
            <li>• If a step is missing, the computer will tell us</li>
            <li>• We can always fix our instructions and try again</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
