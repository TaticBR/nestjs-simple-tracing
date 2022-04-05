import { applyDecorators, ExecutionContext } from '@nestjs/common';
import { Tracing } from '..';
import { TracingExtractor } from '../..';
import { RpcTracingLogger } from './rpc-tracing-logger';

export function RpcTracing(
  extractor:
    | TracingExtractor<ExecutionContext>
    | TracingExtractor<ExecutionContext>[],
) {
  return applyDecorators(
    Tracing({
      extractor,
      logger: new RpcTracingLogger(),
    }),
  );
}
