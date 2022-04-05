import { TracingContext, TracingExtractor } from '..';

export class CompositeTracingExtractor<TCarrier>
  implements TracingExtractor<TCarrier>
{
  private readonly extractors: TracingExtractor<TCarrier>[] = [];

  constructor(...extractors: TracingExtractor<TCarrier>[]) {
    this.extractors = extractors;
  }

  extract(carrier: TCarrier): Partial<TracingContext> | undefined {
    for (const extractor of this.extractors) {
      const context = extractor.extract(carrier);
      if (context) {
        return context;
      }
    }
  }
}
