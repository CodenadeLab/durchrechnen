import { openTelemetryPlugin } from "@loglayer/plugin-opentelemetry";

export function createOpenTelemetryPlugin(config?: {
  traceFieldName?: string;
  traceIdFieldName?: string;
  spanIdFieldName?: string;
  traceFlagsFieldName?: string;
}) {
  return openTelemetryPlugin({
    traceFieldName: config?.traceFieldName,
    traceIdFieldName: config?.traceIdFieldName || "trace_id",
    spanIdFieldName: config?.spanIdFieldName || "span_id",
    traceFlagsFieldName: config?.traceFlagsFieldName || "trace_flags",
  });
}
