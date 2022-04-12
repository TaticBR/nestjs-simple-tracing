import { applyDecorators, ExecutionContext } from '@nestjs/common';
import {
  AdapterOnlyOptions,
  ExtractorAndAdapterOptions,
  ExtractorOnlyOptions,
  Tracing,
  TracingDecoratorOptions,
  TracingLoggerOptions,
} from '..';
import { RpcTracingLogger } from './rpc-tracing-logger';

export function RpcTracing(): ReturnType<typeof applyDecorators>;

export function RpcTracing<TCarrier extends ExecutionContext>(
  options: AdapterOnlyOptions<TCarrier> & TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function RpcTracing<TCarrier extends ExecutionContext>(
  options: ExtractorOnlyOptions<TCarrier> & TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function RpcTracing<TCarrier>(
  options: ExtractorAndAdapterOptions<TCarrier> & TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function RpcTracing<TCarrier>(
  options: TracingLoggerOptions,
): ReturnType<typeof applyDecorators>;

export function RpcTracing<TCarrier = ExecutionContext>(
  options?: TracingDecoratorOptions<TCarrier>,
) {
  if (!options) {
    return applyDecorators(
      Tracing({
        logger: new RpcTracingLogger(),
      }),
    );
  }

  if (!options.logger) {
    options.logger = new RpcTracingLogger();
  }
  return applyDecorators(Tracing(options));
}
