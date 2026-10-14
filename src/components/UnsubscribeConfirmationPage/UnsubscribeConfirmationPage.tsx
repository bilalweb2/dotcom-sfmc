/**
 * @file components/UnsubscribeConfirmationPage/UnsubscribeConfirmationPage.tsx
 * @description Confirmation page shown after a successful unsubscribe request.
 * Matches https://cloud.e.frontier.com/Unsubscribe-Confirmation (intro section).
 * Header is provided by the parent layout; no site footer on this page.
 */

import React from "react";
import styles from "./UnsubscribeConfirmationPage.module.css";

export function UnsubscribeConfirmationPage() {
  return (
    <section className={styles.section} aria-labelledby="confirmation-heading">
      <div className={styles.inner}>
        <h1 id="confirmation-heading" className={styles.heading}>
          You are all set.
        </h1>
        <p className={styles.subtext}>
          Please allow up to 72 hours for processing.
        </p>
      </div>
    </section>
  );
}
