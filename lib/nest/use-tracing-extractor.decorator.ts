import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { TracingExtractor } from '..';
import { CompositeTracingExtractor } from './composite-tracing-extractor';
import { TRACING_EXTRACTOR_KEY } from './tracing.constants';

export const UseTracingExtractor = (
  extractor: TracingExtractor<ExecutionContext>,
  ...otherExtractors: TracingExtractor<ExecutionContext>[]
) =>
  SetMetadata(
    TRACING_EXTRACTOR_KEY,
    otherExtractors.length > 1
      ? new CompositeTracingExtractor(extractor, ...otherExtractors)
      : extractor,
  );
