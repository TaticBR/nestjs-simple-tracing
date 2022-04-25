import { TracingContext } from '..';

export interface TracingContextRef {
  context?: Partial<TracingContext>;
}
