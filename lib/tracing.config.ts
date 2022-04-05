import { TracingReporter } from './tracing-reporter.interface';
import { TracingTags } from './tracing-tags.interface';

export type TracingIdFactory = {
  newTraceId(): string;
  newSpanId(): string;
};

export interface TracingConfig<
  TPayload = unknown,
  TEvent extends string = any,
> {
  serviceName: string;
  idFactory?: TracingIdFactory;
  reporter?: TracingReporter<TPayload, TEvent>;
  tags?: TracingTags;
}
