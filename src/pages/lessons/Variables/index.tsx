import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAchievements } from '../../../hooks/useAchievements';
import { Achievement } from '../../../types/achievements';
import { ContentType } from '../../../components/course/types';
import { useAchievementTracking } from '../Introduction/hooks/useAchievementTracking';
import VariablesIntro from './components/VariablesIntro';
import DataTypes from './components/DataTypes';
import AdvancedTypes from './components/AdvancedTypes';
import VariableExercises from './components/VariableExercises';
import { variablesConfig } from './config';
import { LessonContent } from '../../../components/course/content/LessonContent';
import AchievementChallengeModal from '../../../components/AchievementChallengeModal';
import AchievementModal from '../../../components/AchievementModal';
import FloatingNextButton from '../Introduction/components/FloatingNextButton';
import CompletionModal from './components/CompletionModal';
import XPCounter from '../Introduction/components/XPCounter';
import GamificationCTA from '../Introduction/components/GamificationCTA';
import AchievementList from '../../../components/AchievementList';
import { PageLayout } from '../../../components/layouts/PageLayout';

export default function Variables() {
  const { user } = useAuth();
  const { achievements = [] } = useAchievements();
  const {
    showingAchievement,
    currentAchievement,
    achievementQueue,
    forceUpdate,
    dismissAchievement
  } = useAchievementTracking();

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFloatingNext, setShowFloatingNext] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Initialize achievement state
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

  // Update achievement state when achievements change
  useEffect(() => {
    if (achievements && achievements.length > 0) {
      const earned = new Set(achievements.map(a => a.id));
      setEarnedIds(earned);
      
      setEarnedAchievements(variablesConfig.achievements.filter(
        achievement => earned.has(achievement.id)
      ));
      
      setAvailableAchievements(variablesConfig.achievements.filter(
        achievement => !earned.has(achievement.id)
      ));
      
      setIsLessonCompleted(variablesConfig.achievements.every(
        achievement => earned.has(achievement.id)
      ));
    }
  }, [achievements]);

  const handleCodeSuccess = () => {
    if (isLessonCompleted) {
      setShowCompletionModal(true);
    }
  };

  const lessonContent = {
    metadata: {
      id: 'variables',
      title: 'Variables and Data Types - Programming Primer',
      description: 'Understanding different types of data',
      type: ContentType.Lesson,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      author: 'Kristian Lake',
      estimatedTime: 60,
      difficulty: 'beginner',
      prerequisites: ['full-course/programming-primer/introduction'],
      nextContent: 'full-course/programming-primer/functions'
    },
    content: (
      <>
        <section data-content-type={ContentType.Theory}>
          <VariablesIntro />
        </section>
        
        <section data-content-type={ContentType.Theory}>
          <DataTypes />
        </section>
        
        <section data-content-type={ContentType.Theory}>
          <AdvancedTypes />
        </section>
        
        <section data-content-type={ContentType.Practice}>
          <VariableExercises onSuccess={handleCodeSuccess} />
        </section>
      </>
    )
  };

  useEffect(() => {
    if (isLessonCompleted && !showCompletionModal && !showFloatingNext) {
      setShowCompletionModal(true);
    }
  }, [isLessonCompleted, showCompletionModal, showFloatingNext]);

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
        show={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setShowFloatingNext(true);
        }}
        achievements={variablesConfig.achievements}
        earnedAchievements={earnedAchievements}
      />

      {/* Navigation */}
      <FloatingNextButton 
        show={showFloatingNext}
        nextPath={`/lessons/full-course/programming-primer/functions`}
      />

      {/* Progress Indicators */}
      {user && <XPCounter />}
      {!user && <GamificationCTA />}

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <div className="space-y-8">
          <LessonContent
            content={lessonContent}
            onComplete={() => setShowCompletionModal(true)}
          />

          {/* Achievement List - Only shown at lesson level */}
          {user && (
            <AchievementList
              key={forceUpdate}
              earnedAchievements={earnedAchievements}
              availableAchievements={availableAchievements}
              achievementQueue={achievementQueue}
              showLessonLinks={false}
              onAchievementClick={setSelectedAchievement}
            />
          )}
        </div>
      </div>

      {selectedAchievement && (
        <AchievementChallengeModal
          show={true}
          onClose={() => setSelectedAchievement(null)}
          achievement={selectedAchievement}
        />
      )}
    </PageLayout>
  );
}