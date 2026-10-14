/**
 * @file libs/newRelic.ts
 * @description New Relic agent. Starts only when NEW_RELIC_LICENSE_KEY is set.
 * Each API call is forwarded with recordLogEvent, including request and response.
 */

import logger from "@/logger";

interface NewRelicApi {
  recordLogEvent: (event: Record<string, string | number>) => void;
}

let agentPromise: Promise<NewRelicApi | null> | null = null;

function isConfigured(): boolean {
  return (
    process.env.NODE_ENV !== "test" &&
    Boolean(process.env.NEW_RELIC_LICENSE_KEY)
  );
}

/** Env is read the first time the agent module loads, so set it before import. */
function applyAgentEnv(): void {
  process.env.NEW_RELIC_NO_CONFIG_FILE ??= "true";
  process.env.NEW_RELIC_APP_NAME ??= "dotcom-sfmc";
  process.env.NEW_RELIC_APPLICATION_LOGGING_ENABLED ??= "true";
  process.env.NEW_RELIC_APPLICATION_LOGGING_FORWARDING_ENABLED ??= "true";
  process.env.NEW_RELIC_DISTRIBUTED_TRACING_ENABLED ??= "true";
}

function asAgent(imported: unknown): NewRelicApi | null {
  if (!imported || typeof imported !== "object") return null;
  const record = imported as { default?: unknown; recordLogEvent?: unknown };
  const candidate = (record.default ?? imported) as {
    recordLogEvent?: unknown;
  };
  if (typeof candidate.recordLogEvent === "function") {
    return candidate as NewRelicApi;
  }
  return null;
}

async function startAgent(): Promise<NewRelicApi | null> {
  if (!isConfigured()) return null;

  applyAgentEnv();

  try {
    const imported: unknown = await import("newrelic");
    const agent = asAgent(imported);
    if (!agent) {
      logger.error("New Relic agent loaded without recordLogEvent");
      return null;
    }
    logger.info("New Relic agent started", {
      app: process.env.NEW_RELIC_APP_NAME,
    });
    return agent;
  } catch (error) {
    logger.error("New Relic agent failed to start", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** Returns the shared agent, or null when New Relic is not configured. */
export function getNewRelicAgent(): Promise<NewRelicApi | null> {
  if (!agentPromise) {
    agentPromise = startAgent();
  }
  return agentPromise;
}
