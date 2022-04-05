import { ExecutionContext, Logger } from '@nestjs/common';

export type RpcTracingRefereceExtractFunction<TPayload, TContext> = (
  payload: TPayload,
  context: TContext,
) => string | undefined;

export class RpcTracingReferenceExtractor<TPayload, TContext> {
  readonly #logger = new Logger(RpcTracingReferenceExtractor.name);

  private readonly extractFunctions: RpcTracingRefereceExtractFunction<
    TPayload,
    TContext
  >[] = [];

  constructor(
    ...extractFunctions: RpcTracingRefereceExtractFunction<TPayload, TContext>[]
  ) {
    this.extractFunctions = extractFunctions;
  }

  extract(carrier: ExecutionContext): string | undefined {
    if (carrier.getType() !== 'rpc') {
      this.#logger.warn(
        `RPC tracing reference extractor defined for context of type "${carrier.getType()}" at ${
          carrier.getClass().name
        }.${carrier.getHandler().name}`,
      );
      return;
    }

    const rpc = carrier.switchToRpc();
    const payload = rpc.getData<TPayload>();
    const context = rpc.getContext<TContext>();

    for (const extract of this.extractFunctions) {
      const referenceId = extract(payload, context);
      if (referenceId) {
        return referenceId;
      }
    }
  }
}
