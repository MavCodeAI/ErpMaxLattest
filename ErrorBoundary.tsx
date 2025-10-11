import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service (placeholder for real implementation)
    this.logErrorToService(error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey)) {
        this.resetErrorBoundary();
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your error reporting service
    // like Sentry, Bugsnag, LogRocket, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || 'anonymous',
    };

    // Simulate API call to error service
    console.log('Error report:', errorReport);
    
    // Store in localStorage as fallback
    try {
      const existingErrors = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      localStorage.setItem('errorReports', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to store error report:', e);
    }
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    const subject = encodeURIComponent(`Bug Report - ${error?.message}`);
    const body = encodeURIComponent(`
Error ID: ${eventId}
Error Message: ${error?.message}
Stack Trace: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:

    `);
    
    // This would typically open your bug reporting system
    const mailto = `mailto:support@erpmax.com?subject=${subject}&body=${body}`;
    window.open(mailto);
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, eventId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. We've been notified and are working to fix it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {eventId && (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    Error ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{eventId}</code>
                  </AlertDescription>
                </Alert>
              )}

              {isDevelopment && error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs">
                    <strong>Development Error:</strong><br />
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-muted-foreground">
                <p>You can try:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Refreshing the page</li>
                  <li>Going back to the home page</li>
                  <li>Reporting this issue if it persists</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2 w-full">
                <Button 
                  onClick={this.handleRetry} 
                  className="flex-1"
                  ariaLabel="Try again"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="flex-1"
                  ariaLabel="Reload page"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 w-full">
                <Button 
                  variant="secondary" 
                  onClick={this.handleGoHome}
                  className="flex-1"
                  ariaLabel="Go to home page"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={this.handleReportBug}
                  className="flex-1"
                  ariaLabel="Report this bug"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manually triggering error boundary
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Manual error trigger:', error, errorInfo);
    throw error;
  };
};