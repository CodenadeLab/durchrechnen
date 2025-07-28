import { filterPlugin } from "loglayer";

export function createFilterPlugin(config: {
  level?: string;
  namespace?: string;
  custom?: (logObj: any) => boolean;
}) {
  return filterPlugin({
    level: config.level,
    namespace: config.namespace,
    filter: config.custom,
  });
}
