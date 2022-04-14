import { TracingEvents } from './tracing-events.interface';
import { TracingReporter } from './tracing-reporter.interface';
import { TracingTags } from './tracing-tags.interface';

export type TracingIdFactory = {
  newTraceId(): string;
  newSpanId(): string;
};

export interface TracingConfig<TEvent extends TracingEvents = TracingEvents> {
  serviceName: string;
  idFactory?: TracingIdFactory;
  reporter?: TracingReporter<TEvent>;
  tags?: TracingTags;
}
