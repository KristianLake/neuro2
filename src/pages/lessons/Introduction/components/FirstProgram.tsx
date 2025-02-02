import { useTheme } from '../../../../contexts/ThemeContext';
import CodeEditor from '../../../../components/CodeEditor';

interface FirstProgramProps {
  onCodeSuccess: () => void;
  hasRunCode: boolean;
}

export default function FirstProgram({ onCodeSuccess, hasRunCode }: FirstProgramProps) {
  const { theme } = useTheme();

  const handleCodeSuccess = () => {
    if (onCodeSuccess) {
      onCodeSuccess();
    }
  };

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Your First Program</h2>
      <div className={`rounded-lg p-6 shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}>
        <div className={`rounded-lg p-4 mb-6 ${
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
          }`}>Let's Write Code!</h3>
          <p className={
            theme === 'dark'
              ? 'text-blue-200'
              : theme === 'neurodivergent'
              ? 'text-teal-700'
              : 'text-blue-700'
          }>
            We'll start with something simple but exciting - making the computer say "Hello, World!" 
            This is a tradition when learning to code, like your first words in a new language!
          </p>
        </div>

        <div className="space-y-6 mb-6">
          <div className={`rounded-lg p-4 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>The Code Editor:</h3>
            <ul className={`space-y-3 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>✨ It's like a special notepad for code</li>
              <li>🎨 The dark background helps make code easier to read</li>
              <li>🚦 It shows different colors to help us understand the code</li>
              <li>💡 It gives us hints when we need help</li>
            </ul>
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
            }`}>How to Use It:</h3>
            <ol className={`space-y-3 list-decimal pl-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <li>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>Click in the dark box below</span>
                <br />
                This is where you'll write your code
              </li>
              <li>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>Type your message</span>
                <br />
                Try changing the text inside the quotes
              </li>
              <li>
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>Click "Run Code"</span>
                <br />
                See what your program does!
              </li>
            </ol>
          </div>
        </div>
        
        <CodeEditor 
          onSuccessfulRun={handleCodeSuccess} 
          page="/lessons/introduction" 
          key={hasRunCode ? 'run' : 'initial'} 
        />
        <div className={`mt-6 rounded-lg p-4 ${
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
          }`}>Try These:</h3>
          <ul className={`space-y-2 ${
            theme === 'dark'
              ? 'text-green-200'
              : theme === 'neurodivergent'
              ? 'text-teal-700'
              : 'text-green-700'
          }`}>
            <li>• Change "Hello, World!" to your name</li>
            <li>• Make it say your favorite color</li>
            <li>• Write a friendly greeting</li>
          </ul>
        </div>
      </div>
    </section>
  );
}