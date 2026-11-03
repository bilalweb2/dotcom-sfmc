/**
 * @file components/WHWFConfirmationPage/WHWFConfirmationPage.tsx
 * @description Page component for the Whole-Home Wi-Fi order confirmation page.
 * Header and site footer are provided by the parent layout (PageLayout).
 */

import React from "react";
import styles from "./WHWFConfirmationPage.module.css";

type WHWFConfirmationPageProps = {
  message: string;
  orderNow: boolean;
  UBB: boolean;
};

export function WHWFConfirmationPage({ message, orderNow, UBB }: WHWFConfirmationPageProps) {
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
          <p className={`${styles.confirmationTagline} ${UBB ? styles.ubbTagline : ""}`}>{message}</p>
          {orderNow && (
            <>
            <div className={styles.batterybox}>
           <p className={styles.introSubtitle}>
          <span className={styles.introSubtitleTitle}>Optional battery back-up</span>
          <br /><br />
          <span className={styles.introSubtitleText}> Get up to 4 hours of battery life per battery pack so you’re protected if the power goes out.
            </span><br />
            </p> 
          <div className={styles.introButtonContainer}>
            <a href="https://cpeportal.com/frontier/unbreakable-wi-fi-bbu/c-444.html" className={styles.introButton} target="_blank">Order now</a>
            </div><p></p></div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
