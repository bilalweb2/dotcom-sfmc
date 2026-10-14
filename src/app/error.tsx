"use client";

/**
 * Global error boundary — rendered by Next.js when an unhandled runtime error
 * occurs in the route segment. Must be a Client Component.
 *
 * `reset` re-renders the segment; `error.digest` is a server-side error ID
 * that appears in server logs for correlation.
 */
import React, { useEffect } from "react";
import Link from "next/link";
import styles from "./error.module.css";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to an observability service here if needed.
    console.error("[ErrorPage]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <p className={styles.code}>500</p>
        <h1 className={styles.heading}>Something went wrong</h1>
        <p className={styles.subtext}>
          An unexpected error occurred. Our team has been notified.
          {error.digest ? (
            <>
              {" "}
              Reference: <code className={styles.digest}>{error.digest}</code>
            </>
          ) : null}
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.ctaButton} onClick={reset}>
            Try again
          </button>
          <Link href="/" className={styles.secondaryButton}>
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
