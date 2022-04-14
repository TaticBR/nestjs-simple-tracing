import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanEvent } from './tracing-span-event.interface';

export interface TracingReporter<TEvent extends Record<string, unknown> = any> {
  onStart(context: TracingSpanContext): Promise<void> | void;

  onEvent(
    context: TracingSpanContext,
    event: TracingSpanEvent<TEvent>,
  ): Promise<void> | void;

  onFinish(
    context: TracingSpanContext,
    events: TracingSpanEvent<TEvent>[],
  ): Promise<void> | void;
}

export type TracingStartCallback = TracingReporter['onStart'];

export type TracingEventCallback<TEvent extends Record<string, unknown> = any> =
  TracingReporter<TEvent>['onEvent'];

export type TracingFinishCallback<
  TEvent extends Record<string, unknown> = any,
> = TracingReporter<TEvent>['onFinish'];
