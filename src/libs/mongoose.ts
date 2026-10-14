/**
 * @file libs/mongoose.ts
 * @description Mongoose connection singleton for schema-driven DB access.
 *
 * Keeps a single connection open and re-uses it across hot reloads.
 *
 * @example
 * import { connectMongoose } from '@/libs/mongoose';
 * await connectMongoose();
 */

import mongoose from "mongoose";
import logger from "@/logger";

const SERVER_SELECTION_TIMEOUT_MS = 10_000;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI ?? "";
  if (!uri) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global._mongooseCache) {
  global._mongooseCache = cache;
}

/**
 * Connect to MongoDB via Mongoose (cached singleton).
 * Call this at the top of every API route / Server Action that needs ODM access.
 */
export async function connectMongoose(): Promise<typeof mongoose> {
  const mongoUri = getMongoUri();

  if (cache.conn) {
    logger.info("MongoDB already connected (cached)", {
      uri: mongoUri.replace(/:\/\/.*@/, "://***@"),
    });
    return cache.conn;
  }

  if (!cache.promise) {
    logger.info("Connecting to MongoDB…", {
      uri: mongoUri.replace(/:\/\/.*@/, "://***@"),
    });
    cache.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      })
      .then((conn) => {
        logger.info("MongoDB connected successfully", {
          host: conn.connection.host,
          port: conn.connection.port,
          db: conn.connection.name,
        });
        return conn;
      })
      .catch((err: unknown) => {
        // Reset promise so next call retries
        cache.promise = null;
        logger.error("MongoDB connection failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
