export interface TracingContext {
  traceId: string;
  parentSpanId?: string;
  spanId?: string;
  referenceId?: string;
}
