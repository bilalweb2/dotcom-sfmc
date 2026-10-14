/**
 * @file utils/response.ts
 * @description Helper functions for building consistent API responses.
 *
 * @example
 * import { successResponse, errorResponse } from '@/utils/response';
 *
 * return successResponse({ id: '1', name: 'Alice' }, 201);
 * return errorResponse('Not found', 404);
 */

import { NextResponse } from "next/server";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginationMeta,
} from "@/types/api";

/** Build a 2xx JSON response */
export function successResponse<T>(
  data: T,
  status = 200,
  options?: { message?: string; meta?: PaginationMeta },
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data, ...options }, { status });
}

/** Build an error JSON response */
export function errorResponse(
  error: string,
  status = 500,
  details?: Record<string, string[]>,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error, details, timestamp: new Date().toISOString() },
    { status },
  );
}
