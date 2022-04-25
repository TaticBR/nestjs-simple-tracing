import { ExecutionContext } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'http';
import { TracingLogger } from '..';
import {
  TracingContext,
  TracingService,
  TracingSpan,
  TracingSpanKind,
} from '../..';

export class HttpTracingLogger implements TracingLogger<ExecutionContext> {
  start(
    carrier: ExecutionContext,
    tracer: TracingService,
    tracingContext?: Partial<TracingContext>,
  ): TracingSpan | undefined {
    if (carrier.getType() !== 'http') {
      return;
    }

    const operation = `${carrier.getClass().name}.${carrier.getHandler().name}`;
    const request = carrier.switchToHttp().getRequest<IncomingMessage>();

    const span = tracer.startSpan(operation, {
      parent: tracingContext,
      tags: {
        'span.kind': TracingSpanKind.HTTP,
        'http.url': this.getRequestUrl(request),
        'http.method': request.method,
      },
    });
    span.log('http.request', (request as any).body);
    return span;
  }

  onNext(carrier: ExecutionContext, span: TracingSpan, payload: unknown): void {
    if (carrier.getType() !== 'http') {
      return;
    }

    const response = carrier.switchToHttp().getResponse<ServerResponse>();
    response.once('finish', () => {
      span.addTags({
        'http.status_code': response.statusCode,
      });
      span.log('http.response', payload);
    });
  }

  onError(carrier: ExecutionContext, span: TracingSpan, error: unknown): void {
    if (carrier.getType() !== 'http') {
      return;
    }

    const response = carrier.switchToHttp().getResponse<ServerResponse>();
    response.once('finish', () => {
      span.addTags({
        'http.status_code': response.statusCode,
        error: true,
      });
      span.log('http.response.error', error);
    });
  }

  finalize(carrier: ExecutionContext, span: TracingSpan): void {
    if (carrier.getType() !== 'http') {
      return;
    }

    const response = carrier.switchToHttp().getResponse<ServerResponse>();
    response.once('finish', () => {
      span.finish();
    });
  }

  private getRequestUrl(request: IncomingMessage): string | undefined {
    try {
      const url = new URL(request.url ?? '', `http://${request.headers.host}`);
      return url.toString();
    } catch (_e) {
      return request.url;
    }
  }
}
