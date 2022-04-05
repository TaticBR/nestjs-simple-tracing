import { SetMetadata } from '@nestjs/common';
import { DISABLE_TRACING_LOGGER_KEY } from './tracing.constants';

export const DisableTracingLogger = () =>
  SetMetadata(DISABLE_TRACING_LOGGER_KEY, true);
