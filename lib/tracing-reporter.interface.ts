import { TracingEvents } from './tracing-events.interface';
import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanEvent } from './tracing-span-event.interface';

export interface TracingReporter<TEvent extends TracingEvents = TracingEvents> {
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

export type TracingEventCallback<TEvent extends TracingEvents = TracingEvents> =
  TracingReporter<TEvent>['onEvent'];

export type TracingFinishCallback<
  TEvent extends TracingEvents = TracingEvents,
> = TracingReporter<TEvent>['onFinish'];
