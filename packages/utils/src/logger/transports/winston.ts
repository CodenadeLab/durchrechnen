import { WinstonTransport } from '@loglayer/transport-winston';
import winston from 'winston';

export function createWinstonTransport(options?: {
  level?: string;
  format?: any;
  transports?: any[];
}) {
  const winstonLogger = winston.createLogger({
    level: options?.level || 'info',
    format: options?.format,
    transports: options?.transports,
  });

  return new WinstonTransport({
    logger: winstonLogger,
  });
}