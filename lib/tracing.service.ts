import { randomBytes } from 'crypto';
import { TracingStartCallback } from '.';
import { TracingContext } from './tracing-context.interface';
import {
  CustomTracingEvents,
  StandardTracingEvents,
  TracingEvents,
} from './tracing-events.interface';
import { TracingExtractor } from './tracing-extractor.interface';
import { TracingInjector } from './tracing-injector.interface';
import {
  TracingFinishCallback,
  TracingEventCallback,
  TracingReporter,
} from './tracing-reporter.interface';
import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanEvent } from './tracing-span-event.interface';
import { TracingTags } from './tracing-tags.interface';
import { TracingConfig, TracingIdFactory } from './tracing.config';

export const DEFAULT_ID_FACTORY: TracingIdFactory = {
  newTraceId(): string {
    return randomBytes(16).toString('hex');
  },

  newSpanId(): string {
    return randomBytes(8).toString('hex');
  },
};

export type TracingSpanOptions = {
  parent?: TracingContext;
  startTime?: number;
  tags?: TracingTags;
};

export class TracingService<TEvent extends TracingEvents = TracingEvents> {
  private readonly serviceName: string;
  private readonly idFactory: TracingIdFactory;
  private readonly reporter?: TracingReporter<TEvent>;
  private readonly tags: TracingTags;

  constructor(config: TracingConfig<TEvent>) {
    this.serviceName = config.serviceName;
    this.idFactory = config.idFactory ?? DEFAULT_ID_FACTORY;
    this.reporter = config.reporter;
    this.tags = config.tags ?? {};
  }

  public startSpan(
    operation: string,
    options?: TracingSpanOptions,
  ): TracingSpan<TEvent> {
    return new TracingSpan(
      {
        serviceName: this.serviceName,
        operation,
        traceId: options?.parent?.traceId ?? this.idFactory.newTraceId(),
        parentId: options?.parent?.spanId,
        spanId: this.idFactory.newSpanId(),
        referenceId: options?.parent?.referenceId,
        startTime: options?.startTime ?? Date.now(),
        tags: {
          ...this.tags,
          ...options?.tags,
        },
      },
      this.onSpanStart.bind(this),
      this.onSpanEvent.bind(this),
      this.onSpanFinish.bind(this),
    );
  }

  public extract<TCarrier>(
    extractor: TracingExtractor<TCarrier>,
    carrier: TCarrier,
  ): TracingContext {
    const partialContext = extractor.extract(carrier);
    return {
      ...partialContext,
      traceId: partialContext?.traceId ?? this.idFactory.newTraceId(),
      spanId: partialContext?.spanId ?? this.idFactory.newSpanId(),
    };
  }

  public inject<TCarrier>(
    context: TracingContext,
    injector: TracingInjector<TCarrier>,
    carrier: TCarrier,
  ): void {
    injector.inject(context, carrier);
  }

  private async onSpanStart(context: TracingSpanContext): Promise<void> {
    if (this.reporter) {
      await this.reporter.onStart(context);
    }
  }

  private async onSpanEvent(
    context: TracingSpanContext,
    event: TracingSpanEvent<TEvent>,
  ): Promise<void> {
    if (this.reporter) {
      await this.reporter.onEvent(context, event);
    }
  }

  private async onSpanFinish(
    context: TracingSpanContext,
    events: TracingSpanEvent<TEvent>[],
  ): Promise<void> {
    if (this.reporter) {
      await this.reporter.onFinish(context, events);
    }
  }
}

export class TracingSpan<TEvent extends TracingEvents = TracingEvents> {
  readonly #context: TracingSpanContext;
  readonly #events: TracingSpanEvent<TEvent>[] = [];

  constructor(
    context: TracingSpanContext,
    onStart: TracingStartCallback,
    private readonly onEvent: TracingEventCallback<TEvent>,
    private readonly onFinish: TracingFinishCallback<TEvent>,
  ) {
    this.#context = context;
    onStart(context);
  }

  public get context(): Readonly<TracingSpanContext> {
    return this.#context;
  }

  public get events(): readonly TracingSpanEvent<TEvent>[] {
    return this.#events;
  }

  public addTags(tags: TracingTags): this {
    if (!this.#context.tags) {
      this.#context.tags = {};
    }
    for (const [key, value] of Object.entries(tags)) {
      this.#context.tags[key] = value;
    }
    return this;
  }

  public log<
    TName extends keyof StandardTracingEvents,
    TPayload extends StandardTracingEvents[TName],
  >(event: TName, payload: TPayload, time?: number): this;

  public log<
    TName extends keyof CustomTracingEvents,
    TPayload extends CustomTracingEvents[TName],
  >(event: TName, payload: TPayload, time?: number): this;

  public log<TName extends keyof TEvent, TPayload extends TEvent[TName]>(
    event: TName,
    payload: TPayload,
    time?: number,
  ): this;

  public log<TName extends keyof TEvent, TPayload extends TEvent[TName]>(
    event: TName,
    payload: TPayload,
    time?: number,
  ): this {
    const eventTime = time ?? Date.now();
    const log: TracingSpanEvent<TEvent> = {
      name: event,
      payload,
      time: eventTime,
    };
    this.#events.push(log);
    this.onEvent(this.context, log);
    return this;
  }

  public finish(finishTime?: number): Promise<void> | void {
    this.#context.finishTime = finishTime ?? Date.now();
    return this.onFinish(this.context, this.#events);
  }
}
