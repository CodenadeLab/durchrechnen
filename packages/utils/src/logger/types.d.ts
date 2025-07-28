// Type augmentation for LogLayer to allow flexible metadata with proper typing
export type MetadataValue = string | number | boolean | null | undefined;

export interface StructuredMetadata {
  [key: string]:
    | MetadataValue
    | Record<string, MetadataValue>
    | Array<MetadataValue>;
}

declare module "loglayer" {
  interface ILogLayer {
    withMetadata(metadata: StructuredMetadata): ILogBuilder;
    withError(error: Error): ILogBuilder;
  }

  interface ILogBuilder {
    withMetadata(metadata: StructuredMetadata): ILogBuilder;
    withError(error: Error): ILogBuilder;
    info(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    debug(message: string): void;
  }
}
