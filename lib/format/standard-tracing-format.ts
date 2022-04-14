import { TracingContext, TracingExtractor, TracingInjector } from '..';

export type TracingGetter = (key: string) => string | undefined;
export type TracingSetter = (key: string, value: string) => void;

export const TRACE_ID_KEY = 'trace-id';
export const SPAN_ID_KEY = 'span-id';
export const REFERENCE_ID_KEY = 'reference-id';

export class StandardTracingExtractor
  implements TracingExtractor<TracingGetter>
{
  private static readonly INSTANCE = new StandardTracingExtractor();

  private constructor() {}

  extract(carrier: TracingGetter): Partial<TracingContext> | undefined {
    const traceId = carrier(TRACE_ID_KEY);
    if (!traceId) {
      return;
    }
    const spanId = carrier(SPAN_ID_KEY);
    const referenceId = carrier(REFERENCE_ID_KEY);
    return {
      traceId,
      spanId,
      referenceId,
    };
  }

  public static getInstance(): StandardTracingExtractor {
    return this.INSTANCE;
  }
}

export class StandardTracingInjector implements TracingInjector<TracingSetter> {
  public static readonly INSTANCE = new StandardTracingInjector();

  private constructor() {}

  inject(context: TracingContext, carrier: TracingSetter): void {
    carrier(TRACE_ID_KEY, context.traceId);
    carrier(SPAN_ID_KEY, context.spanId);
    if (context.referenceId) {
      carrier(REFERENCE_ID_KEY, context.referenceId);
    }
  }

  public static getInstance(): StandardTracingInjector {
    return this.INSTANCE;
  }
}
