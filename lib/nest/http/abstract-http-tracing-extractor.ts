import { ExecutionContext, Logger } from '@nestjs/common';
import { TracingContext, TracingExtractor } from '../..';

export abstract class AbstractHttpTracingExtractor<TRequest>
  implements TracingExtractor<ExecutionContext>
{
  readonly #logger = new Logger(AbstractHttpTracingExtractor.name);

  extract(carrier: ExecutionContext): Partial<TracingContext> | undefined {
    if (carrier.getType() !== 'http') {
      this.#logger.warn(
        `HTTP tracing extractor defined for context of type "${carrier.getType()}" at ${
          carrier.getClass().name
        }.${carrier.getHandler().name}`,
      );
      return;
    }

    return this._extract(carrier.switchToHttp().getRequest<TRequest>());
  }

  protected abstract _extract(
    request: TRequest,
  ): Partial<TracingContext> | undefined;
}
