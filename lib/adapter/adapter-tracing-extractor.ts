import { TracingContext, TracingExtractor } from '..';
import {
  TracingAdapter,
  TracingAdaptFunction,
} from './tracing-adapter.interface';

export class AdapterTracingExtractor<TCarrierIn, TCarrierOut>
  implements TracingExtractor<TCarrierIn>
{
  private readonly adapt: TracingAdaptFunction<TCarrierIn, TCarrierOut>;

  constructor(
    private readonly extractor: TracingExtractor<TCarrierOut>,
    adapter:
      | TracingAdapter<TCarrierIn, TCarrierOut>
      | TracingAdaptFunction<TCarrierIn, TCarrierOut>,
  ) {
    this.adapt =
      typeof adapter === 'function' ? adapter : adapter.adapt.bind(adapter);
  }

  extract(carrier: TCarrierIn): Partial<TracingContext> | undefined {
    const adaptedCarrier = this.adapt(carrier);
    if (adaptedCarrier) {
      return this.extractor.extract(adaptedCarrier);
    }
  }
}
