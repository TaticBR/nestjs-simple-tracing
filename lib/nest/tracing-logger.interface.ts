import { TracingContext, TracingService, TracingSpan } from '..';

export interface TracingLogger<TCarrier> {
  start(
    carrier: TCarrier,
    tracer: TracingService,
    tracingContext?: Partial<TracingContext>,
  ): TracingSpan | undefined;
  onNext(carrier: TCarrier, span: TracingSpan, payload: unknown): void;
  onError(carrier: TCarrier, span: TracingSpan, error: unknown): void;
  finalize(carrier: TCarrier, span: TracingSpan): void;
}
