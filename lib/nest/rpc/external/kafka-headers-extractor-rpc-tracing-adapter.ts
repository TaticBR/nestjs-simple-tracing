import { RpcArgumentsHost } from '@nestjs/common/interfaces';
import { KafkaContext } from '@nestjs/microservices';
import { AbstractRpcTracingAdapter } from '..';
import { TracingGetter } from '../../..';

export class KafkaHeadersExtractorRpcTracingAdapter extends AbstractRpcTracingAdapter<TracingGetter> {
  protected override _createResponse(
    argumentsHost: RpcArgumentsHost,
  ): TracingGetter | undefined {
    const context = argumentsHost.getContext();
    if (!(context instanceof KafkaContext)) {
      return;
    }

    const { headers } = context.getMessage();
    if (!headers) {
      return;
    }

    return (key: string): string | undefined => {
      const value = headers[key];
      return Buffer.isBuffer(value) ? value.toString() : value;
    };
  }
}
