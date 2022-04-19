import { RpcArgumentsHost } from '@nestjs/common/interfaces';
import { TracingGetter } from '../..';
import { AbstractRpcTracingAdapter } from './abstract-rpc-tracing-adapter';

export class PayloadExtractorRpcTracingAdapter extends AbstractRpcTracingAdapter<TracingGetter> {
  constructor(private readonly propertyName: string) {
    super();
  }

  protected _createResponse(
    argumentsHost: RpcArgumentsHost,
  ): TracingGetter | undefined {
    const data = argumentsHost.getData();
    if (!data || typeof data !== 'object') {
      return;
    }

    const carrier = data[this.propertyName];
    if (!carrier || typeof carrier !== 'object') {
      return;
    }

    return (key: string): string | undefined => {
      const value: unknown = carrier[key];
      if (!value) {
        return;
      }
      return typeof value === 'string' ? value : String(value);
    };
  }
}
