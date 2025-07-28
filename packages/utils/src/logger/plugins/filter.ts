import { filterPlugin } from "@loglayer/plugin-filter";

export function createFilterPlugin(config: {
  messages?: (string | RegExp)[];
  queries?: string[];
  debug?: boolean;
}) {
  return filterPlugin({
    messages: config.messages,
    queries: config.queries,
    debug: config.debug,
  });
}
