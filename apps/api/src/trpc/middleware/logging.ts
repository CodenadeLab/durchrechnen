// =============================================================================
// TRPC PROFESSIONAL LOGGING MIDDLEWARE - Using Shared Logger Infrastructure
// =============================================================================

import { createSyncLogger } from "@durchrechnen/utils";
import { TRPCError } from "@trpc/server";
import { middleware, publicProcedure } from "../init";

// Generate unique request ID for distributed tracing
function generateRequestId(): string {
  return `trpc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create dedicated tRPC logger instance
const logger = createSyncLogger({
  enableConsole: true,
  enableFile: true,
  filePath: "./logs/trpc.log",
});

// Performance monitoring middleware using our shared logger
export const performanceMiddleware = middleware(async (opts) => {
  const { path, type, next, input, ctx } = opts;
  const requestId = generateRequestId();
  const start = performance.now();

  // Extract request metadata from context (if available)
  const requestMetadata = {
    requestId,
    trpcPath: path,
    trpcType: type,
    userAgent: ctx.req?.headers?.get?.("user-agent") || "unknown",
    ip:
      ctx.req?.headers?.get?.("x-forwarded-for") ||
      ctx.req?.headers?.get?.("x-real-ip") ||
      "unknown",
    input:
      process.env.NODE_ENV === "development"
        ? typeof input === "object" && input !== null
          ? JSON.stringify(input)
          : String(input || "")
        : "[REDACTED]",
  };

  // Log request start using our structured logger
  logger.info("tRPC Request Started", requestMetadata);

  try {
    const result = await next();
    const duration = Math.round((performance.now() - start) * 100) / 100;

    // Log successful completion
    logger.info("tRPC Request Completed", {
      ...requestMetadata,
      duration,
      status: "success",
    });

    // Performance warning for slow requests using shared logger
    if (duration > 1000) {
      logger.warn("Slow tRPC Request Detected", {
        ...requestMetadata,
        duration,
        threshold: 1000,
        performance: "degraded",
      });
    }

    return result;
  } catch (error) {
    const duration = Math.round((performance.now() - start) * 100) / 100;

    const errorMetadata = {
      ...requestMetadata,
      duration,
      errorCode: error instanceof TRPCError ? error.code : "UNKNOWN_ERROR",
      errorMessage:
        error instanceof Error ? error.message : "Unknown error occurred",
    };

    // Use our logger's built-in error handling with different severity levels
    if (error instanceof TRPCError) {
      if (["NOT_FOUND", "BAD_REQUEST", "UNAUTHORIZED"].includes(error.code)) {
        // Client errors - use warn level with chained error logging
        logger
          .withError(error)
          .withMetadata(errorMetadata)
          .warn("tRPC Client Error");
      } else {
        // Server errors - use error level with chained error logging
        logger
          .withError(error)
          .withMetadata(errorMetadata)
          .error("tRPC Server Error");
      }
    } else {
      // Unexpected errors - use error level with full error context
      logger
        .withError(error as Error)
        .withMetadata(errorMetadata)
        .error("tRPC Unexpected Error");
    }

    throw error;
  }
});

// Database operation middleware using our shared logger's databaseQuery method
export const databaseMiddleware = middleware(async (opts) => {
  const { path, type, next } = opts;
  const requestId = generateRequestId();
  const queryStart = performance.now();

  try {
    const result = await next();
    const queryDuration =
      Math.round((performance.now() - queryStart) * 100) / 100;

    // Log successful database operations using specialized method
    logger.databaseQuery(
      `tRPC procedure: ${path}`,
      queryDuration,
      [], // params redacted for security
    );

    return result;
  } catch (error) {
    const queryDuration =
      Math.round((performance.now() - queryStart) * 100) / 100;

    // Log database errors with structured context
    if (
      error instanceof Error &&
      (error.message.includes("database") ||
        error.message.includes("connection") ||
        error.message.includes("timeout") ||
        error.message.includes("drizzle"))
    ) {
      logger
        .withError(error)
        .withMetadata({
          trpcPath: path,
          trpcType: type,
          requestId,
          queryDuration,
          databaseError: error.message,
        })
        .error("tRPC Database Error");
    }
    throw error;
  }
});

// Note: In tRPC, middleware composition is done via .use() chaining in procedures
// We don't need a composite middleware - instead we use .use() multiple times

// Enhanced procedures with comprehensive monitoring using our shared logger
// Multiple middleware are chained using .use() - they execute in order
export const loggedProcedure = publicProcedure
  .use(performanceMiddleware)
  .use(databaseMiddleware);

// Alternative: Single performance monitoring procedure (lighter weight)
export const performanceLoggedProcedure = publicProcedure.use(
  performanceMiddleware,
);

// Alternative: Database-only monitoring procedure
export const databaseLoggedProcedure = publicProcedure.use(databaseMiddleware);

// Business event logging helpers using our shared logger's businessEvent method
export function logBusinessEvent(event: string, data: Record<string, any>) {
  logger.businessEvent(event, data);
}

// Export logger instance for manual usage in procedures
export { logger };
