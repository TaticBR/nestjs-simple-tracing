import { SetMetadata } from '@nestjs/common';
import { TracingOperationOptions } from './tracing-decorator-options.interface';
import { TRACING_OPERATION_KEY } from './tracing.constants';

export const TracingOperation = (options: TracingOperationOptions) =>
  SetMetadata(TRACING_OPERATION_KEY, options);
