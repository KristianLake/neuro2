import { useThemeStyles } from '../../hooks/useThemeStyles';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  alert?: boolean;
}

export function StatsCard({ icon, label, value, alert }: StatsCardProps) {
  const styles = useThemeStyles();

  return (
    <div className={`relative overflow-hidden rounded-lg p-6 ${styles.card.background}`}>
      <dt>
        <div className={`absolute rounded-md p-3 ${
          alert
            ? theme === 'dark'
              ? 'bg-red-900/20 text-red-400'
              : theme === 'neurodivergent'
              ? 'bg-red-100 text-red-600'
              : 'bg-red-100 text-red-600'
            : styles.button.background
        }`}>
          {icon}
        </div>
        <p className={`ml-16 truncate text-sm font-medium ${styles.text.muted}`}>
          {label}
        </p>
      </dt>
      <dd className={`ml-16 flex items-baseline ${styles.text.primary}`}>
        <p className={`text-2xl font-semibold ${
          alert
            ? theme === 'dark'
              ? 'text-red-400'
              : theme === 'neurodivergent'
              ? 'text-red-600'
              : 'text-red-600'
            : ''
        }`}>{value}</p>
      </dd>
    </div>
  );
}