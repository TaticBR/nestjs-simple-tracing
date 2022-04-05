export interface TracingSpanLog<
  TPayload = unknown,
  TEvent extends string = any,
> {
  event: TEvent;
  eventTime: number;
  payload?: TPayload;
}
