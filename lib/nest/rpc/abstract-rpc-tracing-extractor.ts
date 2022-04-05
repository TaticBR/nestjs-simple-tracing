import { ExecutionContext, Logger } from '@nestjs/common';
import { TracingContext, TracingExtractor } from '../..';

export abstract class AbstractRpcTracingExtractor<TPayload, TContext>
  implements TracingExtractor<ExecutionContext>
{
  readonly #logger = new Logger(AbstractRpcTracingExtractor.name);

  extract(carrier: ExecutionContext): Partial<TracingContext> | undefined {
    if (carrier.getType() !== 'rpc') {
      this.#logger.warn(
        `RPC tracing extractor defined for context of type "${carrier.getType()}" at ${
          carrier.getClass().name
        }.${carrier.getHandler().name}`,
      );
      return;
    }

    const rpc = carrier.switchToRpc();
    const data = rpc.getData<TPayload>();
    const context = rpc.getContext<TContext>();

    return this._extract(data, context);
  }

  protected abstract _extract(
    data: TPayload,
    context: TContext,
  ): Partial<TracingContext> | undefined;
}
