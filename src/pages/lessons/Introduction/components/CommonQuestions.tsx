import { useTheme } from '../../../../contexts/ThemeContext';

export default function CommonQuestions() {
  const { theme } = useTheme();

  return (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Common Questions</h2>
      <div className={`rounded-lg p-6 shadow-sm border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-6">
          <div>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>What if I make a mistake?</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Don't worry! Making mistakes is a normal part of learning to code. The computer will tell you what went wrong, 
              and you can always try again. Each mistake teaches us something new!
            </p>
          </div>

          <div>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>Do I need to memorize everything?</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Not at all! Even experienced programmers look things up all the time. It's more important to understand the 
              concepts and know where to find help when you need it.
            </p>
          </div>

          <div>
            <h3 className={`font-semibold mb-2 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
            }`}>How do I know if my code is correct?</h3>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              When you run your code, you'll see the result right away. If there's a problem, you'll get helpful error 
              messages that explain what went wrong. We'll also give you hints and suggestions along the way!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}