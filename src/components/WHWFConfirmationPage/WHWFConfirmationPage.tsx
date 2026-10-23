/**
 * @file components/WHWFConfirmationPage/WHWFConfirmationPage.tsx
 * @description Page component for the Whole-Home Wi-Fi order confirmation page.
 * Header and site footer are provided by the parent layout (PageLayout).
 */

import React from "react";
import styles from "./WHWFConfirmationPage.module.css";

type WHWFConfirmationPageProps = {
  message: string;
};

export function WHWFConfirmationPage({ message }: WHWFConfirmationPageProps) {
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
            You’ll receive a Service Order Confirmation email showing changes to
            your bill. Your self-installation kit should be delivered within 5-7
            business days.
          </p>
          <p className={styles.confirmationTagline}>{message}</p>
        </div>
      </section>
    </div>
  );
}
