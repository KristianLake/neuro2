import { useTheme } from '../../../contexts/ThemeContext';
import { Module, Plan } from '../types/plans';

interface PurchaseHeaderProps {
  isFullCourse: boolean;
  module: Module | null;
  fullCourse: Plan | null;
}

export function PurchaseHeader({ isFullCourse, module, fullCourse }: PurchaseHeaderProps) {
  const { theme } = useTheme();

  return (
    <div className={`px-6 py-8 ${
      theme === 'dark'
        ? 'bg-gray-900'
        : theme === 'neurodivergent'
        ? 'bg-amber-200/50'
        : 'bg-indigo-600'
    }`}>
      <h1 className={`text-2xl font-bold mb-2 ${
        theme === 'dark'
          ? 'text-white'
          : theme === 'neurodivergent'
          ? 'text-gray-900'
          : 'text-white'
      }`}>
        {isFullCourse ? fullCourse?.name : module?.name}
      </h1>
      <p className={`${
        theme === 'dark'
          ? 'text-gray-300'
          : theme === 'neurodivergent'
          ? 'text-gray-800'
          : 'text-gray-100'
      }`}>
        {isFullCourse ? 'Complete web development course designed for neurodivergent learners' : module?.description}
      </p>
    </div>
  );
}