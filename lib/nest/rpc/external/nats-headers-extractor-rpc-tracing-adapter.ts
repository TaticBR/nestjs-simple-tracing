import { RpcArgumentsHost } from '@nestjs/common/interfaces';
import { NatsContext } from '@nestjs/microservices';
import { AbstractRpcTracingAdapter } from '..';
import { TracingGetter } from '../../..';

export class NatsHeadersExtractorRpcTracingAdapter extends AbstractRpcTracingAdapter<TracingGetter> {
  private static readonly INSTANCE =
    new NatsHeadersExtractorRpcTracingAdapter();

  private constructor() {
    super();
  }

  protected _createResponse(
    argumentsHost: RpcArgumentsHost,
  ): TracingGetter | undefined {
    const context = argumentsHost.getContext();
    if (!(context instanceof NatsContext)) {
      return;
    }

    const headers = context.getHeaders();
    if (!headers || typeof headers !== 'object') {
      return;
    }

    return (key: string): string | undefined => {
      const value = headers[key];
      return this.toString(value);
    };
  }

  protected toString(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value[0];
    }
  }

  public static getInstance(): NatsHeadersExtractorRpcTracingAdapter {
    return this.INSTANCE;
  }
}
