import { TracingEvents } from './tracing-events.interface';

export type TracingSpanEvent<TEvent extends TracingEvents = TracingEvents> = {
  [TName in keyof TEvent]: {
    name: TName;
    time: number;
    payload: TEvent[TName];
  };
}[keyof TEvent];
