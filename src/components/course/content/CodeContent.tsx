import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BaseContent } from '../types';
import { BaseButton } from '../../base';
import CodeEditor from '../../CodeEditor';

interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
    hidden?: boolean;
  }[];
  hints?: string[];
  solution?: string;
}

interface CodeContentProps {
  content: BaseContent;
  onComplete?: () => void;
}

export function CodeContent({ content, onComplete }: CodeContentProps) {
  const { theme } = useTheme();
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [testResults, setTestResults] = useState<{
    passed: boolean;
    output?: string;
    error?: string;
  }[]>([]);

  const challenge = content.content as CodeChallenge;

  const runTests = () => {
    // In a real implementation, this would run the code against test cases
    // For now, we'll simulate test results
    const results = challenge.testCases.map(test => ({
      passed: Math.random() > 0.5,
      output: 'Test output...',
      error: Math.random() > 0.8 ? 'Test error...' : undefined
    }));

    setTestResults(results);

    // Check if all tests passed
    if (results.every(r => r.passed)) {
      onComplete?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Challenge Description */}
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
          {challenge.title}
        </h3>
        <p className={`mb-4 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {challenge.description}
        </p>

        {/* Test Cases */}
        <div className="mb-4">
          <h4 className={`font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
          }`}>
            Test Cases:
          </h4>
          <div className="space-y-2">
            {challenge.testCases.filter(test => !test.hidden).map((test, index) => (
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
                <div className={`mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <strong>Input:</strong> {test.input}
                </div>
                <div className={
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }>
                  <strong>Expected:</strong> {test.expectedOutput}
                </div>
                {testResults[index] && (
                  <div className={`mt-2 text-sm ${
                    testResults[index].passed
                      ? theme === 'dark'
                        ? 'text-green-400'
                        : 'text-green-600'
                      : theme === 'dark'
                      ? 'text-red-400'
                      : 'text-red-600'
                  }`}>
                    {testResults[index].passed ? '✓ Passed' : '✗ Failed'}
                    {testResults[index].error && (
                      <div className="mt-1">{testResults[index].error}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hints */}
        {challenge.hints && (
          <div className="mt-4">
            <BaseButton
              variant="secondary"
              onClick={() => setShowHints(!showHints)}
            >
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </BaseButton>
            {showHints && currentHint < challenge.hints.length && (
              <div className={`mt-2 p-4 rounded ${
                theme === 'dark'
                  ? 'bg-indigo-900/20'
                  : theme === 'neurodivergent'
                  ? 'bg-teal-50'
                  : 'bg-indigo-50'
              }`}>
                <p className={
                  theme === 'dark' ? 'text-indigo-300' : 'text-indigo-700'
                }>
                  {challenge.hints[currentHint]}
                </p>
                {currentHint < challenge.hints.length - 1 && (
                  <BaseButton
                    variant="secondary"
                    className="mt-2"
                    onClick={() => setCurrentHint(prev => prev + 1)}
                  >
                    Next Hint
                  </BaseButton>
                )}
              </div>
            )}
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
        <CodeEditor />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <BaseButton
          variant="secondary"
          onClick={() => {
            // Reset code to starter code
          }}
        >
          Reset Code
        </BaseButton>
        <BaseButton
          variant="primary"
          onClick={runTests}
        >
          Run Tests
        </BaseButton>
      </div>
    </div>
  );
}