import { useTheme } from '../../../../contexts/ThemeContext';
import CodeEditor from '../../../../components/CodeEditor';

interface Props {
  onSuccess?: () => void;
}

export default function VariableExercises({ onSuccess }: Props) {
  const { theme } = useTheme();

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Practice with Variables</h2>
      <div className={`rounded-lg p-6 shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}>
        {/* Achievement Challenges */}
        <div className={`mb-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-indigo-900/20 border border-indigo-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-indigo-50 border border-indigo-200'
        }`}>
          <h3 className={`font-semibold mb-4 flex items-center ${
            theme === 'dark'
              ? 'text-indigo-300'
              : theme === 'neurodivergent'
              ? 'text-teal-800'
              : 'text-indigo-800'
          }`}>
            <span className="text-xl mr-2">🎯</span>
            Challenges to Try
          </h3>
          
          <div className="space-y-6">
            {/* Challenge 1: Basic Variables */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark'
                ? 'bg-gray-700'
                : theme === 'neurodivergent'
                ? 'bg-white'
                : 'bg-white'
            }`}>
              <h4 className={`font-medium mb-2 flex items-center ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <span className="text-xl mr-2">📦</span>
                Challenge 1: Create Your First Variable
              </h4>
              <div className={`space-y-2 mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <p>Create a variable and print it:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use let to create a variable</li>
                  <li>Give it a clear name</li>
                  <li>Print it with console.log</li>
                </ul>
              </div>
              <div className={`text-sm p-2 rounded ${
                theme === 'dark'
                  ? 'bg-gray-800'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <code className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  let myName = "Alex";<br/>
                  console.log(myName);
                </code>
              </div>
            </div>

            {/* Challenge 2: Different Types */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark'
                ? 'bg-gray-700'
                : theme === 'neurodivergent'
                ? 'bg-white'
                : 'bg-white'
            }`}>
              <h4 className={`font-medium mb-2 flex items-center ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <span className="text-xl mr-2">🔄</span>
                Challenge 2: Try Different Types
              </h4>
              <div className={`space-y-2 mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <p>Create one of each type:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>A text variable (string)</li>
                  <li>A number variable</li>
                  <li>A true/false variable (boolean)</li>
                </ul>
              </div>
              <div className={`text-sm p-2 rounded ${
                theme === 'dark'
                  ? 'bg-gray-800'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <code className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  let message = "Hello!";<br/>
                  let age = 25;<br/>
                  let isStudent = true;
                </code>
              </div>
            </div>

            {/* Challenge 3: Arrays */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark'
                ? 'bg-gray-700'
                : theme === 'neurodivergent'
                ? 'bg-white'
                : 'bg-white'
            }`}>
              <h4 className={`font-medium mb-2 flex items-center ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <span className="text-xl mr-2">📚</span>
                Challenge 3: Create a List
              </h4>
              <div className={`space-y-2 mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <p>Create an array with multiple items:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Make a list of your favorite colors</li>
                  <li>Or a list of numbers</li>
                  <li>Print the whole list</li>
                </ul>
              </div>
              <div className={`text-sm p-2 rounded ${
                theme === 'dark'
                  ? 'bg-gray-800'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <code className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  let colors = ["blue", "green", "purple"];<br/>
                  console.log("My favorite colors:", colors);
                </code>
              </div>
            </div>

            {/* Challenge 4: Objects */}
            <div className={`rounded-lg p-4 ${
              theme === 'dark'
                ? 'bg-gray-700'
                : theme === 'neurodivergent'
                ? 'bg-white'
                : 'bg-white'
            }`}>
              <h4 className={`font-medium mb-2 flex items-center ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <span className="text-xl mr-2">🎯</span>
                Challenge 4: Create a Profile
              </h4>
              <div className={`space-y-2 mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <p>Create an object with information about yourself:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Include your name</li>
                  <li>Add your age</li>
                  <li>Add whether you like coding</li>
                </ul>
              </div>
              <div className={`text-sm p-2 rounded ${
                theme === 'dark'
                  ? 'bg-gray-800'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <code className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  let profile = {'{'}<br/>
                  &nbsp;&nbsp;name: "Alex",<br/>
                  &nbsp;&nbsp;age: 25,<br/>
                  &nbsp;&nbsp;lovesCoding: true<br/>
                  {'}'};<br/>
                  console.log("My profile:", profile);
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className={`mb-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-blue-900/20 border border-blue-800'
            : theme === 'neurodivergent'
            ? 'bg-teal-50 border border-teal-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            theme === 'dark'
              ? 'text-blue-300'
              : theme === 'neurodivergent'
              ? 'text-teal-800'
              : 'text-blue-800'
          }`}>Try It Yourself!</h3>
          <p className={
            theme === 'dark'
              ? 'text-blue-200'
              : theme === 'neurodivergent'
              ? 'text-teal-700'
              : 'text-blue-700'
          }>
            Pick any challenge above and try it in the code editor below. Don't worry about getting it perfect - 
            just experiment and have fun!
          </p>
        </div>

        <CodeEditor onSuccessfulRun={handleSuccess} page="/lessons/variables" />

        {/* Tips and Reminders */}
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
              <span>✨</span>
              <span>Use clear, descriptive names for your variables</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>🔍</span>
              <span>Check for any missing quotes or semicolons</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Try each challenge one at a time</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>🔄</span>
              <span>You can always reset the code and try again</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}