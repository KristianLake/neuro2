import { z } from 'zod';

// Achievement validation schema
export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  xp: z.number().positive(),
  icon: z.string(),
  lessonPath: z.string().optional()
});

export type Achievement = z.infer<typeof achievementSchema>;

export interface AchievementProgress {
  userId: string;
  achievementId: string;
  earnedAt: string;
  lessonPath?: string;
}

export interface AchievementState {
  achievements: Achievement[];
  earnedAchievements: AchievementProgress[];
  totalXp: number;
  loading: boolean;
  error: string | null;
}

export type AchievementEvent = 
  | { type: 'ACHIEVEMENT_EARNED'; achievement: Achievement; userId: string }
  | { type: 'ACHIEVEMENTS_LOADED'; achievements: AchievementProgress[] }
  | { type: 'ACHIEVEMENT_ERROR'; error: string };