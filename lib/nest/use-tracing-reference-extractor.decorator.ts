import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { TracingReferenceExtractorOptions } from './tracing-decorator-options.interface';
import { TracingReferenceExtractor } from './tracing-reference-extract.interface';
import { TRACING_REFERENCE_EXTRACTOR_KEY } from './tracing.constants';

export const UseTracingReferenceExtractor = (
  extract: TracingReferenceExtractor<ExecutionContext>,
  options?: TracingReferenceExtractorOptions,
) => SetMetadata(TRACING_REFERENCE_EXTRACTOR_KEY, [extract, options]);
