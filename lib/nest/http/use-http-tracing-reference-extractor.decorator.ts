import { applyDecorators } from '@nestjs/common';
import { UseTracingReferenceExtractor } from '..';
import {
  HttpTracingRefereceExtractFunction,
  HttpTracingReferenceExtractor,
} from './http-tracing-reference-extractor';

export function UseHttpTracingReferenceExtractor<TRequest>(
  extract:
    | HttpTracingRefereceExtractFunction<TRequest>
    | HttpTracingRefereceExtractFunction<TRequest>[],
) {
  const extractFunctions = Array.isArray(extract) ? extract : [extract];
  const extractor = new HttpTracingReferenceExtractor(...extractFunctions);

  return applyDecorators(
    UseTracingReferenceExtractor((carrier) => extractor.extract(carrier)),
  );
}
