import { TracingContext } from './tracing-context.interface';

export interface TracingExtractor<TCarrier> {
  extract(carrier: TCarrier): Partial<TracingContext> | undefined;
}
