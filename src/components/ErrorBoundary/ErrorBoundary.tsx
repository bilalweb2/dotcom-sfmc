/**
 * @file components/ErrorBoundary/ErrorBoundary.tsx
 * @description React Error Boundary — catches uncaught render errors in the subtree
 * and displays a friendly fallback UI instead of a blank screen.
 *
 * Usage:
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <YourComponent />
 *   </ErrorBoundary>
 */

"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

// ---------------------------------------------------------------------------
// Props / State
// ---------------------------------------------------------------------------
interface ErrorBoundaryProps {
  /** Custom fallback UI. Receives the caught error and a retry handler. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production, wire this to your error-reporting service (e.g. Sentry).
    console.error(
      "[ErrorBoundary] Uncaught error:",
      error,
      info.componentStack,
    );
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      return (
        <div className={styles.container} role="alert">
          <div className={styles.card}>
            <span className={styles.icon} aria-hidden="true">
              ⚠️
            </span>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.message}>
              {error.message ||
                "An unexpected error occurred. Please try again."}
            </p>
            <button className={styles.retryButton} onClick={this.handleReset}>
              Try again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
