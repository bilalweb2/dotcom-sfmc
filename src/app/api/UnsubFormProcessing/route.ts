/**
 * @file app/ftr-forms/api/UnsubFormProcessing/route.ts
 * @description Email unsubscribe form submission handler.
 *
 * Called by: `/Unsubscribe-form` page (UnsubscribePage component).
 *
 * Accepts a URL-encoded or JSON payload containing EmailAddress and optional
 * per-category preference flags. Uses upsert pattern: if email already exists
 * in MongoDB `unsubscribe` collection, updates the record with new preferences;
 * otherwise creates a new record. Preference fields default to 0 when omitted.
 * Returns `{ status: "OK", result: "1" }` on success.
 *
 * @openapi
 * /ftr-forms/api/UnsubFormProcessing:
 *   post:
 *     summary: Submit email unsubscribe request (with or without preferences)
 *     description: >
 *       Accepts an email unsubscribe request via URL-encoded or JSON body.
 *       Saves all fields present in the payload to the `unsubscribe` collection.
 *       Preference fields default to 0 when omitted.
 *       Returns `{ status: "OK", result: "1" }` on success.
 *     tags: [Unsubscribe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required: [EmailAddress]
 *             properties:
 *               submissionType:
 *                 type: string
 *                 example: ""
 *               GBLUID:
 *                 type: string
 *                 example: ""
 *               SubscriberId:
 *                 type: integer
 *                 example: 0
 *               JobId:
 *                 type: integer
 *                 example: 0
 *               ListId:
 *                 type: integer
 *                 example: 0
 *               BatchId:
 *                 type: integer
 *                 example: 0
 *               EmailAddress:
 *                 type: string
 *                 format: email
 *                 example: "test@test.co"
 *               unsubscribedtoAddedProtection:
 *                 type: integer
 *                 example: 1
 *               unsubscribedtoHelpfulTips:
 *                 type: integer
 *                 example: 0
 *               unsubscribedtoInternetUpgrades:
 *                 type: integer
 *                 example: 0
 *               unsubscribedtoNewProducts:
 *                 type: integer
 *                 example: 0
 *               subscribedtoNewsletters:
 *                 type: integer
 *                 example: 0
 *               unsubscribedtoReferaFriend:
 *                 type: integer
 *                 example: 0
 *               unsubscribedtoRewards:
 *                 type: integer
 *                 example: 0
 *               unsubscribedtoSpecialOffers:
 *                 type: integer
 *                 example: 0
 *               unsubscribedtoWiFiEnhancements:
 *                 type: integer
 *                 example: 0
 *               unsubscribedtoYouTubeTV:
 *                 type: integer
 *                 example: 1
 *               Unsubscribed:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Unsubscribe request recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 result:
 *                   type: string
 *                   example: "1"
 *       400:
 *         description: Validation error — EmailAddress is missing
 *       500:
 *         description: Internal server error
 *       503:
 *         description: MongoDB is temporarily unavailable
 */

import { NextResponse, type NextRequest } from "next/server";
import { connectMongoose } from "@/libs/mongoose";
import { UnsubscribeFormModel } from "@/models/UnsubscribeForm";
import { withErrorHandler } from "@/utils/withErrorHandler";
import {
  isValidEmail,
  sanitiseEmail,
  sanitiseString,
  isWithinSizeLimit,
} from "@/utils/validation";
import { maskEmail } from "@/logger";
import logger from "@/logger";

// Max request body: 32 KB
const MAX_BODY_BYTES = 32 * 1024;

// ---------------------------------------------------------------------------
// POST /ftr-forms/api/UnsubFormProcessing
// ---------------------------------------------------------------------------
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Body size guard
  if (!isWithinSizeLimit(request, MAX_BODY_BYTES)) {
    return NextResponse.json(
      { error: "Payload too large", timestamp: new Date().toISOString() },
      { status: 413 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  let params: URLSearchParams;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    params = new URLSearchParams(text);
  } else {
    // Fall back to JSON — convert object to URLSearchParams
    const body = (await request.json()) as Record<string, unknown>;
    params = new URLSearchParams();
    for (const [key, val] of Object.entries(body)) {
      params.set(key, String(val));
    }
  }

  const rawEmail = params.get("EmailAddress");

  // Validate presence
  if (!rawEmail?.trim()) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: ["EmailAddress is required"],
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  // Validate format
  if (!isValidEmail(rawEmail)) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: ["EmailAddress must be a valid email address"],
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  const emailAddress = sanitiseEmail(rawEmail);

  // Persist to MongoDB — collection: unsubscribeform
  // Creates a new record with submitted form data.
  // All preference fields default to 0 when absent from the payload.
  await connectMongoose();

  // Extract Adobe Campaign click-tracking parameters (passed via form body)
  const campaignParams = {
    EMEID: sanitiseString(params.get("EMEID"), 500),
    CUHID: sanitiseString(params.get("CUHID"), 500),
    CMP: sanitiseString(params.get("CMP"), 200),
    BID: sanitiseString(params.get("BID"), 100),
  };

  await UnsubscribeFormModel.findOneAndUpdate(
    { EmailAddress: emailAddress },
    {
      EmailAddress: emailAddress,
      SubmitDate: new Date().toISOString(),
      ...campaignParams,
    },
    { upsert: true, returnDocument: "after" },
  );

  // Log with masked PII — never log raw email
  logger.info("Unsubscribe request persisted", {
    email: maskEmail(emailAddress),
    submissionType: sanitiseString(params.get("submissionType"), 100),
    hasPreferences: params.has("unsubscribedtoAddedProtection"),
    hasCampaignParams: !!(campaignParams.EMEID || campaignParams.CMP),
  });

  return NextResponse.json({ status: "OK", result: "1" }, { status: 200 });
});
