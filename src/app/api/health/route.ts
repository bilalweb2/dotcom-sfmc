/**
 * @file app/ftr-forms/api/health/route.ts
 * @description Health-check endpoint. No auth required (public route).
 *
 * Returns application name, version, environment, uptime, and current timestamp.
 * Used by load balancers and monitoring tools to verify the service is running.
 *
 * @openapi
 * /ftr-forms/api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the current status of the application and its dependencies.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Application is unhealthy
 */

import { NextResponse } from "next/server";
import { APP_NAME, APP_VERSION } from "@/constants";
import { connectMongoose } from "@/libs/mongoose";
import { withErrorHandler } from "@/utils/withErrorHandler";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async () => {
  await connectMongoose();

  return NextResponse.json({
    status: "ok",
    app: APP_NAME,
    version: APP_VERSION,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    // Do NOT expose NODE_ENV or other internal config to public callers
  });
});
