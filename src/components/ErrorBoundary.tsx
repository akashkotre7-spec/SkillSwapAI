import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mb-6">
             <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black mb-4">Something went wrong.</h1>
          <p className="text-white/40 mb-8 max-w-md">The application encountered an unexpected error. Please try refreshing the page.</p>
          <pre className="text-[10px] text-red-500 bg-red-500/10 p-4 rounded-xl overflow-auto max-w-full text-left">
            {this.state.error?.message}
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 px-8 py-3 bg-white text-brand-black rounded-xl font-bold"
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
