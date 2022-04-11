import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanLog } from './tracing-span-log.interface';

export interface TracingReporter<
  TPayload = unknown,
  TEvent extends string = any,
> {
  onStart(context: TracingSpanContext): Promise<void> | void;

  onLog(
    context: TracingSpanContext,
    log: TracingSpanLog<TPayload, TEvent>,
  ): Promise<void> | void;

  onFinish(
    context: TracingSpanContext,
    logs: TracingSpanLog<TPayload, TEvent>[],
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
