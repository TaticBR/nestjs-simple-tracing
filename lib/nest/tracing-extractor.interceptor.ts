import {
  CallHandler,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
  TracingContext,
  TracingExtractor,
  TracingReferenceExtractorOptions,
  TracingService,
} from '..';
import { TracingContextRef } from './tracing-context-ref.interface';
import { TracingReferenceExtractor } from './tracing-reference-extract.interface';
import {
  DISABLE_TRACING_EXTRACTOR_KEY,
  TRACING_CONTEXT,
  TRACING_EXTRACTOR_KEY,
  TRACING_REFERENCE_EXTRACTOR_KEY,
} from './tracing.constants';

type TracingReferenceExtractorConfig = [
  TracingReferenceExtractor<ExecutionContext>,
  TracingReferenceExtractorOptions | undefined,
];

@Injectable({ scope: Scope.REQUEST })
export class TracingExtractorInterceptor implements NestInterceptor {
  readonly #logger = new Logger(TracingExtractorInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tracingService: TracingService,
    @Inject(forwardRef(() => TRACING_CONTEXT))
    private readonly tracingContextRef: TracingContextRef,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const disabled = this.reflector.getAllAndOverride<boolean>(
      DISABLE_TRACING_EXTRACTOR_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (disabled) {
      return next.handle();
    }

    const tracingExtractor = this.reflector.getAllAndOverride<
      TracingExtractor<ExecutionContext> | undefined
    >(TRACING_EXTRACTOR_KEY, [context.getHandler(), context.getClass()]);

    if (tracingExtractor) {
      const operation = `${context.getClass().name}.${
        context.getHandler().name
      }`;

      try {
        const tracingContext = this.tracingService.extract(
          tracingExtractor,
          context,
        );

        try {
          const referenceId = this.extractReferenceId(context, tracingContext);
          if (referenceId) {
            tracingContext.referenceId = referenceId;
          }
        } catch (err) {
          this.#logger.error(
            `Tracing reference extraction failed at ${operation}`,
            err.stack,
          );
        }

        this.tracingContextRef.context = tracingContext;
      } catch (err) {
        this.#logger.error(
          `Tracing extraction failed at ${operation}`,
          err.stack,
        );
      }
    }

    return next.handle();
  }

  private extractReferenceId(
    context: ExecutionContext,
    tracingContext: Partial<TracingContext>,
  ): string | undefined {
    const [extractTracingReference, tracingReferenceOptions] =
      this.reflector.getAllAndOverride<
        TracingReferenceExtractorConfig | undefined
      >(TRACING_REFERENCE_EXTRACTOR_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // No extractor defined
    if (!extractTracingReference) {
      return;
    }
    // Reference already exists and override is disabled
    if (tracingContext.referenceId && !tracingReferenceOptions?.override) {
      return;
    }

    const referenceId = extractTracingReference(context);
    // No reference extracted
    if (!referenceId) {
      return;
    }

    const referencePrefix = tracingReferenceOptions?.prefix ?? '';
    const referenceSuffix = tracingReferenceOptions?.suffix ?? '';
    return `${referencePrefix}${referenceId}${referenceSuffix}`;
  }
}
