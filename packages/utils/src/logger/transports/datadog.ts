import { DataDogTransport } from "@loglayer/transport-datadog";

export function createDatadogTransport(config: {
  apiKey: string;
  service: string;
  env: string;
  hostname?: string;
  tags?: string[];
  site?: string;
}) {
  return new DataDogTransport({
    options: {
      ddClientConf: {
        authMethods: {
          apiKeyAuth: config.apiKey,
        },
      },
      ddServerConf: {
        site: config.site || "datadoghq.com",
      },
      onDebug: (msg) => {
        console.log("[DataDog Debug]:", msg);
      },
      onError: (err, logs) => {
        console.error("[DataDog Error]:", err, logs);
      },
    },
  });
}
