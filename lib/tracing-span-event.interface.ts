export interface TracingSpanEvent<
  TPayload = unknown,
  TEvent extends string = any,
> {
  name: TEvent;
  time: number;
  payload?: TPayload;
}
