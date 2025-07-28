import type { ILogBuilder, ILogLayer, LogLayerTransport } from "loglayer";
import { ConsoleTransport, LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import type { LoggerConfig } from "./config";
import { defaultConfig } from "./config";
import { createServerTransports } from "./transports";
import type { StructuredMetadata } from "./types.d";

// Extended logger interface with our custom methods and flexible typing
export interface IExtendedLogger
  extends Omit<
    ILogLayer,
    "info" | "error" | "warn" | "debug" | "withMetadata"
  > {
  // Override base methods to be more flexible with metadata
  withMetadata(metadata: StructuredMetadata): ILogBuilder;

  // Override standard logging methods to accept flexible metadata as second parameter
  info(message: string, metadata?: StructuredMetadata): void;
  error(message: string, metadata?: StructuredMetadata): void;
  warn(message: string, metadata?: StructuredMetadata): void;
  debug(message: string, metadata?: StructuredMetadata): void;

  // Custom convenience methods
  withUser(userId: string, userEmail?: string): ILogBuilder;
  withRequest(req: any): ILogBuilder;
  httpRequest(req: any, res: any, duration?: number): void;
  httpError(req: any, error: Error, statusCode: number): void;
  databaseQuery(query: string, duration: number, params?: any[]): void;
  authEvent(
    event: string,
    userId?: string,
    details?: Record<string, any>,
  ): void;
  businessEvent(event: string, data: Record<string, any>): void;
}

export async function createLogger(
  config?: Partial<LoggerConfig>,
): Promise<IExtendedLogger> {
  const finalConfig = { ...defaultConfig, ...config };

  // Detect environment automatically
  const isBrowser = typeof globalThis !== "undefined" && "window" in globalThis;
  const isNode = typeof process !== "undefined" && process.versions?.node;

  // Create transports based on environment and configuration
  const transports: LogLayerTransport[] = [];

  // Console transport works in all environments
  if (finalConfig.enableConsole) {
    transports.push(
      new ConsoleTransport({
        logger: console,
      }),
    );
  }

  // File/server transports only in Node.js environment
  if (!isBrowser && isNode && finalConfig.enableFile) {
    try {
      const serverTransports = await createServerTransports();
      if (serverTransports.createPinoTransport) {
        transports.push(
          serverTransports.createPinoTransport({
            transport: {
              target: "pino/file",
              options: {
                destination: finalConfig.filePath,
              },
            },
          }),
        );
      }
    } catch (error) {
      // Fallback to console if file transport fails
      console.warn("File transport not available, using console only:", error);
    }
  }

  // Create and configure the logger with proper typing
  // Ensure we always have at least one transport (fallback to console)
  if (transports.length === 0) {
    transports.push(new ConsoleTransport({ logger: console }));
  }

  const baseLogger: ILogLayer = new LogLayer({
    errorSerializer: serializeError,
    transport: transports[0]!,
  });

  // Create extended logger with custom methods by properly extending the base logger
  const extendedLogger = baseLogger as IExtendedLogger;

  // Override standard logging methods to accept flexible metadata
  extendedLogger.info = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).info(message);
    } else {
      baseLogger.info(message);
    }
  };

  extendedLogger.error = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).error(message);
    } else {
      baseLogger.error(message);
    }
  };

  extendedLogger.warn = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).warn(message);
    } else {
      baseLogger.warn(message);
    }
  };

  extendedLogger.debug = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).debug(message);
    } else {
      baseLogger.debug(message);
    }
  };

  // Add custom convenience methods
  extendedLogger.withUser = (
    userId: string,
    userEmail?: string,
  ): ILogBuilder => {
    const metadata: StructuredMetadata = {
      userId,
      userEmail: userEmail ? "[REDACTED]" : undefined,
    };
    return baseLogger.withMetadata(metadata);
  };

  extendedLogger.withRequest = (req: any): ILogBuilder => {
    const metadata: StructuredMetadata = { request: req };
    return baseLogger.withMetadata(metadata);
  };

  // Add structured logging methods
  extendedLogger.httpRequest = (
    req: any,
    res: any,
    duration?: number,
  ): void => {
    const metadata: StructuredMetadata = {
      request: req,
      response: res,
      duration,
    };
    baseLogger.withMetadata(metadata).info("HTTP Request");
  };

  extendedLogger.httpError = (
    req: any,
    error: Error,
    statusCode: number,
  ): void => {
    const metadata: StructuredMetadata = {
      request: req,
      statusCode,
    };
    baseLogger.withMetadata(metadata).withError(error).error("HTTP Error");
  };

  extendedLogger.databaseQuery = (
    query: string,
    duration: number,
    params?: any[],
  ): void => {
    const metadata: StructuredMetadata = {
      query,
      duration,
      params: params ? "[REDACTED]" : undefined,
    };
    baseLogger.withMetadata(metadata).debug("Database Query");
  };

  extendedLogger.authEvent = (
    event: string,
    userId?: string,
    details?: Record<string, any>,
  ): void => {
    const metadata: StructuredMetadata = {
      event,
      userId,
      ...details,
    };
    baseLogger.withMetadata(metadata).info("Auth Event");
  };

  extendedLogger.businessEvent = (
    event: string,
    data: Record<string, any>,
  ): void => {
    const metadata: StructuredMetadata = {
      event,
      ...data,
    };
    baseLogger.withMetadata(metadata).info("Business Event");
  };

  return extendedLogger;
}

// Create a default logger instance (synchronous for immediate use)
export function createSyncLogger(
  _config?: Partial<LoggerConfig>,
): IExtendedLogger {
  // Only use console transport for sync logger (browser-safe)
  const consoleTransport = new ConsoleTransport({
    logger: console,
  });

  const baseLogger: ILogLayer = new LogLayer({
    errorSerializer: serializeError,
    transport: consoleTransport,
  });

  // Create extended logger with custom methods by properly extending the base logger
  const extendedLogger = baseLogger as any;

  // Override standard logging methods to accept flexible metadata
  extendedLogger.info = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).info(message);
    } else {
      baseLogger.info(message);
    }
  };

  extendedLogger.error = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).error(message);
    } else {
      baseLogger.error(message);
    }
  };

  extendedLogger.warn = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).warn(message);
    } else {
      baseLogger.warn(message);
    }
  };

  extendedLogger.debug = (
    message: string,
    metadata?: StructuredMetadata,
  ): void => {
    if (metadata) {
      baseLogger.withMetadata(metadata).debug(message);
    } else {
      baseLogger.debug(message);
    }
  };

  // Add custom convenience methods
  extendedLogger.withUser = (
    userId: string,
    userEmail?: string,
  ): ILogBuilder => {
    const metadata: StructuredMetadata = {
      userId,
      userEmail: userEmail ? "[REDACTED]" : undefined,
    };
    return baseLogger.withMetadata(metadata);
  };

  extendedLogger.withRequest = (req: any): ILogBuilder => {
    const metadata: StructuredMetadata = { request: req };
    return baseLogger.withMetadata(metadata);
  };

  // Add structured logging methods
  extendedLogger.httpRequest = (
    req: any,
    res: any,
    duration?: number,
  ): void => {
    const metadata: StructuredMetadata = {
      request: req,
      response: res,
      duration,
    };
    baseLogger.withMetadata(metadata).info("HTTP Request");
  };

  extendedLogger.httpError = (
    req: any,
    error: Error,
    statusCode: number,
  ): void => {
    const metadata: StructuredMetadata = {
      request: req,
      statusCode,
    };
    baseLogger.withMetadata(metadata).withError(error).error("HTTP Error");
  };

  extendedLogger.databaseQuery = (
    query: string,
    duration: number,
    params?: any[],
  ): void => {
    const metadata: StructuredMetadata = {
      query,
      duration,
      params: params ? "[REDACTED]" : undefined,
    };
    baseLogger.withMetadata(metadata).debug("Database Query");
  };

  extendedLogger.authEvent = (
    event: string,
    userId?: string,
    details?: Record<string, any>,
  ): void => {
    const metadata: StructuredMetadata = {
      event,
      userId,
      ...details,
    };
    baseLogger.withMetadata(metadata).info("Auth Event");
  };

  extendedLogger.businessEvent = (
    event: string,
    data: Record<string, any>,
  ): void => {
    const metadata: StructuredMetadata = {
      event,
      ...data,
    };
    baseLogger.withMetadata(metadata).info("Business Event");
  };

  return extendedLogger;
}

export const logger = createSyncLogger();
