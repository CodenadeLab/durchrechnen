import { PinoTransport } from '@loglayer/transport-pino';
import pino from 'pino';

export function createPinoTransport(options?: {
  level?: string;
  transport?: {
    target: string;
    options?: Record<string, any>;
  };
}) {
  const pinoLogger = pino({
    level: options?.level || 'info',
    transport: options?.transport,
  });

  return new PinoTransport({
    logger: pinoLogger,
  });
}