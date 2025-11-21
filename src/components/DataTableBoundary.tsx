import { Component } from "react";
import { AlertTriangle, RefreshCw, Database, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataTableBoundaryState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
  isNetworkError?: boolean;
}

interface DataTableBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  entityName?: string;
  onRetry?: () => void;
}

/**
 * Specialized error boundary for data tables
 * Handles API failures, network issues, and data rendering errors
 */
export class DataTableBoundary extends Component<DataTableBoundaryProps, DataTableBoundaryState> {
  constructor(props: DataTableBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): DataTableBoundaryState {
    const isNetworkError = error.message.includes('fetch') ||
                          error.message.includes('network') ||
                          error.message.includes('timeout');

    return {
      hasError: true,
      error,
      retryCount: 0,
      isNetworkError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`${this.props.entityName || 'Data'} error:`, error, errorInfo);

    // Send to monitoring service
    if (typeof window !== 'undefined' && (window as any).monitoring) {
      (window as any).monitoring.trackComponentError?.(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      retryCount: this.state.retryCount + 1,
      isNetworkError: undefined
    });

    // Call custom retry handler if provided
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isNetworkError, retryCount } = this.state;
      const entityName = this.props.entityName || 'data';

      return (
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              {isNetworkError ? (
                <Wifi className="h-6 w-6 text-destructive" />
              ) : (
                <Database className="h-6 w-6 text-destructive" />
              )}
            </div>
            <CardTitle className="text-lg">
              {isNetworkError ? 'Connection Problem' : 'Data Loading Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {isNetworkError
                ? `Unable to load ${entityName} due to connection issues. Please check your internet connection.`
                : `There was a problem loading ${entityName}. This might be a temporary server issue.`
              }
            </p>

            {retryCount > 2 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Still having issues?
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This problem persists after multiple attempts. You may need to refresh the page or contact support.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={this.handleRetry} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again {retryCount > 0 && `(${retryCount})`}
              </Button>

              {retryCount > 1 && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                Retry: {retryCount}/3
              </Badge>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-4">
                <summary className="text-sm cursor-pointer text-muted-foreground">
                  Development Error Details
                </summary>
                <div className="text-xs bg-muted p-3 rounded mt-2 space-y-2">
                  <div>
                    <strong>Error:</strong> {error.message}
                  </div>
                  {isNetworkError && (
                    <div>
                      <strong>Type:</strong> Network Error
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
