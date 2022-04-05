import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { TracingLogger } from './tracing-logger.interface';
import { TRACING_LOGGER_KEY } from './tracing.constants';

export const UseTracingLogger = (logger: TracingLogger<ExecutionContext>) =>
  SetMetadata(TRACING_LOGGER_KEY, logger);
