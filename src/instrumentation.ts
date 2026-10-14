/**
 * @file instrumentation.ts
 * @description Starts Azure Application Insights and New Relic when the Node.js server boots.
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getNewRelicAgent } = await import("@/libs/newRelic");
    const { getAzureInsightsClient } = await import("@/libs/azureInsights");
    await getNewRelicAgent();
    await getAzureInsightsClient();
  }
}
