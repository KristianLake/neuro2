const handleCodeSuccess = () => {
  // Only handle achievements during practice section
  if (!showPractice) return;
  
  // Check if all available achievements have been earned
  const hasAvailableAchievements = availableAchievements?.length === 0;
  
  if (hasAvailableAchievements) {
    setPracticeCompleted(true);
    saveProgress({
      showSteps: false,
      showPractice: true,
      completed: completed,
      practiceCompleted: true
    });

    if (onComplete) {
      onComplete();
    }
  }
};