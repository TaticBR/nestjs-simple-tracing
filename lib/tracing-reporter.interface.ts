import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanLog } from './tracing-span-log.interface';

export type TracingStartCallback = (
  context: TracingSpanContext,
) => Promise<void>;

export type TracingLogCallback<
  TPayload = unknown,
  TEvent extends string = any,
> = (
  context: TracingSpanContext,
  log: TracingSpanLog<TPayload, TEvent>,
) => Promise<void>;

export type TracingFinishCallback<
  TPayload = unknown,
  TEvent extends string = any,
> = (
  context: TracingSpanContext,
  logs: TracingSpanLog<TPayload, TEvent>[],
) => Promise<void>;

export interface TracingReporter<
  TPayload = unknown,
  TEvent extends string = any,
> {
  onStart: TracingStartCallback;
  onLog: TracingLogCallback<TPayload, TEvent>;
  onFinish: TracingFinishCallback<TPayload, TEvent>;
}
