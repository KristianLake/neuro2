import { useState, useCallback, useEffect } from 'react';
import { Achievement } from '../../../../types/achievements';
import { achievementManager } from '../../../../lib/achievementManager';
import JSConfetti from 'js-confetti';

export function useAchievementTracking() {
  const [showingAchievement, setShowingAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  const showConfetti = useCallback(() => {
    const jsConfetti = new JSConfetti();
    jsConfetti.addConfetti({
      emojis: ['⭐', '🎉', '✨', '💫'],
      emojiSize: 50,
      confettiNumber: 40,
    });
  }, []);

  const dismissAchievement = useCallback(() => {
    if (achievementQueue.length <= 1) {
      setShowingAchievement(false);
      setCurrentAchievement(null);
      setAchievementQueue([]);
      achievementManager.onAchievementDismissed();
    } else {
      const [_, ...remainingAchievements] = achievementQueue;
      setAchievementQueue(remainingAchievements);
      setCurrentAchievement(remainingAchievements[0]);
      showConfetti();
    }
  }, [achievementQueue, showConfetti]);

  const triggerUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    achievementManager.setCallback({
      onAchievementEarned: (newAchievements) => {
        console.log('Achievement earned callback:', newAchievements);
        setAchievementQueue(prev => [...prev, ...newAchievements]);
        if (!showingAchievement) {
          setCurrentAchievement(newAchievements[0]);
          setShowingAchievement(true);
          showConfetti();
        }
      }
    });

    achievementManager.setForceUpdate(triggerUpdate);

    return () => {
      achievementManager.setCallback(null);
      achievementManager.setForceUpdate(null);
    };
  }, [triggerUpdate, showingAchievement, showConfetti]);

  return {
    showingAchievement,
    currentAchievement,
    achievementQueue,
    forceUpdate,
    dismissAchievement
  };
}