import { applyDecorators } from '@nestjs/common';
import { DisableTracingExtractor } from './disable-tracing-extractor.decorator';
import { DisableTracingLogger } from './disable-tracing-logger.decorator';

export function DisableTracing() {
  return applyDecorators(DisableTracingExtractor(), DisableTracingLogger());
}
