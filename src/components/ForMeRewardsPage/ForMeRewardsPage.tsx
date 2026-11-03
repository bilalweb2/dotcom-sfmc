/**
 * @file components/ForMeRewardsPage/ForMeRewardsPage.tsx
 * @description Page component for the ForMeRewards page.
 * Renders the hero, halfBlock section, and legal footer.
 * Header and site footer are provided by the parent layout (PageLayout).
 * On submit the form data is POST-ed to /ftr-forms/api/WHWF_Processing and, on success,
 * the user is redirected to the WHWF confirmation page.
 *
 * Validation: React Hook Form + Zod (@hookform/resolvers/zod).
 */

"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import { whwfSchema, type WHWFFormValues } from "@/utils/whwfValidation";
import { readCampaignParams } from "@/utils/campaignParams";
import { API_ROUTES, GENERIC_USER_ERROR_MESSAGE } from "@/constants";
import styles from "./ForMeRewardsPage.module.css";

const PAGE_NAME = "ForMeRewards";

const FEATURES = [
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
  BTN: "",
  PageName: PAGE_NAME,
  Offer: "$0 for 1 month and then $10/mo.",
  ConfirmationCheckBox: false,
};

export function ForMeRewardsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const campaignParams = readCampaignParams(searchParams);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WHWFFormValues>({
    resolver: zodResolver(whwfSchema),
    defaultValues: { consented: undefined },
  });

  const consented = useWatch({ control, name: "consented" });

  useEffect(() => {
    if (consented) {
      STATIC_PAYLOAD.ConfirmationCheckBox = true;
    } else {
      STATIC_PAYLOAD.ConfirmationCheckBox = false;
    }
  }, [consented]);

  const canSubmit = consented === true && !isSubmitting;

  async function onSubmit(_data: WHWFFormValues) {
    try {
      const res = await fetch(API_ROUTES.WHWF_PROCESSING, {
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
        router.push("/WHWF-Confirmation");
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
              <h1
                id="hero-heading"
                className={`${styles.heroTitle} ${styles.tertiaryTextColor}`}
              >
                <p className={styles.heroTitleLine} id="hero-title-1">
                  For<span className={styles.secondaryTextColor}>Me</span>
                </p>
                <p className={styles.heroTitleLine} id="hero-title-3">
                  Rewards
                </p>
              </h1>
            </div>
          </div>
        </div>
        <div className={styles.heroImg}>
          <Image
            src={`/ftr-forms/images/formerew2.jpg`}
            alt=""
            width={1440}
            height={500}
            priority
            className={styles.heroPhoto}
          />
        </div>
      </section>

      {/* ── Offer section ────────────────────────────────────────── */}
      <section className={styles.halfBlock} aria-label="Offer details">
        <div
          className={`${styles.halfBlockContainer} ${styles.halfBlocks}`}
        >
        <div className={styles.offerInner}>
          <h2 className={styles.offerHeading}>
            Start Saving with Frontier ForMe Rewards
          </h2>
        </div>

          <div className={styles.halfBlockIntro} id="half-block-intro">
            <p className={`${styles.introText} ${styles.p1}`}>
              Now you can get exclusive weekly rewards, discounts, and offers
              from your favorite brands just for being a Frontier customer.
              <br />
              Frontier ForMe Rewards is available now only on our MyFrontier App.
              Simply open your app, click on the "ForMe Rewards"
              section, and start picking out your rewards today!
            </p>
            &nbsp;
            <div className={styles.learnMoreWrapper}>
              <a
                href="https://frontier.com/resources/forme-rewards"
                className={styles.learnMoreButton}
              >
                LEARN MORE
              </a>
            </div>
          </div>

          <div className={styles.imageBlockFlex}>
            <div className={styles.textBox}>
              <div id="half-subtitle">
                <h3 className={styles.imageBlockTitle}>
                  What is Frontier ForMe Rewards?
                </h3>
              </div>
              <div id="half-block-text">
                <p className={styles.p1}>
                  ForMe Rewards is focused on the most important part of our
                  business- you. We put our customers at the heart of everything
                  we do, and we&apos;re always looking for ways to bring you
                  more excitement, happiness, and satisfaction.
                </p>
                &nbsp;
                <p className={styles.p1}>
                  Every week we&apos;ll send you the latest deals and discounts
                  that match your interests. So, whether you want something for
                  your everyday life or something for that special occasion-
                  we&apos;ve got rewards personalized for you!
                </p>
              </div>
            </div>
            <div className={styles.imageBox}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                className={styles.imgstyle}
                alt=""
                src={`/ftr-forms/images/formerewards.png`}
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
