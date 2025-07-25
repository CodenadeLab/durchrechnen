// Simple, safe logger to prevent infinite recursion
interface SimpleLogger {
  info(message: string, metadata?: any): void;
  error(message: string, metadata?: any): void;
  warn(message: string, metadata?: any): void;
  debug(message: string, metadata?: any): void;
  httpRequest(req: any, res: any, duration?: number): void;
  httpError(req: any, error: Error, statusCode: number): void;
  authEvent(event: string, userId?: string, details?: any): void;
}

const safeLog = (level: string, message: string, metadata?: any) => {
  try {
    const logMethod = console[level as keyof typeof console] as (
      ...args: any[]
    ) => void;
    if (metadata) {
      logMethod(
        `[${level.toUpperCase()}] ${message}`,
        JSON.stringify(metadata, null, 2),
      );
    } else {
      logMethod(`[${level.toUpperCase()}] ${message}`);
    }
  } catch {
    // Fallback to basic console.log if JSON.stringify fails
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
};

export const logger: SimpleLogger = {
  info: (message: string, metadata?: any) => safeLog("info", message, metadata),
  error: (message: string, metadata?: any) =>
    safeLog("error", message, metadata),
  warn: (message: string, metadata?: any) => safeLog("warn", message, metadata),
  debug: (message: string, metadata?: any) =>
    safeLog("debug", message, metadata),

  httpRequest: (req: any, res: any, duration?: number) => {
    const metadata = {
      method: req?.method || "unknown",
      url: req?.url || "unknown",
      statusCode: res?.statusCode || res?.status || "unknown",
      duration,
    };
    safeLog("info", "HTTP Request", metadata);
  },

  httpError: (req: any, error: Error, statusCode: number) => {
    const metadata = {
      method: req?.method || "unknown",
      url: req?.url || "unknown",
      statusCode,
      error: error.message,
    };
    safeLog("error", "HTTP Error", metadata);
  },

  authEvent: (event: string, userId?: string, details?: any) => {
    const metadata = { event, userId, ...details };
    safeLog("info", "Auth Event", metadata);
  },
};
