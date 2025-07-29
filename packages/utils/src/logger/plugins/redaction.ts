import { redactionPlugin } from "@loglayer/plugin-redaction";

export function createRedactionPlugin(config: {
  paths: string[];
  censor?: string;
}) {
  return redactionPlugin({
    paths: config.paths,
    censor: config.censor || "[REDACTED]",
  });
}
