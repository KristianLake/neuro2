import { LessonConfig } from './types';
import { INTRODUCTION_ACHIEVEMENTS } from '../../../lib/achievements';

export const introductionConfig: LessonConfig = {
  title: 'Welcome to Programming!',
  subtitle: 'Begin your coding journey with the fundamentals',
  moduleNumber: 1,
  lessonNumber: 1,
  achievements: INTRODUCTION_ACHIEVEMENTS,
  nextLessonPath: '/lessons/variables'
};