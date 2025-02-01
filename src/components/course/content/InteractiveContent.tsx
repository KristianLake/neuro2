import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { BaseContent } from '../types';
import { BaseButton } from '../../base';
import { useEffect, useState } from 'react';
import CodeEditor from '../../CodeEditor';
import { useInteractiveProgress } from '../../../hooks/useInteractiveProgress';
import AchievementList from '../../AchievementList';
import { Achievement } from '../../../types/achievements';

interface InteractiveStep {
  id: string;
  title: string;
  content: string;
  interaction: {
    type: 'click' | 'drag' | 'input';
    target?: string;
    correctValue?: string | string[];
    feedback?: {
      success: string;
      error: string;
    };
  };
  example?: string;
  hint?: string;
}

interface InteractiveContentProps {
  content: BaseContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  earnedAchievements?: Achievement[];
  availableAchievements?: Achievement[];
  achievementQueue?: Achievement[];
  setSelectedAchievement?: (achievement: Achievement) => void;
}

function InteractiveContent({ 
  content, 
  onProgress, 
  onComplete,
  earnedAchievements = [],
  availableAchievements = [],
  achievementQueue = [],
  setSelectedAchievement
}: InteractiveContentProps) {
  const { theme } = useTheme();
  const { progress, loading, saveProgress } = useInteractiveProgress(content.metadata.id);
  const { user } = useAuth();
  const [uniqueMessages] = useState(new Set<string>());

  const steps: InteractiveStep[] = [
    {
      id: 'step1',
      title: 'Understanding Console Output',
      content: 'Let\'s start by learning how to make the computer display a message. In programming, we use console.log() to print text to the screen.',
      interaction: {
        type: 'input',
        correctValue: 'console.log("Hello")',
        feedback: {
          success: 'Great job! You\'ve successfully used console.log()',
          error: 'Remember to use console.log() with quotes around your text'
        }
      },
      example: 'console.log("Hello, World!")',
      hint: 'Try writing console.log("Hello") to display the word "Hello"'
    },
    {
      id: 'step2',
      title: 'Working with Multiple Messages',
      content: 'You can print multiple messages by using console.log() multiple times.',
      interaction: {
        type: 'input',
        correctValue: ['console.log("Hi")\nconsole.log("There")', 'console.log("Hi");console.log("There")'],
        feedback: {
          success: 'Excellent! You\'ve printed multiple messages',
          error: 'Try using console.log() twice, once for each word'
        }
      },
      example: 'console.log("First message")\nconsole.log("Second message")',
      hint: 'Write two console.log statements - one for "Hi" and one for "There"'
    },
    {
      id: 'step3',
      title: 'Combining Text and Numbers',
      content: 'console.log() can print both text and numbers. You can even print them together!',
      interaction: {
        type: 'input',
        correctValue: 'console.log("Count:", 123)',
        feedback: {
          success: 'Perfect! You\'ve combined text and numbers',
          error: 'Make sure to include both the text "Count:" and the number 123'
        }
      },
      example: 'console.log("Number:", 42)',
      hint: 'Use console.log("Count:", 123) to display both text and a number'
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(true);
  const [showPractice, setShowPractice] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  // Sync state with progress from database
  useEffect(() => {
    if (!loading && progress) {
      setCurrentStep(progress.currentStep || 0);
      setShowSteps(progress.showSteps ?? true);
      setShowPractice(progress.showPractice ?? false);
      setCompleted(progress.completed || []);
      setPracticeCompleted(progress.practiceCompleted ?? false);
    }
  }, [progress, loading]);

  // Track progress
  useEffect(() => {
    if (onProgress) {
      // Calculate total available achievements
      const totalAvailableAchievements = availableAchievements.length + earnedAchievements.length;

      // Calculate step progress (50% of total)
      const stepProgress = (completed.length / steps.length) * 50;
      
      // Calculate achievement progress (50% of total)
      const achievementProgress = earnedAchievements.length > 0 ?
        (earnedAchievements.length / totalAvailableAchievements) * 50 :
        0;
      
      const totalProgress = Math.min(Math.round(stepProgress + achievementProgress), 100);
      console.log('Progress Update:', {
        stepProgress,
        achievementProgress,
        totalProgress,
        completed: completed.length,
        totalSteps: steps.length,
        earnedAchievements: earnedAchievements.length,
        totalAchievements: totalAvailableAchievements
      });

      onProgress(totalProgress);
    }
    if (completed.length === steps.length) {
      handleShowPractice();
    }
  }, [completed.length, steps.length, earnedAchievements?.length, availableAchievements?.length, onProgress, onComplete]);

  const handleShowPractice = async () => {
    setShowPractice(true);
    await saveProgress({
      showSteps: false,
      showPractice: true,
      completed: completed
    });
  };

  const handleShowSteps = async () => {
    setShowPractice(false);
    await saveProgress({
      showSteps: true,
      showPractice: false,
      completed: completed
    });
  };

  const currentStepData = steps[currentStep] || null;

  const handleInteraction = async (step: InteractiveStep, value?: string) => {
    if (completed.includes(step.id)) return;

    let isCorrect = false;
    switch (step.interaction.type) {
      case 'click':
        isCorrect = true;
        break;
      case 'input':
        if (Array.isArray(step.interaction.correctValue)) {
          isCorrect = step.interaction.correctValue.includes(value || '');
        } else {
          isCorrect = value === step.interaction.correctValue;
        }
        break;
    }

    if (isCorrect) {
      const newCompleted = [...completed, step.id];
      const newStep = currentStep < steps.length - 1 ? currentStep + 1 : currentStep;
      await saveProgress({
        completed: newCompleted,
        currentStep: newStep,
        showPractice: newCompleted.length === steps.length
      });
      
      // If all steps are completed, show practice section
      if (newCompleted.length === steps.length) {
        handleShowPractice();
      }
    }
  };

  const handleHideSteps = async () => {
    setShowPractice(true);
    await saveProgress({
      showSteps: false,
      showPractice: true,
      completed: completed
    });
  };

  const handleCodeSuccess = () => {
    // Only handle achievements during practice section
    if (!showPractice) return;

    // Calculate if all achievements have been earned
    const allAchievementsEarned = earnedAchievements.length === availableAchievements.length;
    
    saveProgress({
      showSteps: false,
      showPractice: true,
      completed: completed,
      practiceCompleted: allAchievementsEarned
    });

    // Only call onComplete if all achievements are earned
    if (onComplete && allAchievementsEarned) {
      onComplete();
    }
  };

  if (!steps.length) {
    return (
      <div className={`p-6 rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-50'
          : 'bg-gray-50'
      }`}>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          No interactive content available.
        </p>
      </div>
    );
  }

  if (!currentStepData) {
    return (
      <div className={`p-6 rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-50'
          : 'bg-gray-50'
      }`}>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
          No step data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSteps && (
        <>
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  completed.includes(step.id)
                    ? theme === 'dark'
                      ? 'bg-indigo-500'
                      : theme === 'neurodivergent'
                      ? 'bg-teal-600'
                      : 'bg-indigo-600'
                    : index === currentStep
                    ? theme === 'dark'
                      ? 'bg-indigo-900/50'
                      : theme === 'neurodivergent'
                      ? 'bg-teal-200'
                      : 'bg-indigo-200'
                    : theme === 'dark'
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Current Step */}
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
          {currentStepData.title}
        </h3>

        {/* Step Content */}
        <div className={`mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {currentStepData.content}
        </div>

        {/* Example Code */}
        {currentStepData.example && (
          <div className={`mb-4 p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-800'
              : theme === 'neurodivergent'
              ? 'bg-white'
              : 'bg-gray-100'
          }`}>
            <div className={`text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Example:
            </div>
            <pre className={`font-mono text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {currentStepData.example}
            </pre>
          </div>
        )}
        {/* Interaction Area */}
        <div className="mt-4">
          {currentStepData.interaction.type === 'click' && (
            <BaseButton
              variant="primary"
              onClick={() => handleInteraction(currentStepData)}
              disabled={completed.includes(currentStepData.id)}
            >
              {completed.includes(currentStepData.id) ? 'Completed' : 'Continue'}
            </BaseButton>
          )}

          {currentStepData.interaction.type === 'input' && (
            <div className="space-y-4">
              {/* Hint */}
              {currentStepData.hint && (
                <div className={`p-3 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-indigo-900/20 border border-indigo-800'
                    : theme === 'neurodivergent'
                    ? 'bg-teal-50 border border-teal-200'
                    : 'bg-indigo-50 border border-indigo-200'
                }`}>
                  <p className={`text-sm ${
                    theme === 'dark'
                      ? 'text-indigo-300'
                      : theme === 'neurodivergent'
                      ? 'text-teal-700'
                      : 'text-indigo-700'
                  }`}>
                    💡 {currentStepData.hint}
                  </p>
                </div>
              )}

              <textarea
                rows={3}
                type="text"
                className={`block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                  theme === 'dark'
                    ? 'bg-gray-600 text-white ring-gray-500 focus:ring-indigo-500'
                    : theme === 'neurodivergent'
                    ? 'bg-white text-gray-900 ring-amber-200 focus:ring-teal-600'
                    : 'bg-white text-gray-900 ring-gray-300 focus:ring-indigo-600'
                }`}
                placeholder="Enter your answer"
                onChange={(e) => handleInteraction(currentStepData, e.target.value)}
                disabled={completed.includes(currentStepData.id)}
              ></textarea>
              <BaseButton
                variant="primary"
                onClick={() => handleInteraction(currentStepData)}
                disabled={completed.includes(currentStepData.id)}
              >
                Check Answer
              </BaseButton>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <BaseButton
            variant="secondary"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </BaseButton>
          <BaseButton
            variant="secondary"
            onClick={() => currentStep === steps.length - 1 ? handleShowPractice() : setCurrentStep(prev => prev + 1)}
            disabled={currentStep === steps.length - 1 ? completed.length < steps.length : !completed.includes(currentStepData.id)}
          >
            {currentStep === steps.length - 1 ? 'Start Practice' : 'Next'}
          </BaseButton>
        </div>
          </div>
        </>
      )}

      {/* Practice Section */}
      {showPractice && (
        <div className={`mt-8 p-6 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50'
            : 'bg-gray-50'
        }`}>
          {/* Back to Steps Button */}
          {!showSteps && (
            <BaseButton
              variant="secondary"
              onClick={handleShowSteps}
              className="mb-4"
            >
              ← Back to Steps
            </BaseButton>
          )}

          <h3 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Practice Time! 🚀
          </h3>
          
          <div className={`mb-4 p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-indigo-900/20 border border-indigo-800'
              : theme === 'neurodivergent'
              ? 'bg-teal-50 border border-teal-200'
              : 'bg-indigo-50 border border-indigo-200'
          }`}>
            <p className={`text-sm ${
              theme === 'dark'
                ? 'text-indigo-300'
                : theme === 'neurodivergent'
                ? 'text-teal-700'
                : 'text-indigo-700'
            }`}>
              Now it's your turn! Use the code editor below to practice what you've learned.
              Try writing different console.log statements and experiment with different ways
              to display messages.
            </p>
          </div>

          <div className={`mb-4 p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-green-900/20 border border-green-800'
              : theme === 'neurodivergent'
              ? 'bg-teal-50 border border-teal-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              theme === 'dark'
                ? 'text-green-300'
                : theme === 'neurodivergent'
                ? 'text-teal-800'
                : 'text-green-800'
            }`}>
              Try These:
            </h4>
            <ul className={`list-disc pl-5 space-y-2 text-sm ${
              theme === 'dark'
                ? 'text-green-200'
                : theme === 'neurodivergent'
                ? 'text-teal-700'
                : 'text-green-700'
            }`}>
              <li>Print your name and age</li>
              <li>Display a welcome message</li>
              <li>Show multiple messages in different ways</li>
              <li>Combine text and numbers</li>
            </ul>
          </div>

          <CodeEditor 
            onSuccessfulRun={handleCodeSuccess} 
            page="/lessons/introduction" 
            key={showPractice ? 'practice' : 'steps'}
          />
          
          {/* Show Next Section Button when practice is completed */}
          {practiceCompleted && (
            <div className="mt-4 flex justify-end">
              <BaseButton
                variant="primary"
                onClick={onComplete}
              >
                Next Section →
              </BaseButton>
            </div>
          )}
          
          {/* Hide Steps Button */}
          {showSteps && (
            <BaseButton
              variant="secondary"
              onClick={handleShowPractice}
              className="mt-4"
            >
              Hide Steps
            </BaseButton>
          )}
        </div>
      )}
    </div>
  );
}

export { InteractiveContent };