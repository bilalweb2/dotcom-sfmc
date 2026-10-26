/**
 * @file components/UBBPage/UBBPage.tsx
 * @description Page component for the Whole-Home Wi-Fi upgrade landing page.
 * Renders the hero, offer section, and legal footer.
 * Header and site footer are provided by the parent layout (PageLayout).
 * On submit the form data is POST-ed to /ftr-forms/api/unbreakable-wifi-confirmation and, on success,
 * the user is redirected to the Unbreakable Wi-Fi confirmation page.
 *
 * Validation: React Hook Form + Zod (@hookform/resolvers/zod).
 */

"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import { UbbSchema, type UBBFormValues } from "@/utils/ubbValidation";
import { API_ROUTES } from "@/constants";
import styles from "./UBBv2Page.module.css";

const FEATURES = [
  "Automatically switches your internet connection so you stay connected.",
  "Easy set-up with step-by-step installation kit",
];
const FEATURES2 = [
  "Up to two eero devices that connect to your current router to extend your Wi-Fi signal – each supports 75+ devices",
  "An installation kit is sent right to your doorstep so you can get set up in minutes.",
];

const STATIC_PAYLOAD = {
  FirstName: "",
  LastName: "",
  EmailAddress: "",
  Address: "",
  City: "",
  State: "",
  PostalCode: "",
  GBLUID: "",
  BTN: "",
  PageName: "",
  Offer: "",
  ConfirmationCheckBox: false,
};

interface UBBv2PageProps {
  /** The page name to be sent in the form submission payload */
  pageName: string;
  Offer: string;
}

export function UBBv2Page({ pageName, Offer }: UBBv2PageProps) {
  const router = useRouter();

  // Capture Adobe Campaign click-tracking parameters from the URL
  // e.g. ?EMEID=...&CUHID=...&CMP=...&BID=...
  const searchParams = useSearchParams();
  const EMEID = searchParams.get("EMEID") ?? "";
  const CUHID = searchParams.get("CUHID") ?? "";
  const CMP = searchParams.get("CMP") ?? "";
  const BID = searchParams.get("BID") ?? "";

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UBBFormValues>({
    resolver: zodResolver(UbbSchema),
    defaultValues: { consented: undefined },
  });

  useEffect(() => {
    STATIC_PAYLOAD.PageName = pageName;
    STATIC_PAYLOAD.Offer = Offer;
  }, [pageName, Offer]);

  const consented = useWatch({ control, name: "consented" });

  useEffect(() => {
    if (consented) {
      STATIC_PAYLOAD.ConfirmationCheckBox = true;
    } else {
      STATIC_PAYLOAD.ConfirmationCheckBox = false;
    }
  }, [consented]);

  const canSubmit = consented === true && !isSubmitting;

  async function onSubmit(_data: UBBFormValues) {
    try {
      const res = await fetch(API_ROUTES.UBB_PROCESSING, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Merge static payload with Adobe Campaign tracking params
        body: JSON.stringify({ ...STATIC_PAYLOAD, EMEID, CUHID, CMP, BID }),
      });

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error ?? "Submission failed");
      }

      const data = (await res.json()) as { status: string; result: string };

      if (data.status === "OK" && data.result === "1") {
        router.push("/unbreakable-wifi-confirmation");
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className={styles.root}>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroContainer}>
            <div className={styles.titleWrapper}>
              <h1 id="hero-heading" className={styles.heroHeading}>
                <span className={styles.heroLineAccent}>UPGRADE</span>
                <span className={styles.heroLine}>YOUR WI-FI</span>
              </h1>
            </div>
          </div>
        </div>
        <div className={styles.heroImg}>
          <Image
            src={`/ftr-forms/images/UBBv2_hero.webp`}
            alt=""
            width={750}
            height={313}
            priority
            className={styles.heroPhoto}
          />
        </div>
      </section>

      {/* ── Offer section ────────────────────────────────────────── */}
      <section className={styles.offer} aria-label="Offer details">
        <div className={styles.offerInner}>
          <h3 className={styles.offerHeading}>
            Stay connected during internet outages and extend the Wi-Fi coverage
            throughout your home for only $35/mo.
            <span className={styles.offerSpacing} aria-hidden="true" />
          </h3>

          <p className={`${styles.featureTitle} ${styles.featureTitleFirst}`}>
            Unbreakable<sup className={styles.offerSub}>™</sup> Wi-Fi:
          </p>
          <div className={styles.featureBlock}>
            <ul className={styles.featureList}>
              {FEATURES.map((feature) => (
                <li key={feature} className={styles.featureItem}>
                  <Image
                    src={`/ftr-forms/images/checkmark.png`}
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={20}
                    className={styles.checkIcon}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className={styles.featureTitle}>Whole-Home Wi-Fi:</p>
            <ul className={styles.featureList}>
              {FEATURES2.map((feature) => (
                <li key={feature} className={styles.featureItem}>
                  <Image
                    src={`/ftr-forms/images/checkmark.png`}
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={20}
                    className={styles.checkIcon}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Upgrade form ─────────────────────────────────────── */}
          <div className={styles.consentForm}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Consent checkbox */}
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  className={`${styles.consentCheckbox}${errors.consented ? ` ${styles.consentCheckboxError}` : ""}`}
                  aria-label="I agree to the terms and conditions"
                  aria-describedby={
                    errors.consented ? "consent-error" : undefined
                  }
                  {...register("consented")}
                />
                <span className={styles.consentText}>
                  By checking this box, I&apos;m confirming that I&apos;m at
                  least 18 years old. I&apos;ve read the Privacy Policy and
                  agree to the Terms of Service. I understand and agree that,
                  upon activation of service, I&apos;ll be billed monthly for
                  applicable services described in this order, plus for any
                  applicable state and local taxes and fees. I also understand
                  the monthly charge for the eero device(s) is in addition to
                  the monthly charge, if any, that I&apos;m paying for use of
                  other routers or devices.
                  <span>
                    <br />
                    <br />
                  </span>
                  Frontier Fiber Internet subscription with eero router
                  required. 4G LTE cellular backup internet provided by third
                  party carrier. Coverage, uptime and speeds vary. Restrictions
                  on use apply. Requires battery backup during power outages,
                  sold separately. Unbreakable Wi-Fi is powered by a Ring Alarm
                  Pro device with Ring home security functionality disabled.
                  Visit frontier.com/unbreakablewifi for additional product
                  details. Requires agreement to Frontier’s Backup Wi-Fi
                  Additional Terms, found at frontier.com/unbreakableterms.
                </span>
              </label>

              {/* Consent validation error */}
              {errors.consented && (
                <p
                  id="consent-error"
                  role="alert"
                  className={styles.fieldError}
                >
                  {errors.consented.message}
                </p>
              )}

              {/* API / root error */}
              {errors.root && (
                <p role="alert" className={styles.errorMessage}>
                  {errors.root.message}
                </p>
              )}

              <button
                type="submit"
                className={styles.ctaButton}
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
              >
                {isSubmitting ? "Submitting…" : "Place my order"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Legal Footer ─────────────────────────────────────────── */}
      <footer className={styles.legalFooter}>
        <div className={styles.footerPad}>
          <p className={styles.legalText}>
            *Cellular data is provided by a third-party carrier, may only be
            used during an internet outage at the customer service address, and
            usage is capped at 130 GB per billing cycle. Cellular coverage,
            uptime and actual and average speeds will vary; maximum cellular
            speeds to device 50/5 Mbps. Not suitable for emergency/911, medical
            and certain other uses. Up to $250 unreturned equipment fee applies.
            Requires battery backup for power outages, sold separately. Visit{" "}
            <a
              href="www.frontier.com/unbreakableterms"
              title="www.frontier.com/unbreakableterms"
            >
              frontier.com/unbreakableterms
            </a>{" "}
            for additional product details and return policy. Frontier Fiber
            Internet subscription with eero router required. Requires agreement
            to Frontier’s Backup Wi-Fi Additional Terms, found at{" "}
            <a
              href="www.frontier.com/unbreakableterms"
              title="www.frontier.com/unbreakableterms"
            >
              frontier.com/unbreakableterms
            </a>
            {"."}
            <br />
            <br />
            For current residential internet customers only. Price includes two
            (one for 5 Gig) Wi-Fi devices. Model based on existing router and
            internet service type. Coverage range and performance vary based on
            model, use and building conditions. Additional devices available for
            lease. Equipment non-return and restocking fees apply. For more
            details Visit{" "}
            <a
              href="https://cloud.e.frontier.com/www.frontier.com/whwf"
              title="https://cloud.e.frontier.com/www.frontier.com/whwf"
            >
              www.frontier.com/whwf
            </a>
            . eero max speeds are derived from IEEE specifications. Coverage
            varies based on normal use and building conditions. Actual range and
            performance can vary. See
            <a href="https://eero.com/legal" title="https://eero.com/legal">
              https://eero.com/legal
            </a>{" "}
            for more details.
            <br />
            <br />© 2026 Verizon. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
