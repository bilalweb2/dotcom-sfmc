/**
 * @file utils/withErrorHandler.ts
 * @description Higher-order function to add consistent error handling to
 *              Next.js App Router Route Handlers.
 *
 * @example
 * import { withErrorHandler } from '@/utils/withErrorHandler';
 *
 * export const GET = withErrorHandler(async (req) => {
 *   const data = await riskyOperation();
 *   return Response.json(data);
 * });
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import logger from "@/logger";
import { logApiExchange } from "@/utils/apiLog";

type RouteHandler = (request: NextRequest) => Promise<NextResponse | Response>;

function isMongoServerSelectionTimeout(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  return (
    error.name === "MongooseServerSelectionError" ||
    error.name === "MongoServerSelectionError"
  );
}

async function readBody(
  source: { text: () => Promise<string> } | undefined,
): Promise<string> {
  if (!source) return "";
  try {
    return await source.text();
  } catch {
    return "[unreadable body]";
  }
}

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest) => {
    const started = Date.now();
    const requestId =
      request.headers.get("x-request-id") ?? crypto.randomUUID();
    const requestBody = await readBody(request.clone());

     const record = async (
      status: number,
      responseBody: string,
      options?: { skipMongoDB?: boolean },
    ) => {
      await logApiExchange(
        {
        method: request.method,
        path: request.nextUrl.pathname,
        query: request.nextUrl.search,
        status,
        durationMs: Date.now() - started,
        requestBody,
        responseBody,
        requestId,
       },
        options,
      );
    };

    try {
      const response = await handler(request);
      response.headers.set("X-Request-Id", requestId);
      await record(response.status, await readBody(response.clone()));
      return response;
    } catch (error) {
      const databaseUnavailable = isMongoServerSelectionTimeout(error);
      const status = databaseUnavailable ? 503 : 500;
      const message = error instanceof Error ? error.message : String(error);
      logger.error("Unhandled API error", {
        path: request.nextUrl.pathname,
        method: request.method,
        requestId,
        error: message,
      });

      const body = {
       error: databaseUnavailable
          ? "Database temporarily unavailable"
          : "Internal Server Error",
        timestamp: new Date().toISOString(),
      };
      await record(status, JSON.stringify(body), {
        skipMongoDB: databaseUnavailable,
      });
      const failure = NextResponse.json(body, { status });
      failure.headers.set("X-Request-Id", requestId);
      return failure;
    }
  };
}
