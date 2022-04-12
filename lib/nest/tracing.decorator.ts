import {
  applyDecorators,
  ExecutionContext,
  UseInterceptors,
} from '@nestjs/common';
import {
  AdapterTracingExtractor,
  StandardTracingExtractor,
  TracingExtractor,
} from '..';
import {
  TracingDecoratorOptions,
  TracingExtractorOptions,
} from './tracing-decorator-options.interface';
import { TracingExtractorInterceptor } from './tracing-extractor.interceptor';
import { TracingLoggerInterceptor } from './tracing-logger.interceptor';
import { UseTracingExtractor } from './use-tracing-extractor.decorator';
import { UseTracingLogger } from './use-tracing-logger.decorator';

export function Tracing<TCarrier>(options: TracingDecoratorOptions<TCarrier>) {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [];

  const extractor = createExtractor(options);
  if (extractor) {
    decorators.push(UseTracingExtractor(extractor));
  }

  if (options.logger) {
    decorators.push(UseTracingLogger(options.logger));
  }

  return applyDecorators(
    UseInterceptors(TracingExtractorInterceptor, TracingLoggerInterceptor),
    ...decorators,
  );
}

function createExtractor<TCarrier>(
  options: TracingExtractorOptions<TCarrier>,
): TracingExtractor<ExecutionContext> | undefined {
  if (options.extractor && options.adapter) {
    return new AdapterTracingExtractor(options.extractor, options.adapter);
  }
  if (options.adapter) {
    return new AdapterTracingExtractor(
      new StandardTracingExtractor(),
      options.adapter,
    );
  }
  if (options.extractor) {
    return options.extractor;
  }
}
