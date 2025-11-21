import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // e.g., "Add Employee Form", "Invoice Creation"
  onReset?: () => void; // Custom reset function
  showReset?: boolean; // Whether to show reset button
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  resetCount: number;
}

class FormErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | undefined;

  public state: State = {
    hasError: false,
    resetCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      resetCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error(`Error in ${this.props.context || 'form component'}:`, error, errorInfo);

    // Log to audit trail (in a real app, this would be sent to analytics)
    if (import.meta.env.PROD) {
      // analytics.track('form_error', {
      //   context: this.props.context,
      //   message: error.message,
      //   componentStack: errorInfo.componentStack
      // });
    }

    this.setState({ errorInfo });
  }

  private handleReset = () => {
    const newResetCount = this.state.resetCount + 1;

    // If reset multiple times, there might be a deeper issue
    if (newResetCount > 2) {
      toast.error("Multiple errors detected. Please refresh the page or contact support.");
      return;
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      resetCount: newResetCount,
    });

    // Call custom reset function if provided
    if (this.props.onReset) {
      this.props.onReset();
    }

    toast.info("Form has been reset. Please try again.");
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="border border-destructive/50 rounded-lg p-6 bg-destructive/5">
          <Alert variant="destructive" className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-destructive">
              {this.props.context ? `${this.props.context} Error` : 'Form Error'}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                Something went wrong while processing the form. This could be due to:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Network connectivity issues</li>
                <li>Invalid data being processed</li>
                <li>Temporary server issues</li>
                <li>Browser compatibility problems</li>
              </ul>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Developer Details (Development Mode)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded text-xs font-mono overflow-auto max-h-32">
                    <div className="font-semibold">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <div className="font-semibold">Component Stack:</div>
                        <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-2 pt-3">
                {this.props.showReset !== false && (
                  <Button
                    onClick={this.handleReset}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset Form
                  </Button>
                )}
                <Button
                  onClick={this.handleReload}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FormErrorBoundary;
