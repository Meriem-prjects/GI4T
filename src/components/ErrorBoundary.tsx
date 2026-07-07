import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Shown as the fallback message under the icon. Falls back to a generic label. */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches uncaught render errors in a subtree and shows a friendly UI
 * instead of a blank white page. Also logs the error so it's visible in
 * the browser console + production logs.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">
                {this.props.label ?? "Une erreur est survenue"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Rechargez la page ou revenez à l'accueil.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={this.reset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button onClick={() => (window.location.href = "/")}>Accueil</Button>
            </div>
            {this.state.error && (
              <details className="text-left text-xs bg-muted/30 p-3 rounded max-h-40 overflow-auto">
                <summary className="cursor-pointer font-mono">
                  {this.state.error.message}
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
