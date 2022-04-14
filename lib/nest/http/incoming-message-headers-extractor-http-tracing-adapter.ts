import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { IncomingMessage } from 'http';
import { TracingGetter } from '../..';
import { AbstractHttpTracingAdapter } from './abstract-http-tracing-adapter';

export class IncomingMessageHeadersExtractorHttpTracingAdapter extends AbstractHttpTracingAdapter<TracingGetter> {
  private static readonly INSTANCE =
    new IncomingMessageHeadersExtractorHttpTracingAdapter();

  private constructor() {
    super();
  }

  protected override _createResponse(
    argumentsHost: HttpArgumentsHost,
  ): TracingGetter {
    const request = argumentsHost.getRequest<IncomingMessage>();

    return (key: string): string | undefined => {
      const headerKey = key.toLowerCase();
      const headerValue = request.headers[headerKey];
      return Array.isArray(headerValue) ? headerValue[0] : headerValue;
    };
  }

  public static getInstance(): IncomingMessageHeadersExtractorHttpTracingAdapter {
    return this.INSTANCE;
  }
}
