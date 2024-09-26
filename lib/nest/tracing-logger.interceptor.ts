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
import { MonoTypeOperatorFunction, Observable, tap } from 'rxjs';
import { TracingService, TracingSpan } from '..';
import { TracingContextRef } from './tracing-context-ref.interface';
import { TracingOperationOptions } from './tracing-decorator-options.interface';
import { TracingLogger } from './tracing-logger.interface';
import {
  DISABLE_TRACING_LOGGER_KEY,
  TRACING_CONTEXT,
  TRACING_LOGGER_KEY,
  TRACING_OPERATION_KEY,
} from './tracing.constants';

@Injectable({ scope: Scope.REQUEST })
export class TracingLoggerInterceptor implements NestInterceptor {
  readonly #logger = new Logger(TracingLoggerInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly tracingService: TracingService,
    @Inject(forwardRef(() => TRACING_CONTEXT))
    private readonly tracingContextRef: TracingContextRef,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const disabled = this.reflector.getAllAndOverride<boolean>(
      DISABLE_TRACING_LOGGER_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (disabled) {
      return next.handle();
    }

    const tracingLogger = this.reflector.getAllAndOverride<
      TracingLogger<ExecutionContext> | undefined
    >(TRACING_LOGGER_KEY, [context.getHandler(), context.getClass()]);

    if (tracingLogger) {
      const operation = `${context.getClass().name}.${
        context.getHandler().name
      }`;

      // TODO: Consider using reflector.getAllAndMerge
      const operationOptions = this.reflector.getAllAndOverride<
        TracingOperationOptions | undefined
      >(TRACING_OPERATION_KEY, [context.getHandler(), context.getClass()]);

      try {
        const span = tracingLogger.start(
          context,
          this.tracingService,
          this.tracingContextRef.context,
          operationOptions,
        );

        if (span) {
          this.tracingContextRef.context = span.context;
          return next
            .handle()
            .pipe(
              this.createLoggerTap(context, tracingLogger, span, operation),
            );
        }
      } catch (err) {
        this.#logger.error(`Tracing log failed at ${operation}`, err.stack);
      }
    }

    return next.handle();
  }

  private createLoggerTap<T>(
    context: ExecutionContext,
    tracingLogger: TracingLogger<ExecutionContext>,
    span: TracingSpan,
    operation: string,
  ): MonoTypeOperatorFunction<T> {
    return tap({
      next: (payload) =>
        this.safeExec(
          () => tracingLogger.onNext(context, span, payload),
          operation,
          'onNext',
        ),
      error: (err) =>
        this.safeExec(
          () => tracingLogger.onError(context, span, err),
          operation,
          'onError',
        ),
      finalize: () =>
        this.safeExec(
          () => tracingLogger.finalize(context, span),
          operation,
          'finalize',
        ),
    });
  }

  private safeExec<R>(
    func: () => R,
    operation: string,
    action: string,
  ): R | undefined {
    try {
      return func();
    } catch (error) {
      this.#logger.error(
        `Tracing log (${action}) failed at ${operation}`,
        error.stack,
      );
    }
  }
}
