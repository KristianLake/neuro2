// Course content types
export interface Course {
  id: string;
  slug: string; // URL-friendly identifier
  type: 'complete' | 'mini' | 'masterclass';
  title: string;
  description: string;
  price: number;
  modules: Module[];
  metadata?: {
    targetAudience?: string[];
    idealFor?: string[];
    notFor?: string[];
    benefits?: {
      increase: string[];
      decrease: string[];
    };
  };
}

export interface Module {
  id: string;
  courseId: string; // Reference to parent course
  slug: string;
  title: string;
  description: string;
  order: number;
  price: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string; // Reference to parent module
  courseId: string; // Reference to parent course
  slug: string;
  title: string;
  description: string;
  order: number;
  isPremium: boolean;
  path: string;
}