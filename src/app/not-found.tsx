import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/layouts/PageLayout/PageLayout";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for could not be found.",
};

/**
 * Global 404 page — rendered by Next.js when no route matches
 * or when `notFound()` is called inside a Server Component.
 */
export default function NotFound() {
  return (
    <PageLayout>
      <div className={styles.root}>
        <div className={styles.container}>
          <p className={styles.code}>404</p>
          <h1 className={styles.heading}>Page not found</h1>
          <p className={styles.subtext}>
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>
          <Link href="/" className={styles.ctaButton}>
            Go to Home
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
