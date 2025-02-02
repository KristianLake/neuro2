// Types for lesson components and data
import { Achievement } from '../../../types/achievements';

export interface LessonConfig {
  title: string;
  subtitle: string;
  moduleNumber: number;
  lessonNumber: number;
  achievements: Achievement[];
  nextLessonPath: string;
}

export interface LessonProps {
  config: LessonConfig;
}

export interface CodeEditorProps {
  onSuccess?: () => void;
}

export interface CompletionModalProps {
  show: boolean;
  onClose: () => void;
  achievements: Achievement[];
  earnedAchievements: Achievement[];
}

export interface FloatingNextButtonProps {
  show: boolean;
  nextPath: string;
}

export interface LessonHeaderProps {
  title: string;
  subtitle: string;
  moduleNumber: number;
  lessonNumber: number;
}