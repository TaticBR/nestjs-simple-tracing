import { applyDecorators, ExecutionContext } from '@nestjs/common';
import {
  AdapterOnlyOptions,
  ExtractorAndAdapterOptions,
  ExtractorOnlyOptions,
  Tracing,
  TracingDecoratorOptions,
  TracingLoggerOptions,
} from '..';
import { AdapterTracingExtractor, StandardTracingExtractor } from '../..';
import { HttpTracingLogger } from './http-tracing-logger';
import { IncomingMessageHeadersExtractorHttpTracingAdapter } from './incoming-message-headers-extractor-http-tracing-adapter';

export function HttpTracing(): ReturnType<typeof applyDecorators>;

export function HttpTracing<TCarrier extends ExecutionContext>(
  options: AdapterOnlyOptions<TCarrier> & TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function HttpTracing<TCarrier extends ExecutionContext>(
  options: ExtractorOnlyOptions<TCarrier> & TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function HttpTracing<TCarrier>(
  options: ExtractorAndAdapterOptions<TCarrier> & TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function HttpTracing<TCarrier>(
  options: TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function HttpTracing<TCarrier = ExecutionContext>(
  options?: TracingDecoratorOptions<TCarrier>,
) {
  if (!options) {
    return applyDecorators(
      Tracing({
        extractor: new AdapterTracingExtractor(
          StandardTracingExtractor.getInstance(),
          IncomingMessageHeadersExtractorHttpTracingAdapter.getInstance(),
        ),
        logger: new HttpTracingLogger(),
      }),
    );
  }

  if (!options.adapter && !options.extractor) {
    options.extractor = new AdapterTracingExtractor(
      StandardTracingExtractor.getInstance(),
      IncomingMessageHeadersExtractorHttpTracingAdapter.getInstance(),
    );
  }
  if (!options.logger) {
    options.logger = new HttpTracingLogger();
  }
  return applyDecorators(Tracing(options));
}
