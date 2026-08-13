'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-panel">
          <div className="error-boundary-card">
            <span className="error-kicker">Application Error</span>
            <h2>Something went wrong</h2>
            <p className="error-message">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <div className="error-actions">
              <button type="button" className="btn btn-primary" onClick={this.handleReset}>
                Try again
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
