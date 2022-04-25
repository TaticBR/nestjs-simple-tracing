import { TracingContext } from './tracing-context.interface';

export interface TracingInjector<TCarrier> {
  inject(context: Partial<TracingContext>, carrier: TCarrier): void;
}
