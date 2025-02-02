import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Achievement } from '../types/achievements';
import { ACHIEVEMENTS } from '../lib/achievements';

export function useAchievements() {
  const { user } = useAuth();
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if all achievements for a specific lesson are completed
  const hasCompletedLesson = useCallback((lessonPath: string) => {
    const lessonAchievements = ACHIEVEMENTS.filter(
      achievement => achievement.lessonPath === lessonPath
    );
    return lessonAchievements.length > 0 && 
      lessonAchievements.every(achievement => 
        earnedAchievements.some(earned => earned.id === achievement.id)
      );
  }, [earnedAchievements]);

  // Get achievements for a specific lesson
  const getLessonAchievements = useCallback((lessonPath: string) => {
    const earned = earnedAchievements.filter(
      achievement => achievement.lessonPath === lessonPath
    );
    const available = ACHIEVEMENTS.filter(
      achievement => achievement.lessonPath === lessonPath &&
      !earnedAchievements.some(earned => earned.id === achievement.id)
    );
    return { earned, available };
  }, [earnedAchievements]);
  const hasAchievement = (achievementId: string) =>
    earnedAchievements.some(a => a.id === achievementId);

  const loadAchievements = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get achievements from database
      const { data: earnedAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (achievementsError) throw achievementsError;

      // Map to achievement objects
      const achievements = earnedAchievements?.map(earned => 
        ACHIEVEMENTS.find(a => a.id === earned.achievement_id)
      ).filter((a): a is Achievement => a !== undefined) || [];

      // Calculate total XP
      const xp = achievements.reduce((total, achievement) => total + achievement.xp, 0);

      setEarnedAchievements(achievements);
      setTotalXp(xp);
    } catch (error) {
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) {
      loadAchievements(user.id);
    }
  }, [user?.id]);

  const awardAchievement = async (userId: string, achievementId: string) => {
    try {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) throw new Error(`Achievement ${achievementId} not found`);

      if (hasAchievement(achievementId)) return null;

      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievementId,
          lesson_path: achievement.lessonPath
        }]);

      if (insertError) throw insertError;

      // Update local state
      setEarnedAchievements(prev => [...prev, achievement]);
      setTotalXp(prev => prev + achievement.xp);

      return achievement;
    } catch (error) {
      setError('Failed to award achievement');
      return null;
    }
  };

  const resetAchievements = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_achievements')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setEarnedAchievements([]);
      setTotalXp(0);
      setError(null);
    } catch (error) {
      setError('Failed to reset achievements');
    }
  };
  return {
    earnedAchievements,
    availableAchievements: ACHIEVEMENTS.filter(
      achievement => !earnedAchievements.some(earned => earned.id === achievement.id)
    ),
    totalXp,
    awardAchievement: user ? 
      (achievementId: string) => awardAchievement(user.id, achievementId) :
      () => Promise.resolve(null),
    hasAchievement,
    hasCompletedLesson,
    getLessonAchievements,
    resetAchievements: user ?
      () => resetAchievements(user.id) :
      () => Promise.resolve(),
    loading,
    error,
    allAchievements: ACHIEVEMENTS
  };
}