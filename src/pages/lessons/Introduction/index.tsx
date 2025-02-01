import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAchievements } from '../../../hooks/useAchievements';
import { Achievement } from '../../../types/achievements';
import { ContentType } from '../../../components/course/types';
import { useAchievementTracking } from './hooks/useAchievementTracking';
import WhatIsProgramming from './components/WhatIsProgramming';
import FirstProgram from './components/FirstProgram';
import CommonQuestions from './components/CommonQuestions';
import NextSteps from './components/NextSteps';
import { introductionConfig } from './config';
import { LessonContent } from '../../../components/course/content/LessonContent';
import AchievementChallengeModal from '../../../components/AchievementChallengeModal';
import AchievementModal from '../../../components/AchievementModal';
import FloatingNextButton from './components/FloatingNextButton';
import CompletionModal from './components/CompletionModal';
import XPCounter from './components/XPCounter';
import GamificationCTA from './components/GamificationCTA';
import AchievementList from '../../../components/AchievementList';
import { PageLayout } from '../../../components/layouts/PageLayout';
interface LessonState {
  showCompletionModal: boolean;
  selectedAchievement: Achievement | null;
  hasRunCode: boolean;
  shouldPreventScroll: boolean;
}

export default function Introduction() {
  const { user } = useAuth();
  const { getLessonAchievements, hasCompletedLesson: checkLessonCompletion } = useAchievements();
  const {
    showingAchievement,
    currentAchievement,
    achievementQueue,
    forceUpdate,
    dismissAchievement
  } = useAchievementTracking();

  const [state, setState] = useState<LessonState>({
    showCompletionModal: false,
    selectedAchievement: null,
    hasRunCode: false,
    shouldPreventScroll: true
  });

  // Get achievements for this lesson
  const { earned: earnedLessonAchievements, available: availableLessonAchievements } = 
    getLessonAchievements('/lessons/introduction');

  // Check lesson completion
  const isLessonCompleted = checkLessonCompletion('/lessons/introduction');

  const handleCodeSuccess = (): void => {
    setState(prev => ({ ...prev, hasRunCode: true }));
    // Only show completion modal when all achievements are earned
    if (isLessonCompleted) {
      setState(prev => ({ ...prev, showCompletionModal: true }));
    }
  };

  const lessonContent = {
    metadata: {
      id: 'introduction',
      title: 'Introduction to Programming - Programming Primer',
      description: 'Your first steps into programming with a neurodivergent-friendly approach',
      type: ContentType.Lesson,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      author: 'Kristian Lake',
      estimatedTime: 60,
      difficulty: 'beginner',
      prerequisites: [],
      nextContent: 'full-course/programming-primer/variables'
    },
    content: (
      <>
        <section data-content-type={ContentType.Theory}>
          <WhatIsProgramming />
        </section>
        
        <section data-content-type={ContentType.Practice}>
          <FirstProgram onCodeSuccess={handleCodeSuccess} hasRunCode={state.hasRunCode} />
        </section>
        
        <section data-content-type={ContentType.Reference}>
          <CommonQuestions />
        </section>
        
        <section data-content-type={ContentType.Reference}>
          <NextSteps />
        </section>
      </>
    )
  };
  // Prevent initial scroll
  useEffect(() => {
    if (state.shouldPreventScroll) {
      window.scrollTo(0, 0);
      setState(prev => ({ ...prev, shouldPreventScroll: false }));
    }
  }, [state.shouldPreventScroll]);

  useEffect(() => {
    if (isLessonCompleted && state.hasRunCode && !state.showCompletionModal) {
      setState(prev => ({ ...prev, showCompletionModal: true }));
    }
  }, [isLessonCompleted, state.hasRunCode, state.showCompletionModal]);

  return (
    <PageLayout>
      {/* Achievement Display */}
      {showingAchievement && currentAchievement && (
        <AchievementModal
          showing={showingAchievement}
          achievement={currentAchievement}
          queue={achievementQueue}
          onDismiss={dismissAchievement}
        />
      )}

      {/* Completion Modal */}
      <CompletionModal
        show={state.showCompletionModal}
        onClose={() => {
          setState(prev => ({ ...prev, showCompletionModal: false }));
        }}
        achievements={introductionConfig.achievements}
        earnedAchievements={earnedLessonAchievements}
      />

      {/* Navigation */}
      <FloatingNextButton 
        show={isLessonCompleted}
        nextPath={`/lessons/full-course/programming-primer/variables`}
      />

      {/* Progress Indicators */}
      {user && <XPCounter />}
      {!user && <GamificationCTA />}

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <div className="space-y-8">
          <LessonContent
            content={lessonContent}
            onComplete={() => setState(prev => ({ ...prev, showCompletionModal: true }))}
          />

          {/* Achievement List - Only shown at lesson level */}
          {user && (
            <AchievementList
              key={forceUpdate}
              earnedAchievements={earnedLessonAchievements}
              availableAchievements={availableLessonAchievements}
              achievementQueue={achievementQueue}
              showLessonLinks={false}
              onAchievementClick={(achievement) => setState(prev => ({ ...prev, selectedAchievement: achievement }))}
            />
          )}
        </div>
      </div>

      {state.selectedAchievement && (
        <AchievementChallengeModal
          show={true}
          onClose={() => setState(prev => ({ ...prev, selectedAchievement: null }))}
          achievement={state.selectedAchievement}
        />
      )}
    </PageLayout>
  );
}