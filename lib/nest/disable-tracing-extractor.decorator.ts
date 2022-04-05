import { SetMetadata } from '@nestjs/common';
import { DISABLE_TRACING_EXTRACTOR_KEY } from './tracing.constants';

export const DisableTracingExtractor = () =>
  SetMetadata(DISABLE_TRACING_EXTRACTOR_KEY, true);
