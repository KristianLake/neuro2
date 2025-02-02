import { useTheme } from '../../../../contexts/ThemeContext';

interface StandardPlanProps {
  isSelected: boolean;
  ownsStandard: boolean;
  onSelect: () => void;
}

export function StandardPlan({
  isSelected,
  ownsStandard,
  onSelect
}: StandardPlanProps) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-6 ${
      theme === 'dark'
        ? ownsStandard ? 'bg-gray-700/50' : 'bg-gray-700'
        : theme === 'neurodivergent'
        ? ownsStandard ? 'bg-amber-50/50' : 'bg-amber-50'
        : ownsStandard ? 'bg-gray-50/50' : 'bg-gray-50'
    } relative`}>
      {ownsStandard && (
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
          theme === 'dark'
            ? 'bg-indigo-900/20 text-indigo-400'
            : theme === 'neurodivergent'
            ? 'bg-teal-100 text-teal-600'
            : 'bg-indigo-100 text-indigo-600'
        }`}>
          Purchased
        </div>
      )}
      <h3 className={`text-xl font-bold mb-2 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Standard</h3>
      <div className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        £2,497
      </div>
      <ul className={`space-y-2 mb-6 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <li className="flex items-center">
          <span className="mr-2">✓</span>
          Complete course access
        </li>
        <li className="flex items-center">
          <span className="mr-2">✓</span>
          Group Q&A sessions
        </li>
        <li className="flex items-center">
          <span className="mr-2">✓</span>
          Discord community
        </li>
        <li className="flex items-center">
          <span className="mr-2">✓</span>
          Project feedback
        </li>
      </ul>
      <button
        onClick={onSelect}
        disabled={ownsStandard}
        className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          ownsStandard
            ? theme === 'dark'
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : theme === 'neurodivergent'
              ? 'bg-amber-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : theme === 'dark'
            ? isSelected
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'bg-gray-600 text-white hover:bg-gray-500'
            : theme === 'neurodivergent'
            ? isSelected
              ? 'bg-teal-600 text-white'
              : 'bg-amber-200 text-gray-900 hover:bg-amber-300'
            : isSelected
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        }`}
      >
        {ownsStandard ? 'Purchased' : isSelected ? 'Selected' : 'Select Standard'}
      </button>
    </div>
  );
}