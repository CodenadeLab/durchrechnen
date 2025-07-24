import { createSyncLogger, type IExtendedLogger } from "@durchrechnen/utils";

export const logger: IExtendedLogger = createSyncLogger({
  service: 'native-app',
  environment: import.meta.env.DEV ? 'development' : 'production',
  enableConsole: true,
});