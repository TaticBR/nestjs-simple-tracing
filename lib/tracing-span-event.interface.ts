export type TracingSpanEvent<TEvent extends Record<string, unknown> = any> = {
  [TName in keyof TEvent]: {
    name: TName;
    time: number;
    payload: TEvent[TName];
  };
}[keyof TEvent];
