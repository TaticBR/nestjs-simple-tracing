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
import { TracingExtractor, TracingService } from '..';
import { TracingContextRef } from './tracing-context-ref.interface';
import { TracingReferenceExtractor } from './tracing-reference-extract.interface';
import {
  DISABLE_TRACING_EXTRACTOR_KEY,
  TRACING_CONTEXT,
  TRACING_EXTRACTOR_KEY,
  TRACING_REFERENCE_EXTRACTOR_KEY,
} from './tracing.constants';

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
      TracingExtractor<ExecutionContext>
    >(TRACING_EXTRACTOR_KEY, [context.getHandler(), context.getClass()]);

    if (tracingExtractor) {
      try {
        const tracingContext = this.tracingService.extract(
          tracingExtractor,
          context,
        );

        const extractTracingReference = this.reflector.getAllAndOverride<
          TracingReferenceExtractor<ExecutionContext> | undefined
        >(TRACING_REFERENCE_EXTRACTOR_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (extractTracingReference) {
          tracingContext.referenceId = extractTracingReference(context);
        }

        this.tracingContextRef.context = tracingContext;
      } catch (err) {
        const operation = `${context.getClass().name}.${
          context.getHandler().name
        }`;
        this.#logger.error(
          `Tracing extraction failed at ${operation}`,
          err.stack,
        );
      }
    }

    return next.handle();
  }
}
