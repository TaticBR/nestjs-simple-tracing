import { applyDecorators, ExecutionContext } from '@nestjs/common';
import { Tracing } from '..';
import { TracingExtractor } from '../..';
import { HttpTracingLogger } from './http-tracing-logger';

export function HttpTracing(
  extractor:
    | TracingExtractor<ExecutionContext>
    | TracingExtractor<ExecutionContext>[],
) {
  return applyDecorators(
    Tracing({
      extractor,
      logger: new HttpTracingLogger(),
    }),
  );
}
