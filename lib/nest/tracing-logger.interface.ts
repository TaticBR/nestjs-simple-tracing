import { TracingContext, TracingService, TracingSpan } from '..';
import { TracingOperationOptions } from './tracing-decorator-options.interface';

export interface TracingLogger<TCarrier> {
  start(
    carrier: TCarrier,
    tracer: TracingService,
    tracingContext?: Partial<TracingContext>,
    options?: TracingOperationOptions
  ): TracingSpan | undefined;
  onNext(carrier: TCarrier, span: TracingSpan, payload: unknown): void;
  onError(carrier: TCarrier, span: TracingSpan, error: unknown): void;
  finalize(carrier: TCarrier, span: TracingSpan): void;
}
