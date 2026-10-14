/**
 * @file app/ftr-forms/api/Unsubscribe-Form-Processing/route.ts
 * @description Email unsubscribe preferences form submission handler.
 *
 * Called by: `/UnsubscribePreferences` page (UnsubscribePreferencesPage component).
 *
 * Accepts a URL-encoded payload with email address and per-category
 * unsubscribe flags (all flags typically set to 1 from the preferences UI).
 * Uses upsert pattern: if email already exists in MongoDB `unsubscribe` collection,
 * updates the record with new preferences; otherwise creates a new record.
 * Returns `{ status: "OK", result: "1" }` on success.
 *
 * @openapi
 * /ftr-forms/api/Unsubscribe-Form-Processing:
 *   post:
 *     summary: Submit email unsubscribe preferences
 *     description: >
 *       Accepts a URL-encoded unsubscribe preferences payload and persists
 *       it to the `unsubscribe` collection in MongoDB.
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
 *                 example: 1
 *               unsubscribedtoInternetUpgrades:
 *                 type: integer
 *                 example: 1
 *               unsubscribedtoNewProducts:
 *                 type: integer
 *                 example: 1
 *               subscribedtoNewsletters:
 *                 type: integer
 *                 example: 1
 *               unsubscribedtoReferaFriend:
 *                 type: integer
 *                 example: 1
 *               unsubscribedtoRewards:
 *                 type: integer
 *                 example: 1
 *               unsubscribedtoSpecialOffers:
 *                 type: integer
 *                 example: 1
 *               unsubscribedtoWiFiEnhancements:
 *                 type: integer
 *                 example: 1
 *               unsubscribedtoYouTubeTV:
 *                 type: integer
 *                 example: 1
 *               Unsubscribed:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Unsubscribe preferences recorded successfully
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
 *      503:
 *         description: MongoDB is temporarily unavailable
 */

import { NextResponse, type NextRequest } from "next/server";
import { connectMongoose } from "@/libs/mongoose";
import { UnsubscribeModel } from "@/models/Unsubscribe";
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
// POST /ftr-forms/api/Unsubscribe-Form-Processing
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

  // Persist to MongoDB — collection: unsubscribe
  // Upsert pattern: if email exists, update preferences; if not, create new record
  await connectMongoose();

  // Extract Adobe Campaign click-tracking parameters (passed via form body)
  const campaignParams = {
    EMEID: sanitiseString(params.get("EMEID"), 500),
    EEMID: sanitiseString(params.get("EEMID"), 500),
    CUHID: sanitiseString(params.get("CUHID"), 500),
    CMP: sanitiseString(params.get("CMP"), 200),
    BID: sanitiseString(params.get("BID"), 100),
  };

  // Upsert pattern: check if email exists, update if yes, create if no
  const result = await UnsubscribeModel.findOneAndUpdate(
    { EmailAddress: emailAddress },
    {
      GBLUID: sanitiseString(params.get("GBLUID"), 100),
      EmailAddress: emailAddress,
      unsubscribedtoAddedProtection: params.get(
        "unsubscribedtoAddedProtection",
      ),
      unsubscribedtoHelpfulTips: params.get("unsubscribedtoHelpfulTips"),
      unsubscribedtoInternetUpgrades: params.get(
        "unsubscribedtoInternetUpgrades",
      ),
      unsubscribedtoNewProducts: params.get("unsubscribedtoNewProducts"),
      unsubscribedtoNewsletters: params.get("unsubscribedtoNewsletters"),
      unsubscribedtoReferaFriend: params.get("unsubscribedtoReferaFriend"),
      unsubscribedtoRewards: params.get("unsubscribedtoRewards"),
      unsubscribedtoSpecialOffers: params.get("unsubscribedtoSpecialOffers"),
      unsubscribedtoWiFiEnhancements: params.get(
        "unsubscribedtoWiFiEnhancements",
      ),
      unsubscribedtoYouTubeTV: params.get("unsubscribedtoYouTubeTV"),
      Unsubscribed: params.get("Unsubscribed"),
      ...campaignParams,
    },
    { upsert: true, returnDocument: "after" },
  );

  // Log with masked PII — never log raw email
  const isNewRecord = !result.__v || result.__v === 0; // __v is versioning field, 0 means new record
  logger.info(
    isNewRecord
      ? "New unsubscribe preferences created"
      : "Existing unsubscribe preferences updated",
    {
      email: maskEmail(emailAddress),
      hasCampaignParams: !!(campaignParams.EMEID || campaignParams.CMP),
    },
  );

  return NextResponse.json({ status: "OK", result: "1" }, { status: 200 });
});
