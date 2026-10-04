import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI exception in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#CCD7D0] dark:bg-[#0B0E11] text-[#111714] dark:text-[#E6EDF3] font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#E2EAE5]/95 dark:bg-[#12161A]/95 backdrop-blur-xl border border-black/10 dark:border-[#21262D] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              An unexpected application error occurred. You can safely try reloading the session.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 text-[11px] font-mono text-left max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-glow-sm hover:from-emerald-400 hover:to-green-400 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
