export interface LoggerConfig {
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  environment?: 'development' | 'production' | 'test';
  service?: string;
  version?: string;
  enableConsole?: boolean;
  enableFile?: boolean;
  enableDatadog?: boolean;
  enableOpenTelemetry?: boolean;
  filePath?: string;
  datadogConfig?: {
    apiKey: string;
    service: string;
    env: string;
    hostname?: string;
  };
  redactionConfig?: {
    paths: string[];
    censor?: string;
  };
  filterConfig?: {
    level?: string;
    namespace?: string;
  };
}

export interface TransportConfig {
  type: 'console' | 'pino' | 'winston' | 'datadog' | 'file';
  options?: Record<string, any>;
}