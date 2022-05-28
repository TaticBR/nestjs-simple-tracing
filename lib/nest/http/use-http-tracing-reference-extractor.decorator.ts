import { applyDecorators } from '@nestjs/common';
import {
  TracingReferenceExtractorOptions,
  UseTracingReferenceExtractor,
} from '..';
import {
  HttpTracingRefereceExtractFunction,
  HttpTracingReferenceExtractor,
} from './http-tracing-reference-extractor';

export function UseHttpTracingReferenceExtractor<TRequest>(
  extract:
    | HttpTracingRefereceExtractFunction<TRequest>
    | HttpTracingRefereceExtractFunction<TRequest>[],
  options?: TracingReferenceExtractorOptions,
) {
  const extractFunctions = Array.isArray(extract) ? extract : [extract];
  const extractor = new HttpTracingReferenceExtractor(...extractFunctions);

  return applyDecorators(
    UseTracingReferenceExtractor(
      (carrier) => extractor.extract(carrier),
      options,
    ),
  );
}
