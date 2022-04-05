import { TracingContext } from './tracing-context.interface';

export interface TracingInjector<TCarrier> {
  inject(context: TracingContext, carrier: TCarrier): void;
}
