import { applyDecorators } from '@nestjs/common';
import {
  TracingReferenceExtractorOptions,
  UseTracingReferenceExtractor,
} from '..';
import {
  RpcTracingRefereceExtractFunction,
  RpcTracingReferenceExtractor,
} from './rpc-tracing-reference-extractor';

export function UseRpcTracingReferenceExtractor<TPayload, TContext>(
  extract:
    | RpcTracingRefereceExtractFunction<TPayload, TContext>
    | RpcTracingRefereceExtractFunction<TPayload, TContext>[],
  options?: TracingReferenceExtractorOptions,
) {
  const extractFunctions = Array.isArray(extract) ? extract : [extract];
  const extractor = new RpcTracingReferenceExtractor(...extractFunctions);

  return applyDecorators(
    UseTracingReferenceExtractor(
      (carrier) => extractor.extract(carrier),
      options,
    ),
  );
}
