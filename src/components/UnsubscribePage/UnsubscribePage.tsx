/**
 * @file components/UnsubscribePage/UnsubscribePage.tsx
 * @description Page component for the email unsubscribe landing page.
 * Collects the user's email, POSTs to /ftr-forms/api/UnsubFormProcessing,
 * and redirects to /Unsubscribe-Confirmation on success.
 * Matches https://cloud.e.frontier.com/Unsubscribe-form.
 * Header and site footer are provided by the parent layout (PageLayout).
 *
 * Validation: React Hook Form + Zod (@hookform/resolvers/zod).
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  unsubscribeSchema,
  type UnsubscribeFormValues,
} from "@/utils/unsubscribeValidation";
import { fetchDecodedEmail, postForm } from "@/utils/fetch";
import { API_ROUTES } from "@/constants";
import styles from "./UnsubscribePage.module.css";

export function UnsubscribePage() {
  const router = useRouter();

  // Capture Adobe Campaign click-tracking parameters from the URL
  // e.g. ?EMEID=...&CUHID=...&CMP=...&BID=...
  const searchParams = useSearchParams();
  const EMEID = searchParams.get("EMEID") ?? "";
  const CUHID = searchParams.get("CUHID") ?? "";
  const CMP = searchParams.get("CMP") ?? "";
  const BID = searchParams.get("BID") ?? "";

  const [isDecodingEmail, setIsDecodingEmail] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UnsubscribeFormValues>({
    resolver: zodResolver(unsubscribeSchema),
    defaultValues: { email: "" },
  });

  // On page load: if EMEID is present, decode it and pre-fill the email field
  useEffect(() => {
    if (!EMEID) return;

    const controller = new AbortController();

    async function decodeEmail() {
      setIsDecodingEmail(true);
      try {
        const email = await fetchDecodedEmail(EMEID, CUHID, controller.signal);
        if (email) setValue("email", email, { shouldValidate: true });
      } catch {
        // AbortError is expected on unmount; silently ignore all decode failures
        // — the user can still type their email manually.
      } finally {
        setIsDecodingEmail(false);
      }
    }

    void decodeEmail();
    return () => controller.abort();
    // EMEID / CUHID come from the URL and never change after mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(data: UnsubscribeFormValues) {
    const body = new URLSearchParams({
      submissionType: "",
      EmailAddress: data.email,
      // Pass Adobe Campaign tracking params so the API can persist them
      EMEID,
      CUHID,
      CMP,
      BID,
    });

    try {
      await postForm(API_ROUTES.UNSUB_FORM, body);
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
    <section className={styles.section} aria-labelledby="unsubscribe-heading">
      <div className={styles.column}>
        <h1 id="unsubscribe-heading" className={styles.heading}>
          We&apos;re sorry to see you go
        </h1>
        <p className={styles.subtext}>
          Please enter your email address, and your request to unsubscribe will
          be processed within 72 hours.
        </p>

        <div className={styles.formWrap}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
            noValidate
          >
            <div className={styles.fieldGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address:
              </label>
              <input
                id="email"
                type="email"
                className={`${styles.input}${errors.email ? ` ${styles.inputError}` : ""}`}
                autoComplete="email"
                aria-required="true"
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isDecodingEmail}
                placeholder={isDecodingEmail ? "Looking up your email…" : ""}
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" role="alert" className={styles.fieldError}>
                  {errors.email.message}
                </p>
              )}
            </div>

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
