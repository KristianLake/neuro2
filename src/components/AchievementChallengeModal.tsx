import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Achievement } from '../types/achievements';
import { challengeInfo } from '../config/challenges';
import { BaseModal, BaseButton } from './base';

interface AchievementChallengeModalProps {
  show: boolean;
  onClose: () => void;
  achievement: Achievement;
}

export default function AchievementChallengeModal({ show, onClose, achievement }: AchievementChallengeModalProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    onClose();
    // Find the code editor and scroll to it
    const editorElement = document.querySelector('[data-code-editor]');
    if (editorElement) {
      setTimeout(() => {
        editorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100); // Small delay to ensure modal is closed
    }
  };

  if (!achievement) return null;

  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(challenge.example);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const challenge = challengeInfo[achievement.id];
  if (!challenge) return null;

  const modalFooter = (
    <BaseButton
      variant="primary"
      onClick={handleClose}
    >
      Let's Try It!
    </BaseButton>
  );

  return (
    <BaseModal
      isOpen={show}
      onClose={handleClose}
      title={challenge.title}
      size="lg"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* Steps */}
        <div className={`rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50'
            : 'bg-gray-50'
        }`}>
          <h4 className={`font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>Steps:</h4>
          <ul className={`list-disc pl-5 space-y-1 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {challenge.description.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        {/* Example with Copy Button */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className={`font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>Example:</h4>
            <button
              onClick={copyExample}
              className={`flex items-center px-2 py-1 rounded text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  : theme === 'neurodivergent'
                  ? 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="mr-1">{copied ? '✓' : '📋'}</span>
              {copied ? 'Copied!' : 'Copy Example'}
            </button>
          </div>
          <pre className={`p-4 rounded-lg font-mono text-sm whitespace-pre ${
            theme === 'dark'
              ? 'bg-gray-900 text-gray-300'
              : theme === 'neurodivergent'
              ? 'bg-white text-gray-800'
              : 'bg-gray-50 text-gray-800'
          }`}>
            {challenge.example}
          </pre>
        </div>

        {/* XP Reward */}
        <div className={`mt-2 text-sm ${
          theme === 'dark'
            ? 'text-indigo-400'
            : theme === 'neurodivergent'
            ? 'text-teal-600'
            : 'text-indigo-600'
        }`}>
          Complete this challenge to earn {achievement.xp} XP!
        </div>
      </div>
    </BaseModal>
  );
}