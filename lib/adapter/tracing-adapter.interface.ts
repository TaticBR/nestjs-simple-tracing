export type TracingAdapter<TCarrierIn, TCarrierOut> = {
  adapt(carrier: TCarrierIn): TCarrierOut | undefined;
};

export type TracingAdaptFunction<TCarrierIn, TCarrierOut> = TracingAdapter<
  TCarrierIn,
  TCarrierOut
>['adapt'];
