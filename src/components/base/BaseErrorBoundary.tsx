import { Component, ErrorInfo } from 'react';
import { logError } from '../../utils/errorHandling';
import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';

interface Props {
  children: React.ReactNode;
  fallback: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class BaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    logError(error, {
      componentStack: errorInfo.componentStack,
      context: 'BaseErrorBoundary'
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      const FallbackComponent = this.props.fallback;
      // Use useTheme hook in a functional component wrapper
      const ErrorWrapper = () => {
        const { theme } = useTheme();
        return (
          <div className={`min-h-screen flex items-center justify-center bg-${themeConfig.colors[theme].background.main}`}>
            <FallbackComponent error={this.state.error} resetError={this.resetError} />
          </div>
        );
      };
      
      return <ErrorWrapper />;
    }

    return this.props.children;
  }
}