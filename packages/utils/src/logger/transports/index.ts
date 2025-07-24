export * from './console';

// Conditional exports for server-only transports
export async function createServerTransports() {
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const { createPinoTransport } = await import('./pino');
      const { createWinstonTransport } = await import('./winston');
      const { createDatadogTransport } = await import('./datadog');
      
      return {
        createPinoTransport,
        createWinstonTransport,
        createDatadogTransport,
      };
    } catch (error) {
      console.warn('Server transports not available:', error);
      return {};
    }
  }
  return {};
}