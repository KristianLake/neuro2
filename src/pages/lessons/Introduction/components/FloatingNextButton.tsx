import { Link } from 'react-router-dom';
import { useTheme } from '../../../../contexts/ThemeContext';

interface FloatingNextButtonProps {
  show: boolean;
  nextPath: string;
}

export default function FloatingNextButton({ show, nextPath }: FloatingNextButtonProps) {
  const { theme } = useTheme();

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Link
        to={nextPath}
        className={`inline-flex items-center rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-white ${
          theme === 'dark'
            ? 'bg-indigo-500 hover:bg-indigo-400'
            : theme === 'neurodivergent'
            ? 'bg-teal-600 hover:bg-teal-500'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        Next Lesson →
      </Link>
    </div>
  );
}