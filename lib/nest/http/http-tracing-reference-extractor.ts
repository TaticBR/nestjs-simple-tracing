import { ExecutionContext, Logger } from '@nestjs/common';

export type HttpTracingRefereceExtractFunction<TRequest> = (
  request: TRequest,
) => string | undefined;

export class HttpTracingReferenceExtractor<TRequest> {
  readonly #logger = new Logger(HttpTracingReferenceExtractor.name);

  private readonly extractFunctions: HttpTracingRefereceExtractFunction<TRequest>[] =
    [];

  constructor(
    ...extractFunctions: HttpTracingRefereceExtractFunction<TRequest>[]
  ) {
    this.extractFunctions = extractFunctions;
  }

  extract(carrier: ExecutionContext): string | undefined {
    if (carrier.getType() !== 'http') {
      this.#logger.warn(
        `HTTP tracing reference extractor defined for context of type "${carrier.getType()}" at ${
          carrier.getClass().name
        }.${carrier.getHandler().name}`,
      );
      return;
    }

    const request = carrier.switchToHttp().getRequest<TRequest>();

    for (const extract of this.extractFunctions) {
      const referenceId = extract(request);
      if (referenceId) {
        return referenceId;
      }
    }
  }
}
