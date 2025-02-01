import { useTheme } from '../../../../contexts/ThemeContext';

export default function AdvancedTypes() {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>More Data Types</h2>
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
            ? 'bg-purple-900/20 border border-purple-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-purple-50 border border-purple-200'
        }`}>
          <div className="flex items-center">
            <span className="text-xl mr-2">🌟</span>
            <div className={`text-sm ${
              theme === 'dark'
                ? 'text-purple-300'
                : theme === 'neurodivergent'
                ? 'text-teal-700'
                : 'text-purple-700'
            }`}>
              You're doing great! We're going to look at some more ways to store data. 
              Remember: Take your time and don't worry about memorizing everything.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Arrays with Visual Example */}
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
              <span className="text-xl mr-2">📚</span>
              Arrays (Like a Stack of Books)
            </h3>
            <div className="mb-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Think of an array like a bookshelf where you can store many items in order:
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-2xl">📕</span>
                <span className="text-2xl">📗</span>
                <span className="text-2xl">📘</span>
                <span className="text-2xl">📙</span>
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
                let colors = ["red", "green", "blue"];<br />
                let numbers = [1, 2, 3, 4, 5];
              </p>
            </div>
          </div>

          {/* Objects with Visual Example */}
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
              <span className="text-xl mr-2">🎒</span>
              Objects (Like a Labeled Backpack)
            </h3>
            <div className="mb-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Objects are like a backpack with different pockets, each with a label:
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <span>📛</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>name: where we store your name</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🔢</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>age: where we store your age</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>isStudent: where we store if you're a student</span>
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
                let person = {'{'}<br />
                &nbsp;&nbsp;name: "Alex",<br />
                &nbsp;&nbsp;age: 25,<br />
                &nbsp;&nbsp;isStudent: true<br />
                {'}'};
              </p>
            </div>
          </div>

          {/* Special Values with Visual Example */}
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
              <span className="text-xl mr-2">❓</span>
              Special Values (Empty Boxes)
            </h3>
            <div className="mb-4">
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Sometimes we need to show that a variable is empty:
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <span>📭</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>null: an empty box (on purpose)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>❔</span>
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>undefined: a box that hasn't been used yet</span>
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
                let emptyBox = null;<br />
                let unusedBox;  // value is undefined
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference Guide */}
        <div className={`mt-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-indigo-900/20 border border-indigo-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-indigo-50 border border-indigo-200'
        }`}>
          <h3 className={`font-semibold mb-2 flex items-center ${
            theme === 'dark'
              ? 'text-indigo-300'
              : theme === 'neurodivergent'
              ? 'text-teal-800'
              : 'text-indigo-800'
          }`}>
            <span className="text-xl mr-2">📝</span>
            Quick Reference
          </h3>
          <div className={`space-y-2 ${
            theme === 'dark'
              ? 'text-indigo-200'
              : theme === 'neurodivergent'
              ? 'text-teal-700'
              : 'text-indigo-700'
          }`}>
            <div className="flex items-center space-x-2">
              <span>📚</span>
              <span>Arrays: for lists of similar things (like shopping lists)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎒</span>
              <span>Objects: for things with labels (like a profile card)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📭</span>
              <span>null/undefined: for empty or unused variables</span>
            </div>
          </div>
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
              That was a lot of information! Take a moment to review before moving on.
              Remember: You can always come back to this section later.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}