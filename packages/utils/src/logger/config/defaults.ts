import type { LoggerConfig } from "./types";

export const defaultConfig: LoggerConfig = {
  level: "info",
  environment: "development",
  service: "durchrechnen",
  version: "1.0.0",
  enableConsole: true,
  enableFile: false,
  enableDatadog: false,
  enableOpenTelemetry: false,
  filePath: "./logs/app.log",
  redactionConfig: {
    paths: [
      "password",
      "token",
      "secret",
      "apiKey",
      "authorization",
      "cookie",
      "session",
      "jwt",
      "bearer",
    ],
    censor: "[REDACTED]",
  },
  filterConfig: {
    level: "info",
  },
};
