/**
 * @file components/UnsubscribePreferencesPage/UnsubscribePreferencesPage.tsx
 * @description Full unsubscribe preferences page.
 * Renders an email field + per-category checkboxes.
 * Matches https://cloud.e.frontier.com/UnsubscribePreferences.
 * On submit POSTs to /ftr-forms/api/Unsubscribe-Form-Processing and redirects to
 * /Unsubscribe-Confirmation on success.
 *
 * Validation: React Hook Form + Zod (@hookform/resolvers/zod).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  unsubscribePreferencesSchema,
  unsubscribePreferencesDefaultValues,
  type UnsubscribePreferencesFormValues,
} from "@/utils/unsubscribePreferencesValidation";
import { fetchDecodedEmail, postForm } from "@/utils/fetch";
import { API_ROUTES } from "@/constants";
import styles from "./UnsubscribePreferencesPage.module.css";

// ---------------------------------------------------------------------------
// Preference checkbox configuration
// ---------------------------------------------------------------------------
interface Preference {
  field: keyof Omit<UnsubscribePreferencesFormValues, "email" | "Unsubscribed">;
  label: string;
  subLabel?: string;
}

const PREFERENCES: Preference[] = [
  {
    field: "unsubscribedtoAddedProtection",
    label: "Added Protection",
    subLabel: "(ID protection, Total Shield, My Premium Tech Pro)",
  },
  { field: "unsubscribedtoHelpfulTips", label: "Helpful Tips and Info" },
  { field: "unsubscribedtoInternetUpgrades", label: "Internet Upgrades" },
  { field: "unsubscribedtoNewProducts", label: "New Products" },
  { field: "unsubscribedtoNewsletters", label: "Newsletters" },
  { field: "unsubscribedtoReferaFriend", label: "Refer-a-Friend" },
  { field: "unsubscribedtoRewards", label: "Rewards Program" },
  { field: "unsubscribedtoSpecialOffers", label: "Special Offers and Deals" },
  {
    field: "unsubscribedtoWiFiEnhancements",
    label: "Wi-Fi Enhancements",
    subLabel: "(eero, Whole-Home Wifi, etc.)",
  },
  { field: "unsubscribedtoYouTubeTV", label: "YouTube TV" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function UnsubscribePreferencesPage() {
  const router = useRouter();

  // Capture Adobe Campaign click-tracking parameters from the URL
  // e.g. ?EMEID=...&CUHID=...&CMP=...&BID=...
  const searchParams = useSearchParams();
  const EMEID = searchParams.get("EMEID") ?? "";
  const EEMID = searchParams.get("EEMID") ?? "";
  const CUHID = searchParams.get("CUHID") ?? "";
  const CMP = searchParams.get("CMP") ?? "";
  const BID = searchParams.get("BID") ?? "";

  // Track whether the email was successfully decoded from EMEID (makes it read-only)
  const [emailReadOnly, setEmailReadOnly] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UnsubscribePreferencesFormValues>({
    resolver: zodResolver(unsubscribePreferencesSchema),
    defaultValues: unsubscribePreferencesDefaultValues,
  });

  // Decode EMEID on mount and pre-populate the email field
  useEffect(() => {
    if (!EMEID) return;

    fetchDecodedEmail(EMEID, CUHID)
      .then((decoded) => {
        if (decoded) {
          setValue("email", decoded, { shouldValidate: true });
          setEmailReadOnly(true);
        }
      })
      .catch(() => {
        // Silently ignore – user can still type their email manually
      });
    // Run only once on mount; EMEID/CUHID come from the URL and never change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch all preference fields to keep "Unsubscribe from All" in sync
  const watchedPrefs = useWatch({
    control,
    name: PREFERENCES.map((p) => p.field),
  });

  // Derive the master-toggle state from watched values
  const allChecked = watchedPrefs.every(Boolean);

  function handlePreferenceChange(
    field: Preference["field"],
    checked: boolean,
  ) {
    setValue(field, checked, { shouldValidate: true });
    // Sync master toggle
    const allNowChecked = PREFERENCES.every((p) =>
      p.field === field ? checked : getValues(p.field),
    );
    setValue("Unsubscribed", allNowChecked, { shouldValidate: true });
  }

  function handleUnsubscribeAll(checked: boolean) {
    for (const pref of PREFERENCES) {
      setValue(pref.field, checked, { shouldValidate: false });
    }
    setValue("Unsubscribed", checked, { shouldValidate: true });
  }

  async function onSubmit(data: UnsubscribePreferencesFormValues) {
    const body = new URLSearchParams({
      GBLUID: "",
      EmailAddress: data.email,
      // Pass Adobe Campaign tracking params so the API can persist them
      EMEID,
      EEMID,
      CUHID,
      CMP,
      BID,
      unsubscribedtoAddedProtection: data.unsubscribedtoAddedProtection
        ? "true"
        : "false",
      unsubscribedtoHelpfulTips: data.unsubscribedtoHelpfulTips
        ? "true"
        : "false",
      unsubscribedtoInternetUpgrades: data.unsubscribedtoInternetUpgrades
        ? "true"
        : "false",
      unsubscribedtoNewProducts: data.unsubscribedtoNewProducts
        ? "true"
        : "false",
      unsubscribedtoNewsletters: data.unsubscribedtoNewsletters
        ? "true"
        : "false",
      unsubscribedtoReferaFriend: data.unsubscribedtoReferaFriend
        ? "true"
        : "false",
      unsubscribedtoRewards: data.unsubscribedtoRewards ? "true" : "false",
      unsubscribedtoSpecialOffers: data.unsubscribedtoSpecialOffers
        ? "true"
        : "false",
      unsubscribedtoWiFiEnhancements: data.unsubscribedtoWiFiEnhancements
        ? "true"
        : "false",
      unsubscribedtoYouTubeTV: data.unsubscribedtoYouTubeTV ? "true" : "false",
      Unsubscribed: data.Unsubscribed ? "true" : "false",
    });

    try {
      await postForm(API_ROUTES.UNSUB_PREFERENCES, body);
      router.push("/Unsubscribe-Confirmation");
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
    <section
      className={styles.section}
      aria-labelledby="unsubscribe-preferences-heading"
    >
      <div className={styles.column}>
        <div className={styles.headingBlock}>
          <h1 id="unsubscribe-preferences-heading" className={styles.heading}>
            We&apos;re sorry to see you go
          </h1>
          <p className={styles.subtext}>
            We want you to be in control of the types of emails that you&apos;d
            like to receive from us. Select the types of emails you would no
            longer like to receive, and we will take care of the rest.
          </p>
        </div>

        <div className={styles.formWrap}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
            noValidate
          >
            {/* ── Email field ── */}
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address:
              </label>
              <input
                id="email"
                type="email"
                className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ""}${emailReadOnly ? ` ${styles.inputReadOnly}` : ""}`}
                autoComplete={emailReadOnly ? "off" : "email"}
                aria-required="true"
                aria-readonly={emailReadOnly}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
                readOnly={emailReadOnly}
              />
              {errors.email && (
                <p id="email-error" role="alert" className={styles.fieldError}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ── Preference checkboxes ── */}
            <div className={styles.checkboxList}>
              {PREFERENCES.map((pref) => (
                <label key={pref.field} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    {...register(pref.field)}
                    onChange={(e) =>
                      handlePreferenceChange(pref.field, e.target.checked)
                    }
                  />
                  <span className={styles.checkboxLabelText}>
                    {pref.label}
                    {pref.subLabel && (
                      <span className={styles.checkboxSubLabel}>
                        {pref.subLabel}
                      </span>
                    )}
                  </span>
                </label>
              ))}

              {/* Unsubscribe from All — master toggle */}
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={allChecked}
                  onChange={(e) => handleUnsubscribeAll(e.target.checked)}
                  aria-label="Unsubscribe from all email categories"
                />
                <span className={styles.checkboxLabelText}>
                  Unsubscribe from All
                </span>
              </label>
            </div>

            {/* Preference-level validation error (at least one required) */}
            {errors.Unsubscribed && (
              <p role="alert" className={styles.fieldError}>
                {errors.Unsubscribed.message}
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
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? "Processing…" : "UNSUBSCRIBE"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
