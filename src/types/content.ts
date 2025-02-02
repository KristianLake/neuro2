// Course content types
export interface CourseData {
  id: string;
  slug: string;
  type: 'complete' | 'mini' | 'masterclass';
  title: string;
  description: string;
  price: number;
  course_path?: string;
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
  courseId: string;
  slug: string;
  title: string;
  description: string;
  order_number: number;
  price: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  slug: string;
  title: string;
  description: string;
  order_number: number;
  is_premium: boolean;
  path: string;
}