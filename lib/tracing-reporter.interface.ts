import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanEvent } from './tracing-span-event.interface';

export interface TracingReporter<
  TPayload = unknown,
  TEvent extends string = any,
> {
  onStart(context: TracingSpanContext): Promise<void> | void;

  onEvent(
    context: TracingSpanContext,
    event: TracingSpanEvent<TPayload, TEvent>,
  ): Promise<void> | void;

  onFinish(
    context: TracingSpanContext,
    events: TracingSpanEvent<TPayload, TEvent>[],
  ): Promise<void> | void;
}

export type TracingStartCallback = TracingReporter['onStart'];

export type TracingEventCallback<
  TPayload = unknown,
  TEvent extends string = any,
> = TracingReporter<TPayload, TEvent>['onEvent'];

export type TracingFinishCallback<
  TPayload = unknown,
  TEvent extends string = any,
> = TracingReporter<TPayload, TEvent>['onFinish'];
