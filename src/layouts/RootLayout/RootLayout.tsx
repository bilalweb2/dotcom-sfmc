/**
 * @file layouts/RootLayout/RootLayout.tsx
 * @description App-level wrapper. Catches render errors so a page shows a fallback
 * instead of a blank screen.
 */

import type { PropsWithChildren } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function RootLayout({ children }: PropsWithChildren) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
