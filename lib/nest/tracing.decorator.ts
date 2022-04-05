import {
  applyDecorators,
  ExecutionContext,
  UseInterceptors,
} from '@nestjs/common';
import { TracingExtractor } from '..';
import { TracingExtractorInterceptor } from './tracing-extractor.interceptor';
import { TracingLoggerInterceptor } from './tracing-logger.interceptor';
import { TracingLogger } from './tracing-logger.interface';
import { UseTracingExtractor } from './use-tracing-extractor.decorator';
import { UseTracingLogger } from './use-tracing-logger.decorator';

export interface TracingDecoratorOptions {
  extractor?:
    | TracingExtractor<ExecutionContext>
    | TracingExtractor<ExecutionContext>[];
  logger?: TracingLogger<ExecutionContext>;
}

export function Tracing(options: TracingDecoratorOptions) {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [];

  if (options.extractor) {
    const extractors = Array.isArray(options.extractor)
      ? options.extractor
      : [options.extractor];
    decorators.push(UseTracingExtractor(extractors[0], ...extractors.slice(1)));
  }

  if (options.logger) {
    decorators.push(UseTracingLogger(options.logger));
  }

  return applyDecorators(
    UseInterceptors(TracingExtractorInterceptor, TracingLoggerInterceptor),
    ...decorators,
  );
}
