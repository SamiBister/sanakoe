'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import React, { Component, ReactNode } from 'react';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /**
   * Child components to wrap
   */
  children: ReactNode;
  /**
   * Optional fallback UI when error occurs
   */
  fallback?: ReactNode;
  /**
   * Optional callback when error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component - Catches React errors and displays fallback UI
 *
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 *
 * Features:
 * - Catches render errors, lifecycle method errors, and constructor errors
 * - Displays kid-friendly error message
 * - Provides "Try Again" button to reset the error state
 * - Option to return to home page
 * - Optional callback for error logging
 *
 * Note: Error boundaries do NOT catch:
 * - Event handler errors (use try/catch instead)
 * - Asynchronous code (e.g., setTimeout)
 * - Server-side rendering errors
 * - Errors thrown in the error boundary itself
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error) => logError(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Update state so the next render will show the fallback UI
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Log the error and call optional callback
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset the error state to try again
   */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  /**
   * Navigate to home page
   */
  handleGoHome = (): void => {
    // Reset state first
    this.setState({ hasError: false, error: null });
    // Navigate to home - use window.location for full page reload
    window.location.href = '/';
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback;
      }

      // Default kid-friendly fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="text-6xl mb-4">😅</div>
              <h2 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-lg text-gray-600">
                Don&apos;t worry, it&apos;s not your fault! Let&apos;s try again.
              </p>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                  <p className="text-sm font-medium text-red-800 mb-1">Error details:</p>
                  <p className="text-sm text-red-700 font-mono break-words">{error.message}</p>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button variant="primary" size="lg" onClick={this.handleReset} className="w-full">
                  🔄 Try Again
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  🏠 Go to Home
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
