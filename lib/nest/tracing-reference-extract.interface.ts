export type TracingReferenceExtractor<TCarrier> = (
  carrier: TCarrier,
) => string | undefined;
