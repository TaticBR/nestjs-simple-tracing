export interface TracingContext {
  traceId: string;
  spanId: string;
  parentId?: string;
  referenceId?: string;
}
