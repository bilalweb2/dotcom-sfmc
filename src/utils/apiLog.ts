/**
 * @file utils/apiLog.ts
 * @description Logs each API call's request and response to the console, MongoDB,
 *              Azure, and New Relic.
 */

import logger from "@/logger";
import { getAzureInsightsClient } from "@/libs/azureInsights";
import { connectMongoose } from "@/libs/mongoose";
import { getNewRelicAgent } from "@/libs/newRelic";
import { AuditLogModel } from "@/models/AuditLog";

const MAX_BODY_CHARS = 8_000;

const SENSITIVE_KEY =
  /password|secret|token|authorization|api[_-]?key|credential|connectionstring/i;

export interface ApiExchangeLog {
  method: string;
  path: string;
  query: string;
  status: number;
  durationMs: number;
  requestBody: string;
  responseBody: string;
  requestId: string;
}

function truncate(value: string): string {
  if (value.length <= MAX_BODY_CHARS) return value;
  return `${value.slice(0, MAX_BODY_CHARS)}…`;
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    const safe: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      safe[key] = SENSITIVE_KEY.test(key) ? "[REDACTED]" : redactValue(nested);
    }
    return safe;
  }
  return value;
}

/** Redacts secrets in a JSON or form body before it is written to logs. */
export function sanitizeBody(raw: string): string {
  if (!raw) return "";

  try {
    return truncate(JSON.stringify(redactValue(JSON.parse(raw))));
  } catch {
    // Form posts are application/x-www-form-urlencoded.
  }

  if (raw.includes("=")) {
    const params = new URLSearchParams(raw);
    for (const key of params.keys()) {
      if (SENSITIVE_KEY.test(key)) params.set(key, "[REDACTED]");
    }
    return truncate(params.toString());
  }

  return truncate(raw);
}
/**
 * Records one API call. Console logging always runs.
 * Azure and New Relic receive the same record when each is configured.
 */
export async function logApiExchange(
  entry: ApiExchangeLog,
  options: { skipMongoDB?: boolean } = {},
): Promise<void> {
  const requestBody = sanitizeBody(String(entry.requestBody));
  const responseBody = sanitizeBody(String(entry.responseBody));
  const record = {
    method: entry.method,
    path: entry.path,
    query: entry.query,
    status: entry.status,
    durationMs: entry.durationMs,
    requestId: entry.requestId,
    request: requestBody,
    response: responseBody,
  };

  logger.info("API call", record);
  if (!options.skipMongoDB) {
    await sendToMongoDB(entry, requestBody, responseBody);
  }
  await sendToAzure(entry, requestBody, responseBody);
  await sendToNewRelic(record);
}

//change mongoDB data to json

function toAuditJson(value: string): Record<string, unknown> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return { value: parsed };
  } catch {
    // Handle form-urlencoded data or plain text.
    if (value.includes("=")) {
      const params = new URLSearchParams(value);
      const result: Record<string, unknown> = {};

      for (const [key, val] of params.entries()) {
        result[key] = val;
      }

      return result;
    }

    return { value };
  }
}

async function sendToMongoDB(
  entry: ApiExchangeLog,
  requestBody: string,
  responseBody: string,
): Promise<void> {
  try {
    await connectMongoose();
    await AuditLogModel.create({
      method: entry.method,
      path: entry.path,
      query: entry.query,
      status: entry.status,
      durationMs: entry.durationMs,
      requestId: entry.requestId,
      request: toAuditJson(requestBody),
      response: toAuditJson(responseBody),
    });
  } catch (error) {
    logger.error("Failed to persist API audit log to MongoDB", {
      path: entry.path,
      requestId: entry.requestId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function sendToAzure(
  entry: ApiExchangeLog,
  requestBody: string,
  responseBody: string,
): Promise<void> {
  try {
    const client = await getAzureInsightsClient();
    if (!client) return;

    const properties = {
      method: entry.method,
      path: entry.path,
      query: entry.query,
      status: String(entry.status),
      durationMs: String(entry.durationMs),
      requestId: entry.requestId,
      request: requestBody,
      response: responseBody,
    };

    client.trackRequest({
      name: `${entry.method} ${entry.path}`,
      url: `${entry.path}${entry.query}`,
      duration: entry.durationMs,
      resultCode: String(entry.status),
      success: entry.status < 400,
      properties,
    });
    client.trackTrace({
      message: `API ${entry.method} ${entry.path} ${entry.status}`,
      properties,
    });
  } catch (error) {
    logger.error("Failed to send API log to Azure", {
      path: entry.path,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function sendToNewRelic(record: {
  method: string;
  path: string;
  query: string;
  status: number;
  durationMs: number;
  requestId: string;
  request: string;
  response: string;
}): Promise<void> {
  try {
    const agent = await getNewRelicAgent();
    if (!agent) return;

    const level =
      record.status >= 500 ? "error" : record.status >= 400 ? "warn" : "info";
    agent.recordLogEvent({
      message: `API ${record.method} ${record.path} ${record.status}`,
      level,
      timestamp: Date.now(),
      method: record.method,
      path: record.path,
      query: record.query,
      status: record.status,
      durationMs: record.durationMs,
      requestId: record.requestId,
      request: record.request,
      response: record.response,
    });
  } catch (error) {
    logger.error("Failed to send API log to New Relic", {
      path: record.path,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
