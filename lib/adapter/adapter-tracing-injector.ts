import { TracingContext, TracingInjector } from '..';
import {
  TracingAdapter,
  TracingAdaptFunction,
} from './tracing-adapter.interface';

export class AdapterTracingInjector<TCarrierIn, TCarrierOut>
  implements TracingInjector<TCarrierIn>
{
  private readonly adapt: TracingAdaptFunction<TCarrierIn, TCarrierOut>;

  constructor(
    private readonly injector: TracingInjector<TCarrierOut>,
    adapter: TracingAdapter<TCarrierIn, TCarrierOut>,
  ) {
    this.adapt =
      typeof adapter === 'function' ? adapter : adapter.adapt.bind(adapter);
  }

  inject(context: TracingContext, carrier: TCarrierIn): void {
    const adaptedCarrier = this.adapt(carrier);
    if (adaptedCarrier) {
      this.injector.inject(context, adaptedCarrier);
    }
  }
}
