import { ExecutionContext } from '@nestjs/common';
import {
  KafkaContext,
  MqttContext,
  NatsContext,
  RedisContext,
  RmqContext,
  TcpContext,
} from '@nestjs/microservices';
import { TracingLogger } from '..';
import {
  TracingContext,
  TracingService,
  TracingSpan,
  TracingSpanKind,
} from '../..';

export class RpcTracingLogger implements TracingLogger<ExecutionContext> {
  start(
    carrier: ExecutionContext,
    tracer: TracingService,
    tracingContext: TracingContext,
  ): TracingSpan | undefined {
    if (carrier.getType() !== 'rpc') {
      return;
    }

    const operation = `${carrier.getClass().name}.${carrier.getHandler().name}`;
    const rpc = carrier.switchToRpc();
    const context = rpc.getContext();

    const pattern = this.getPattern(context);

    const span = tracer.startSpan(operation, {
      parent: tracingContext,
      tags: {
        'span.kind': TracingSpanKind.RPC,
        'rpc.pattern': pattern,
      },
    });
    span.log('rpc.request', rpc.getData());
    return span;
  }

  onNext(carrier: ExecutionContext, span: TracingSpan, payload: unknown): void {
    if (carrier.getType() !== 'rpc') {
      return;
    }

    span.log('rpc.response', payload);
  }

  onError(carrier: ExecutionContext, span: TracingSpan, error: unknown): void {
    if (carrier.getType() !== 'rpc') {
      return;
    }

    span.addTags({ error: true }).log('rpc.error', error);
  }

  finalize(carrier: ExecutionContext, span: TracingSpan): void {
    if (carrier.getType() !== 'rpc') {
      return;
    }

    span.finish();
  }

  protected getPattern(context: object): string | undefined {
    if (context instanceof TcpContext) {
      return context.getPattern();
    }
    if (context instanceof KafkaContext) {
      return context.getTopic();
    }
    if (context instanceof NatsContext) {
      return context.getSubject();
    }
    if (context instanceof MqttContext) {
      return context.getTopic();
    }
    if (context instanceof RmqContext) {
      return context.getPattern();
    }
    if (context instanceof RedisContext) {
      return context.getChannel();
    }
  }
}
