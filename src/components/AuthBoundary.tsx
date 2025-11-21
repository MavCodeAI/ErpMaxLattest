import { Component } from "react";
import { AlertTriangle, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AuthBoundaryProps {
  children: React.ReactNode;
  onSignOut?: () => void;
}

/**
 * Specialized error boundary for authentication-related operations
 * Provides secure error handling for auth flows
 */
export class AuthBoundary extends Component<AuthBoundaryProps, AuthBoundaryState> {
  constructor(props: AuthBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Authentication error:", error, errorInfo);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // monitoring.trackAuthError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleSignOut = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onSignOut?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                There was a problem with authentication. This might be due to network issues or an expired session.
              </p>

              <div className="space-y-2">
                <Button onClick={this.handleRetry} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleSignOut}
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out & Try Login
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm cursor-pointer text-muted-foreground">
                    Development Details
                  </summary>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
