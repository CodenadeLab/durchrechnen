// Type augmentation for LogLayer to allow flexible metadata
declare module 'loglayer' {
  interface ILogLayer {
    withMetadata(metadata: Record<string, unknown>): ILogBuilder;
  }
  
  interface ILogBuilder {
    withMetadata(metadata: Record<string, unknown>): ILogBuilder;
  }
}

export {};