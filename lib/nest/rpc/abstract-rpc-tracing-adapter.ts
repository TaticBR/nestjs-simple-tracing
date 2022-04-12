import { ExecutionContext, Logger } from '@nestjs/common';
import { RpcArgumentsHost } from '@nestjs/common/interfaces';
import { TracingAdapter } from '../..';

export abstract class AbstractRpcTracingAdapter<TCarrierOut>
  implements TracingAdapter<ExecutionContext, TCarrierOut>
{
  readonly #logger = new Logger(AbstractRpcTracingAdapter.name);

  adapt(carrier: ExecutionContext): TCarrierOut | undefined {
    if (carrier.getType() !== 'rpc') {
      this.#logger.warn(
        `RPC tracing adapter defined for context of type "${carrier.getType()}" at ${
          carrier.getClass().name
        }.${carrier.getHandler().name}`,
      );
      return;
    }

    const argumentsHost = carrier.switchToRpc();
    return this._createResponse(argumentsHost);
  }

  protected abstract _createResponse(
    argumentsHost: RpcArgumentsHost,
  ): TCarrierOut | undefined;
}
