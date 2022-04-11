import { randomBytes } from 'crypto';
import { TracingStartCallback } from '.';
import { TracingContext } from './tracing-context.interface';
import { TracingExtractor } from './tracing-extractor.interface';
import { TracingInjector } from './tracing-injector.interface';
import {
  TracingFinishCallback,
  TracingLogCallback,
  TracingReporter,
} from './tracing-reporter.interface';
import { TracingSpanContext } from './tracing-span-context.interface';
import { TracingSpanLog } from './tracing-span-log.interface';
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

export class TracingService<TPayload = unknown, TEvent extends string = any> {
  private readonly serviceName: string;
  private readonly idFactory: TracingIdFactory;
  private readonly reporter?: TracingReporter<TPayload, TEvent>;
  private readonly tags: TracingTags;

  constructor(config: TracingConfig) {
    this.serviceName = config.serviceName;
    this.idFactory = config.idFactory ?? DEFAULT_ID_FACTORY;
    this.reporter = config.reporter;
    this.tags = config.tags ?? {};
  }

  public startSpan(
    operation: string,
    options?: TracingSpanOptions,
  ): TracingSpan<TPayload, TEvent> {
    return new TracingSpan(
      {
        serviceName: this.serviceName,
        operation,
        traceId: options?.parent?.traceId ?? this.idFactory.newTraceId(),
        parentSpanId: options?.parent?.spanId,
        spanId: this.idFactory.newSpanId(),
        startTime: options?.startTime ?? Date.now(),
        tags: {
          ...this.tags,
          ...options?.tags,
        },
      },
      this.onSpanStart.bind(this),
      this.onSpanLog.bind(this),
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

  private async onSpanLog(
    context: TracingSpanContext,
    log: TracingSpanLog<TPayload, TEvent>,
  ): Promise<void> {
    if (this.reporter) {
      await this.reporter.onLog(context, log);
    }
  }

  private async onSpanFinish(
    context: TracingSpanContext,
    logs: TracingSpanLog<TPayload, TEvent>[],
  ): Promise<void> {
    if (this.reporter) {
      await this.reporter.onFinish(context, logs);
    }
  }
}

export class TracingSpan<TPayload = unknown, TEvent extends string = any> {
  readonly #context: TracingSpanContext;
  readonly #logs: TracingSpanLog<TPayload, TEvent>[] = [];

  constructor(
    context: TracingSpanContext,
    onStart: TracingStartCallback,
    private readonly onLog: TracingLogCallback<TPayload, TEvent>,
    private readonly onFinish: TracingFinishCallback<TPayload, TEvent>,
  ) {
    this.#context = context;
    onStart(context);
  }

  public get context(): Readonly<TracingSpanContext> {
    return this.#context;
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

  public log(event: TEvent, payload?: TPayload, time?: number): this {
    const eventTime = time ?? Date.now();
    const log: TracingSpanLog<TPayload, TEvent> = {
      event,
      payload,
      eventTime,
    };
    this.#logs.push(log);
    this.onLog(this.context, log);
    return this;
  }

  public finish(finishTime?: number): Promise<void> | void {
    this.#context.finishTime = finishTime ?? Date.now();
    return this.onFinish(this.context, this.#logs);
  }
}
