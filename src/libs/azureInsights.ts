/**
 * @file libs/azureInsights.ts
 * @description Azure Application Insights client.
 * Starts only when APPLICATIONINSIGHTS_CONNECTION_STRING is set.
 */

import type { TelemetryClient } from "applicationinsights";
import logger from "@/logger";

let clientPromise: Promise<TelemetryClient | null> | null = null;

async function startClient(): Promise<TelemetryClient | null> {
  if (process.env.NODE_ENV === "test") return null;

  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) return null;

  try {
    const appInsights = await import("applicationinsights");
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(false)
      .setAutoCollectConsole(false, false)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectPerformance(true, false)
      .setSendLiveMetrics(false)
      .setInternalLogging(false, true)
      .start();

    logger.info("Azure Application Insights started");
    return appInsights.defaultClient;
  } catch (error) {
    logger.error("Azure Application Insights failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** Returns the shared client, or null when Azure logging is not configured. */
export function getAzureInsightsClient(): Promise<TelemetryClient | null> {
  if (!clientPromise) {
    clientPromise = startClient();
  }
  return clientPromise;
}
