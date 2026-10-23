/**
 * @file components/PendingDiscoConfirmationPage/PendingDiscoConfirmationPage.tsx
 * @description Page component for the Pending Disco order confirmation page.
 * Header and site footer are provided by the parent layout (PageLayout).
 */

import React from "react";
import styles from "./PendingDisConfirmationPage.module.css";

export function PendingDisConfirmationPage() {
  return (
    <div className={styles.root}>
      <section
        className={styles.confirmationBanner}
        aria-labelledby="confirmation-heading"
      >
        <div className={styles.confirmationContent}>
          <h1 id="confirmation-heading" className={styles.confirmationHeading}>
            Your order is being processed. Thank you!
          </h1>
          <p className={styles.confirmationBody}>
            You’ll receive a Service Order Confirmation email with your new
            service information.
          </p>
        </div>
      </section>
    </div>
  );
}
