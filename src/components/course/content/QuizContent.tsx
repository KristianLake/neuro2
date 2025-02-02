import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BaseContent, QuizQuestion } from '../types';
import { BaseButton } from '../../base';

interface QuizContentProps {
  content: BaseContent;
  onComplete?: () => void;
}

export function QuizContent({ content, onComplete }: QuizContentProps) {
  const { theme } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions = content.content as QuizQuestion[];
  const currentQuiz = questions[currentQuestion];

  const handleAnswer = (answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuiz.id]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (Array.isArray(question.correctAnswer)) {
        if (Array.isArray(userAnswer) && 
            userAnswer.length === question.correctAnswer.length &&
            userAnswer.every(a => question.correctAnswer.includes(a))) {
          correct++;
        }
      } else if (userAnswer === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
    if (onComplete) {
      onComplete();
    }
  };

  const renderQuestion = () => {
    switch (currentQuiz.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {currentQuiz.options?.map((option, index) => (
              <label
                key={index}
                className={`block p-4 rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuiz.id] === option
                    ? theme === 'dark'
                      ? 'bg-indigo-900/20 border-2 border-indigo-500'
                      : theme === 'neurodivergent'
                      ? 'bg-teal-50 border-2 border-teal-600'
                      : 'bg-indigo-50 border-2 border-indigo-500'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuiz.id}
                  value={option}
                  checked={answers[currentQuiz.id] === option}
                  onChange={() => handleAnswer(option)}
                  className="sr-only"
                />
                <span className={
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }>
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-4">
            {['True', 'False'].map(option => (
              <label
                key={option}
                className={`block p-4 rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuiz.id] === option
                    ? theme === 'dark'
                      ? 'bg-indigo-900/20 border-2 border-indigo-500'
                      : theme === 'neurodivergent'
                      ? 'bg-teal-50 border-2 border-teal-600'
                      : 'bg-indigo-50 border-2 border-indigo-500'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  type="radio"
                  name={currentQuiz.id}
                  value={option}
                  checked={answers[currentQuiz.id] === option}
                  onChange={() => handleAnswer(option)}
                  className="sr-only"
                />
                <span className={
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }>
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className={`text-center p-6 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50'
            : 'bg-gray-50'
        }`}>
          <h3 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Quiz Complete!
          </h3>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Your score: {score.toFixed(1)}%
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-4 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}
            >
              <p className={`font-medium mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Question {index + 1}: {question.question}
              </p>
              <p className={`mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Your answer: {answers[question.id]}
              </p>
              <p className={`${
                answers[question.id] === question.correctAnswer
                  ? theme === 'dark'
                    ? 'text-green-400'
                    : 'text-green-600'
                  : theme === 'dark'
                  ? 'text-red-400'
                  : 'text-red-600'
              }`}>
                Correct answer: {question.correctAnswer}
              </p>
              {question.explanation && (
                <p className={`mt-2 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {question.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Progress */}
      <div className={`flex justify-between items-center text-sm ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>{Math.round((currentQuestion / questions.length) * 100)}% Complete</span>
      </div>

      {/* Progress Bar */}
      <div className={`h-2 rounded-full ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div
          className={`h-full rounded-full transition-all ${
            theme === 'dark'
              ? 'bg-indigo-500'
              : theme === 'neurodivergent'
              ? 'bg-teal-600'
              : 'bg-indigo-600'
          }`}
          style={{ width: `${(currentQuestion / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className={`p-6 rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-50'
          : 'bg-gray-50'
      }`}>
        <h3 className={`text-lg font-medium mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {currentQuiz.question}
        </h3>
        {renderQuestion()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <BaseButton
          variant="secondary"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </BaseButton>
        
        {currentQuestion === questions.length - 1 ? (
          <BaseButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!answers[currentQuiz.id]}
          >
            Submit Quiz
          </BaseButton>
        ) : (
          <BaseButton
            variant="primary"
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={!answers[currentQuiz.id]}
          >
            Next Question
          </BaseButton>
        )}
      </div>
    </div>
  );
}