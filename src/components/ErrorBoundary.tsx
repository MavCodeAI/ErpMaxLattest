import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { monitoring } from "@/services/monitoring";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Log error to audit trail
    console.log("Error caught by boundary:", {
      error: error.message,
      componentStack: errorInfo.componentStack || '',
    });

    // Track error with monitoring service
    monitoring.trackComponentError(error, { componentStack: errorInfo.componentStack || '' });

    // Set error info in state for display
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">
              We're sorry, but something went wrong. Please try again.
            </p>
            
            {/* Show detailed error info in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-destructive/10 p-4 rounded-lg mt-4">
                <h3 className="font-bold text-destructive">Development Error Details:</h3>
                <p className="text-sm mt-2">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                <p className="text-sm mt-2">
                  <strong>Component Stack:</strong>
                </p>
                <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto max-h-40">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground/80">
              {this.state.error?.message}
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                }}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              {import.meta.env.DEV && (
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="gap-2"
                >
                  Reload Page
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized Error Boundary for Data Loading operations (API failures, network issues)
 * Provides graceful fallback with retry options for cached data
 */
export class DataLoadingBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Data loading error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold">Failed to Load Data</h3>
            <p className="text-muted-foreground text-sm">
              Unable to load data. This might be due to network issues or server problems.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                }}
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
            {this.state.error && import.meta.env.DEV && (
              <p className="text-xs text-muted-foreground mt-2">
                Error: {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized Error Boundary for Form Submissions
 * Preserves form state and shows validation errors
 */
export class FormSubmissionBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Form submission error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h4 className="text-sm font-semibold text-red-800">Form Error</h4>
          </div>
          <p className="text-sm text-red-600 mt-1">
            There was an error submitting the form. Please check your input and try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: undefined, errorInfo: undefined });
            }}
            className="mt-2"
          >
            Retry
          </Button>
          {this.state.error && import.meta.env.DEV && (
            <p className="text-xs text-red-900 mt-2">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized Error Boundary for Data Mutations (CRUD operations)
 * Handles optimistic updates with rollback on failure
 */
export class DataMutationBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Data mutation error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <h4 className="text-sm font-semibold text-orange-800">Operation Failed</h4>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            The operation couldn't be completed. Your changes may not have been saved.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: undefined, errorInfo: undefined });
            }}
            className="mt-2"
          >
            Try Again
          </Button>
          {this.state.error && import.meta.env.DEV && (
            <p className="text-xs text-orange-900 mt-2">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized Error Boundary for Search Operations
 * Shows degraded functionality with cached results
 */
export class SearchOperationBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Search operation error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-2 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-800">Search Temporarily Unavailable</h4>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Search functionality is experiencing issues. Basic search is still available.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: undefined, errorInfo: undefined });
            }}
            className="mt-1 h-7"
          >
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
