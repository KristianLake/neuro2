import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';

interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function BaseTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = ''
}: BaseTableProps<T>) {
  const { theme } = useTheme();

  const themeStyles = {
    dark: {
      table: `bg-${themeConfig.colors.dark.background.card}`,
      header: `bg-${themeConfig.colors.dark.background.main} text-${themeConfig.colors.dark.text.secondary}`,
      row: `border-${themeConfig.colors.dark.border.base} text-${themeConfig.colors.dark.text.secondary}`,
      rowHover: `hover:bg-${themeConfig.colors.dark.background.hover}`,
      empty: `text-${themeConfig.colors.dark.text.muted}`
    },
    neurodivergent: {
      table: `bg-${themeConfig.colors.neurodivergent.background.card}`,
      header: `bg-${themeConfig.colors.neurodivergent.background.main} text-${themeConfig.colors.neurodivergent.text.primary}`,
      row: `border-${themeConfig.colors.neurodivergent.border.base} text-${themeConfig.colors.neurodivergent.text.primary}`,
      rowHover: `hover:bg-${themeConfig.colors.neurodivergent.background.hover}`,
      empty: `text-${themeConfig.colors.neurodivergent.text.muted}`
    },
    light: {
      table: `bg-${themeConfig.colors.light.background.card}`,
      header: `bg-${themeConfig.colors.light.background.main} text-${themeConfig.colors.light.text.secondary}`,
      row: `border-${themeConfig.colors.light.border.base} text-${themeConfig.colors.light.text.primary}`,
      rowHover: `hover:bg-${themeConfig.colors.light.background.hover}`,
      empty: `text-${themeConfig.colors.light.text.muted}`
    }
  };

  const styles = themeStyles[theme];

  if (isLoading) {
    return (
      <div className={`animate-pulse ${styles.table} rounded-lg p-4 ${className}`}>
        <div className={`h-8 bg-${themeConfig.colors[theme].background.hover} rounded w-1/4 mb-4`}></div>
        <div className="space-y-3">
          <div className={`h-4 bg-${themeConfig.colors[theme].background.hover} rounded`}></div>
          <div className={`h-4 bg-${themeConfig.colors[theme].background.hover} rounded w-5/6`}></div>
          <div className={`h-4 bg-${themeConfig.colors[theme].background.hover} rounded`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg ${styles.table} ${className}`}>
      <table className="min-w-full divide-y">
        <thead className={styles.header}>
          <tr>
            {columns.map(column => (
              <th
                key={column.key as string}
                className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                }`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${styles.row}`}>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={`px-6 py-4 text-sm text-center ${styles.empty}`}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={`${onRowClick ? `cursor-pointer ${styles.rowHover}` : ''}`}
              >
                {columns.map(column => (
                  <td
                    key={column.key as string}
                    className={`px-6 py-4 text-sm whitespace-nowrap ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : String(item[column.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}