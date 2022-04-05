import { TracingContext } from './tracing-context.interface';
import { TracingTags } from './tracing-tags.interface';

export interface TracingSpanContext extends TracingContext {
  serviceName: string;
  operation: string;
  startTime?: number;
  finishTime?: number;
  tags?: TracingTags;
}
