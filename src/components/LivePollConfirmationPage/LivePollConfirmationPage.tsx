import React from "react";
import styles from "./LivePollConfirmationPage.module.css";

export function LivePollConfirmationPage() {
  return (
    <div>
      <section
        className={styles.confirmationBanner}
        aria-labelledby="confirmation-heading"
      >
        <div className={styles.confirmationContent}>
          <h1 id="confirmation-heading" className={styles.confirmationHeading}>
            Thank you for your vote!
          </h1>
          <section
            className={styles.rewardsFeature}
            aria-labelledby="rewards-heading"
          >
            <div className={styles.rewardsVisual}>
              <h2 id="rewards-heading" className={styles.rewardsVisualHeading}>
                <span>For</span> Me
                <br />
                Rewards
              </h2>
            </div>
            <div className={styles.rewardsCopy}>
              <div className={styles.rewardsTextContain}>
                <p className={styles.rewardsParagraph}>
                  Don&apos;t miss out on special rewards, offers and discounts
                  just for Frontier customers!
                </p>
                <p className={styles.rewardsParagraph}>
                  There&apos;s always something new happening in ForMe Rewards.
                  Stop by to browse the latest limited-time deals and see
                  what&apos;s waiting for you.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
      <section className={styles.stripes} aria-hidden="true">
        <div className={styles.stripe} />
        <div className={styles.stripe} />
        <div className={styles.stripe} />
      </section>
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaHeading}>
            Open or download the MyFrontier app now!
          </h2>
          <a
            href="https://frontier.com/resources/myfrontier-mobile-app"
            className={styles.ctaButton}
          >
            View Rewards
          </a>
        </div>
      </section>
    </div>
  );
}
