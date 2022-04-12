import { ExecutionContext, Logger } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { TracingAdapter } from '../..';

export abstract class AbstractHttpTracingAdapter<TCarrierOut>
  implements TracingAdapter<ExecutionContext, TCarrierOut>
{
  readonly #logger = new Logger(AbstractHttpTracingAdapter.name);

  adapt(carrier: ExecutionContext): TCarrierOut | undefined {
    if (carrier.getType() !== 'http') {
      this.#logger.warn(
        `HTTP tracing adapter defined for context of type "${carrier.getType()}" at ${
          carrier.getClass().name
        }.${carrier.getHandler().name}`,
      );
      return;
    }

    const argumentsHost = carrier.switchToHttp();
    return this._createResponse(argumentsHost);
  }

  protected abstract _createResponse(
    argumentsHost: HttpArgumentsHost,
  ): TCarrierOut | undefined;
}
