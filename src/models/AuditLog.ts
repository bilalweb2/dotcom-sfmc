/**
 * @file models/AuditLog.ts
 * @description Mongoose model for the `audit_logs` collection (sfmc DB).
 *
 * Immutable event-log of API request/response exchanges captured by `logApiExchange`.
 *
 * ## Collection
 * Name       : audit_logs
 * Database   : sfmc
 *
 * ## Document structure
 * | Field       | Type   | Required | Default | Notes                              |
 * |-------------|--------|----------|---------|------------------------------------|
 * | method      | String | Yes      | —       | HTTP verb (GET, POST, …)             |
 * | path        | String | Yes      | —       | Request pathname                     |
 * | query       | String | No       | ''      | Query string (incl. leading `?`)     |
 * | status      | Number | Yes      | —       | HTTP response status code            |
 * | durationMs  | Number | Yes      | —       | Handler duration in milliseconds     |
 * | requestId   | String | Yes      | —       | Distributed tracing ID               |
 * | request     | String | No       | ''      | Sanitised request body               |
 * | response    | String | No       | ''      | Sanitised response body              |
 * | createdAt   | Date   | Auto     | now()   | Injected by Mongoose timestamps    |
 *
 * ## Indexes
 * | Name              | Fields                    | Purpose                              |
 * |-------------------|---------------------------|--------------------------------------|
 * | requestId_1       | { requestId: 1 }          | Trace lookup by request ID           |
 * | path_createdAt    | { path: 1, createdAt: -1 }| Latest calls per endpoint            |
 * | createdAt_-1      | { createdAt: -1 }         | Time-range queries / exports         |
 * | status_createdAt  | { status: 1, createdAt: -1}| Filter failures by time window       |
 *
 * ## Unique constraints
 * None — this is an **event-log** collection. Each API exchange is an
 * independent audit record.
 *
 * ## Timestamps
 * `createdAt` is auto-managed by Mongoose (`timestamps: { createdAt: 'createdAt', updatedAt: false }`).
 * Records are immutable after insertion — there is no `updatedAt`.
 *
 * @example
 * import { AuditLogModel } from '@/models/AuditLog';
 * await AuditLogModel.create({
 *   method: 'POST',
 *   path: '/ftr-forms/api/health',
 *   status: 200,
 *   durationMs: 12,
 *   requestId: 'abc-123',
 * });
 */

import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IAuditLog extends Document {
  method: string;
  path: string;
  query: string;
  status: number;
  durationMs: number;
  requestId: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    method: {
      type: String,
      required: [true, "method is required"],
      trim: true,
      uppercase: true,
    },
    path: {
      type: String,
      required: [true, "path is required"],
      trim: true,
    },
    query: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: Number,
      required: [true, "status is required"],
      min: [100, "status must be a valid HTTP status code"],
      max: [599, "status must be a valid HTTP status code"],
    },
    durationMs: {
      type: Number,
      required: [true, "durationMs is required"],
      min: [0, "durationMs cannot be negative"],
    },
    requestId: {
      type: String,
      required: [true, "requestId is required"],
      trim: true,
    },
    request: {
      type: Schema.Types.Mixed,
      default: {},
    },
    response: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
    collection: "audit_logs",
  },
);

AuditLogSchema.index({ requestId: 1 }, { name: "requestId_1" });

AuditLogSchema.index({ path: 1, createdAt: -1 }, { name: "path_createdAt" });

AuditLogSchema.index({ createdAt: -1 }, { name: "createdAt_-1" });

AuditLogSchema.index(
  { status: 1, createdAt: -1 },
  { name: "status_createdAt" },
);

export const AuditLogModel: Model<IAuditLog> =
  (mongoose.models["AuditLog"] as Model<IAuditLog> | undefined) ??
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
