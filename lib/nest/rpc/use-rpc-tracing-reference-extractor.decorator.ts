import { applyDecorators } from '@nestjs/common';
import { UseTracingReferenceExtractor } from '..';
import {
  RpcTracingRefereceExtractFunction,
  RpcTracingReferenceExtractor,
} from './rpc-tracing-reference-extractor';

export function UseRpcTracingReferenceExtractor<TPayload, TContext>(
  extract:
    | RpcTracingRefereceExtractFunction<TPayload, TContext>
    | RpcTracingRefereceExtractFunction<TPayload, TContext>[],
) {
  const extractFunctions = Array.isArray(extract) ? extract : [extract];
  const extractor = new RpcTracingReferenceExtractor(...extractFunctions);

  return applyDecorators(
    UseTracingReferenceExtractor((carrier) => extractor.extract(carrier)),
  );
}
