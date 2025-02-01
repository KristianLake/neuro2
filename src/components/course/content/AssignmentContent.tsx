import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BaseContent } from '../types';
import { BaseButton } from '../../base';
import CodeEditor from '../../CodeEditor';

interface Assignment {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  starterCode?: string;
  testCases?: {
    input: string;
    expectedOutput: string;
  }[];
  rubric?: {
    criteria: string;
    points: number;
  }[];
}

interface AssignmentContentProps {
  content: BaseContent;
  onComplete?: () => void;
}

export function AssignmentContent({ content, onComplete }: AssignmentContentProps) {
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const assignment = content.content as Assignment;

  const handleSubmit = () => {
    setSubmitted(true);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Details */}
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
          {assignment.title}
        </h3>
        <p className={`mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {assignment.description}
        </p>

        {/* Requirements */}
        <div className="mb-4">
          <h4 className={`font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Requirements:
          </h4>
          <ul className={`list-disc pl-5 space-y-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {assignment.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Rubric */}
        {assignment.rubric && (
          <div className="mb-4">
            <h4 className={`font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              Grading Rubric:
            </h4>
            <div className="space-y-2">
              {assignment.rubric.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-2 rounded ${
                    theme === 'dark'
                      ? 'bg-gray-600'
                      : theme === 'neurodivergent'
                      ? 'bg-white'
                      : 'bg-white'
                  }`}
                >
                  <span className={
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }>
                    {item.criteria}
                  </span>
                  <span className={`font-medium ${
                    theme === 'dark'
                      ? 'text-indigo-400'
                      : theme === 'neurodivergent'
                      ? 'text-teal-600'
                      : 'text-indigo-600'
                  }`}>
                    {item.points} points
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Editor */}
      <div className={`p-6 rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-50'
          : 'bg-gray-50'
      }`}>
        <h4 className={`font-medium mb-4 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          Your Solution:
        </h4>
        <CodeEditor />
      </div>

      {/* Test Cases */}
      {assignment.testCases && (
        <div className={`p-6 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50'
            : 'bg-gray-50'
        }`}>
          <h4 className={`font-medium mb-4 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Test Cases:
          </h4>
          <div className="space-y-3">
            {assignment.testCases.map((test, index) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  theme === 'dark'
                    ? 'bg-gray-600'
                    : theme === 'neurodivergent'
                    ? 'bg-white'
                    : 'bg-white'
                }`}
              >
                <div className={`mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <strong>Input:</strong> {test.input}
                </div>
                <div className={
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }>
                  <strong>Expected Output:</strong> {test.expectedOutput}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <BaseButton
          variant="primary"
          onClick={handleSubmit}
          disabled={submitted}
        >
          {submitted ? 'Submitted' : 'Submit Assignment'}
        </BaseButton>
      </div>
    </div>
  );
}