/**
 * @file types/api.ts
 * @description Shared API response and request types.
 *
 * All API routes should return one of these shapes so the client always knows
 * what to expect.
 */

// ---------------------------------------------------------------------------
// Generic API response envelope
// ---------------------------------------------------------------------------

/** Successful response */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

/** Error response */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
  timestamp?: string;
}

/** Combined union type */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}
