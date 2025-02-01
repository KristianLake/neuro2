import { Component, ErrorInfo } from 'react';
import { logError } from '../../utils/errorHandling';
import { ContentErrorFallback } from './ContentErrorFallback';

interface Props {
  children: React.ReactNode;
  contentId: string;
  onRetry?: () => void;
}

interface State {
  error: Error | null;
}

export class ContentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, {
      componentStack: errorInfo.componentStack,
      contentId: this.props.contentId,
      context: 'ContentErrorBoundary'
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.contentId !== this.props.contentId) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <ContentErrorFallback
          error={this.state.error}
          onRetry={() => {
            this.setState({ error: null });
            this.props.onRetry?.();
          }}
        />
      );
    }

    return this.props.children;
  }
}