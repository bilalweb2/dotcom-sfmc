/**
 * @file components/PendingDiscoPage/PendingDiscoPage.tsx
 * @description Page component for the Pending Disco upgrade landing page.
 * Renders the hero, offer section, and legal footer.
 * Header and site footer are provided by the parent layout (PageLayout).
 * On submit the form data is POST-ed to /api/disconnecting-processing and, on success,
 * the user is redirected to the pending deactivation confirmation page.
 *
 * Validation: React Hook Form + Zod (@hookform/resolvers/zod).
 */

"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  pendingDiscoSchema,
  type PendingDiscoFormValues,
} from "@/utils/pendingDisValidation";
import styles from "./PendingDisPage.module.css";
import { API_ROUTES } from "@/constants";

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
  PageName: "Save from disconnecting",
  Offer: "2/mo free 500 HSI,then $19/mo",
  ConfirmationCheckBox: false,
};

interface PendingDisPageProps {
  /** The page name to be sent in the form submission payload */
  pageName: string;
}
export function PendingDisPage({ pageName }: PendingDisPageProps) {
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
  } = useForm<PendingDiscoFormValues>({
    resolver: zodResolver(pendingDiscoSchema),
    defaultValues: { consented: undefined },
  });
  useEffect(() => {
    STATIC_PAYLOAD.PageName = pageName;
  }, [pageName]);

  const consented = useWatch({ control, name: "consented" });

  useEffect(() => {
    if (consented) {
      STATIC_PAYLOAD.ConfirmationCheckBox = true;
    } else {
      STATIC_PAYLOAD.ConfirmationCheckBox = false;
    }
  }, [consented]);

  const canSubmit = consented === true && !isSubmitting;

  async function onSubmit(_data: PendingDiscoFormValues) {
    try {
      const res = await fetch(API_ROUTES.DISCONNECTING_PROCESSING, {
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
        router.push("/pendingdeactivationsavedconfirmation");
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
                <span className={styles.heroLineAccent}>GIVE US ONE</span>
                <span className={styles.heroLine}>MORE CHANCE</span>
              </h1>
            </div>
          </div>
        </div>
        <div className={styles.heroImg}>
          <Image
            src="/ftr-forms/images/pendingDisco.jpg"
            alt=""
            width={1440}
            height={500}
            priority
            className={styles.heroPhoto}
          />
        </div>
      </section>

      {/* ── Offer section ────────────────────────────────────────── */}
      <section className={styles.offer} aria-label="Offer details">
        <div className={styles.offerInner}>
          <h2 className={styles.offerHeading}>
            Wait! Before you go...
            <br />
            <br />
          </h2>

          <div className={styles.featureBlock}>
            <p className={styles.featureList}>
              We received your recent request to disconnect on %%Disconnect
              Date%%,<br></br>
              but we’d hate to see you go. So, we’ve prepared a special offer
              just for you!
              <br />
              <br />
              <strong className={styles.strongText}>
                Stay with us, and we’ll give you 2 months of free fiber internet
                at our<br></br>
                lowest-ever price of $19.99 with autopay for 500MB of internet.
              </strong>
              <br />
              <br />
              That’s right— you’ll get our 100% fiber network, 99.9%
              reliability,
              <br />
              and ultrafast speeds — all on us for the next two. After 2 months
              of free fiber internet,
              <br />
              your plan will go to the new low price of $19.99.
              <br />
              <br />
              Just check the box below, and we’ll cancel your disconnect order
              and apply
              <br />
              this great deal to your account. It’s that easy!
            </p>
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
                {isSubmitting ? "Submitting…" : "ACCEPT OFFER NOW"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Legal Footer ─────────────────────────────────────────── */}
      <footer className={styles.legalFooter}>
        <p className={styles.legalText}>
          After the promotional period, Whole-Home Wi-Fi service will be billed
          at the current price of $10/mo., which is subject to change. Cancel
          anytime. No prorated refunds will be available. For current
          residential internet customers only. Price includes two Wi-Fi devices
          (one for 5 Gig or 7 Gig). Model based on existing router and internet
          service type. Coverage range and performance vary based on model, use
          and building conditions. Additional devices available for lease.
          Equipment non-return fees apply. For more details visit{" "}
          <a href="https://www.frontier.com/whwf" title="www.frontier.com/whwf">
            www.frontier.com/whwf
          </a>{" "}
          ©2026 Amazon.com, Inc. or its affiliates. eero and all related marks
          are trademarks of Amazon.com, Inc. or its affiliates. Amazon.com c/o
          eero LLC, 660 3rd St., San Francisco, CA.
          <br />
          <br />© 2026 Verizon
        </p>
      </footer>
    </div>
  );
}
