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
import { readCampaignParams } from "@/utils/campaignParams";
import { API_ROUTES, GENERIC_USER_ERROR_MESSAGE } from "@/constants";
import styles from "./UBBPage.module.css";

const FEATURES = [
  "Easy Set-up with step-by-step instructions",
  "Automatically switches your internet connection so you stay connected.",
];

const STATIC_PAYLOAD = {
  FirstName: "",
  LastName: "",
  EmailAddress: "",
  Address: "",
  City: "",
  State: "",
  PostalCode: "",
  BTN: "",
  PageName: "",
  Offer: "",
  ConfirmationCheckBox: false,
};

interface UBBPageProps {
  /** The page name to be sent in the form submission payload */
  pageName: string;
  Offer: string;
  showPrice?: boolean;
  offerPrice?: boolean;
}

export function UBBPage({
  pageName,
  Offer,
  showPrice,
  offerPrice,
}: UBBPageProps) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const campaignParams = readCampaignParams(searchParams);

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
        body: JSON.stringify({ ...STATIC_PAYLOAD, ...campaignParams }),
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
    } catch {
      setError("root", { message: GENERIC_USER_ERROR_MESSAGE });
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
                <span className={styles.heroLineAccent}>
                  Peace of mind during
                </span>
                <span className={styles.heroLine}>internet outages</span>
              </h1>
            </div>
          </div>
        </div>
        <div className={styles.heroImg}>
          <Image
            src={`/ftr-forms/images/hero-wifi.png`}
            alt=""
            width={332}
            height={400}
            priority
            className={styles.heroPhoto}
          />
        </div>
      </section>

      {/* ── Offer section ────────────────────────────────────────── */}
      <section className={styles.offer} aria-label="Offer details">
        <div className={styles.offerInner}>
          <div className={styles.offerContent}>
            <h3 className={styles.offerHeading}>
              Unbreakable<sup className={styles.offerSub}>™</sup> Wi-Fi
              automatically turns on to keep you connected during network
              outages.
              {showPrice ? (
                <>
                  <span> Only $25/mo.*</span>
                  <span className={styles.offerSpacing}>
                    <br />
                    <br />
                  </span>
                </>
              ) : (
                <>
                  <br />
                  <br />
                </>
              )}
            </h3>
            <div>
              {offerPrice && (
                <span className={styles.featureOffer}>
                  Try it today and pay $0 for the first month, then $25/mo.
                  after*
                  <span>
                    <br /> <br />
                  </span>
                </span>
              )}

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
              </div>

              <div className={styles.questionBlock}>
                For questions,&nbsp;
                <a
                  className={styles.chatLink}
                  href="https://frontier.com/contact-us"
                  target="_blank"
                >
                  chat with us live
                </a>
              </div>
            </div>
          </div>
          {/* ── Upgrade form ─────────────────────────────────────── */}
          <div className={styles.consentForm}>
            <form
              className={showPrice ? styles.mainForm : undefined}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
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
              <br />
              <br />
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
        <div>
          <p className={styles.legalText}>
            {offerPrice && (
              <span>
                * For new and select Frontier Fiber customers. After the
                promotional period, Unbreakable Wi-Fi will be billed at the
                standard price (currently $25/mo), which is subject to change.
                Cancel anytime. No prorated refunds will be available. Frontier
                Fiber Internet subscription with eero router required.&nbsp;
                <span>
                  <br />
                  <br />
                </span>
              </span>
            )}
            Cellular data is provided by a third-party carrier, may only be used
            during an internet outage at the customer service address, and usage
            is capped at 130 GB per billing cycle. Cellular coverage, uptime and
            actual and average speeds will vary; maximum cellular speeds to
            device 50/5 Mbps. Not suitable for emergency/911, medical and
            certain other uses. Up to $250 unreturned equipment fee may apply.
            Will not work during power outage. Visit{" "}
            <a
              href="https://frontier.com/shop/internet/unbreakable"
              title="https://frontier.com/shop/internet/unbreakable"
            >
              frontier.com/unbreakablewifi
            </a>{" "}
            for additional product details.&nbsp; Frontier Fiber Internet subscription
            with eero router required. Requires agreement to Frontier’s Backup
            Wi-Fi Additional Terms, found at{" "}
            <a
              href="https://content.frontier.com/-/media/documents/corporate/terms/unbreakable-wifi.pdf"
              title="https://content.frontier.com/-/media/documents/corporate/terms/unbreakable-wifi.pdf"
            >
              frontier.com/unbreakableterms
            </a>
            {"."}
            <br />
            <br />© 2026 Verizon.{showPrice && ( " All rights reserved.")}
          </p>
          <br />
          <br />
        </div>
      </footer>
    </div>
  );
}
