import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanEvent } from './tracing-span-event.interface';

export interface TracingReporter<
  TPayload = unknown,
  TEvent extends string = any,
> {
  onStart(context: TracingSpanContext): Promise<void> | void;

  onLog(
    context: TracingSpanContext,
    event: TracingSpanEvent<TPayload, TEvent>,
  ): Promise<void> | void;

  onFinish(
    context: TracingSpanContext,
    events: TracingSpanEvent<TPayload, TEvent>[],
  ): Promise<void> | void;
}

export type TracingStartCallback = TracingReporter['onStart'];

export type TracingLogCallback<
  TPayload = unknown,
  TEvent extends string = any,
> = TracingReporter<TPayload, TEvent>['onLog'];

export type TracingFinishCallback<
  TPayload = unknown,
  TEvent extends string = any,
> = TracingReporter<TPayload, TEvent>['onFinish'];
