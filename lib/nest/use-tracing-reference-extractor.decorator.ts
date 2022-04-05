import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { TracingReferenceExtractor } from './tracing-reference-extract.interface';
import { TRACING_REFERENCE_EXTRACTOR_KEY } from './tracing.constants';

export const UseTracingReferenceExtractor = (
  extract: TracingReferenceExtractor<ExecutionContext>,
) => SetMetadata(TRACING_REFERENCE_EXTRACTOR_KEY, extract);
