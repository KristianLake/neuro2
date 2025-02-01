import { ReactNode } from 'react';

// Content Types
export enum ContentType {
  Text = 'text',
  Video = 'video',
  Quiz = 'quiz',
  Assignment = 'assignment',
  Code = 'code',
  Lesson = 'lesson',
  Theory = 'theory',
  Practice = 'practice',
  Reference = 'reference'
}

// Difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Progress status
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

// Content Metadata
export interface ContentMetadata {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  tags?: string[];
  version: string;
  lastUpdated: string;
  locale?: string;
  author?: string;
  estimatedTime?: number; // in minutes
  difficulty?: DifficultyLevel;
  prerequisites?: string[];
  nextContent?: string;
  previousContent?: string;
}

// Base Content Interface
export interface BaseContent {
  metadata: ContentMetadata;
  content: ReactNode;
  readonly accessibility?: {
    altText?: string;
    transcripts?: Record<string, string>;
    ariaLabels?: Record<string, string>;
  };
  readonly tracking?: {
    viewCount?: number;
    completionRate?: number;
    averageTime?: number;
    readonly feedback?: {
      rating: number;
      comments: readonly string[];
    };
  };
}

// Quiz Question Types
export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'coding'
  | 'short-answer'
  | 'matching';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points?: number;
}

// Progress Tracking
export interface Progress {
  contentId: string;
  userId: string;
  status: ProgressStatus;
  score?: number;
  attempts?: number;
  timeSpent?: number;
  lastAccessed?: string;
  completedAt?: string;
}

// Content Organization
export interface ContentModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  contents: ContentMetadata[];
  prerequisites?: string[];
  objectives?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: ContentModule[];
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
    difficulty: DifficultyLevel;
    estimatedTime: number;
    tags: string[];
  };
}