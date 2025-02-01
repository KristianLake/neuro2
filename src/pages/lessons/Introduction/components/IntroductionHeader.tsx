import { useTheme } from '../../../../contexts/ThemeContext';

export default function IntroductionHeader() {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-8 mb-8 ${
      theme === 'dark'
        ? 'bg-gradient-to-r from-gray-800 to-gray-700'
        : theme === 'neurodivergent'
        ? 'bg-gradient-to-r from-amber-100 to-amber-50'
        : 'bg-gradient-to-r from-indigo-50 to-blue-50'
    }`}>
      <h1 className={`text-3xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Welcome to Programming!</h1>
      <div className="space-y-4">
        <div>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>Hi, I'm Kristian!</h2>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            I'll be your guide as we explore the world of programming together. As someone who's neurodivergent 
            myself, I understand that everyone learns differently, and that's perfectly okay!
          </p>
        </div>
        <div>
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>In This Lesson:</h2>
          <ul className={`list-disc pl-5 space-y-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <li>Understand what programming really means</li>
            <li>Write your very first program</li>
            <li>Learn how to use a code editor</li>
            <li>Get comfortable with making mistakes (they help us learn!)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}