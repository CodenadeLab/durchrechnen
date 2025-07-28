import { openTelemetryPlugin } from "loglayer";

export function createOpenTelemetryPlugin(config?: {
  serviceName?: string;
  serviceVersion?: string;
  traceIdKey?: string;
  spanIdKey?: string;
}) {
  return openTelemetryPlugin({
    serviceName: config?.serviceName || "durchrechnen",
    serviceVersion: config?.serviceVersion || "1.0.0",
    traceIdKey: config?.traceIdKey || "trace_id",
    spanIdKey: config?.spanIdKey || "span_id",
  });
}
