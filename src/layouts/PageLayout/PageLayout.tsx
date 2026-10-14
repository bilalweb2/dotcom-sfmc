/**
 * @file layouts/PageLayout/PageLayout.tsx
 * @description Common page shell shared by every route.
 * Renders the Frontier SiteHeader (pinned while the page scrolls), a flexible
 * main content area, and the SiteFooter.
 * Pass page-specific content as children — no per-page header/footer work needed.
 *
 * @example
 * // In app/layout.tsx (already wired):
 * <PageLayout>{children}</PageLayout>
 */

import React, { type PropsWithChildren } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./PageLayout.module.css";

interface PageLayoutProps extends PropsWithChildren {
  /** Set to false to suppress the SiteFooter on a specific route. Defaults to true. */
  showFooter?: boolean;
  /** When true, main content sizes to its children instead of filling the viewport. */
  compact?: boolean;
}

export function PageLayout({
  children,
  showFooter = true,
  compact = false,
}: PageLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <SiteHeader />
      <main className={compact ? styles.mainCompact : styles.main}>
        {children}
      </main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
