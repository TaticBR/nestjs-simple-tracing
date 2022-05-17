# NESTJS SIMPLE TRACING

Simple tracing for [NestJS](http://nestjs.com/)

## Installation

Install the required dependency

```bash
$ npm i --save @taticbr/nestjs-simple-tracing
```

## Integration

Import the `TracingModule` into the root `AppModule`.

```typescript
import { Module } from '@nestjs/common';
import { TracingModule } from '@taticbr/nestjs-simple-tracing';

@Module({
  imports: [
    TracingModule.forRoot({
      serviceName: 'my-service',
      reporter: new MyTracingReporter(),
    }),
  ],
})
export class AppModule {}
```

### Async configuration

```typescript
import { Module } from '@nestjs/common';
import { TracingModule } from '@taticbr/nestjs-simple-tracing';

@Module({
  imports: [
    TracingModule.forRootAsync({
      imports: [MyModule],
      useFactory(reporter: MyTracingReporter): TracingConfig {
        return {
          serviceName: 'my-service',
          reporter,
        };
      },
      inject: [MyTracingReporter],
    }),
  ],
})
export class AppModule {}
```

### Decorators

Use the `@HttpTracing()` or `@RpcTracing()` decorators to enable trace extraction and logging.

Extraction and logging can be disabled with the `@DisableTracing()` decorator. Extraction and logging can also be individualy disabled using the `@DisableTracingExtractor()` and `@DisableTracingLogger()` decorators.

Additionaly, a span can be associated with a resource using the `@UseHttpTracingReferenceExtractor()` and `@RpcTracingReferenceExtractor()` decorators.

> **NOTE**: Tracing decorators can be controller-scoped or method-scoped.

Use the `@HttpTracing()` decorator for HTTP/REST handlers:

```typescript
import { Controller, Get } from '@nestjs/common';
import { HttpTracing, UseHttpTracingReferenceExtractor } from '@taticbr/nestjs-simple-tracing';
import { Request } from 'express';

@Controller()
@HttpTracing()
export class CatsController {
  @Get(':id')
  @UseHttpTracingReferenceExtractor((request: Request) => request.params.id) // optional
  findOne(@Param('id') id: string) {
    // business logic
  }
}
```

Use the `@RpcTracing()` decorator for Microservices/RPC handlers:

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RpcTracing, KafkaHeadersExtractorRpcTracingAdapter } from '@taticbr/nestjs-simple-tracing';

@Controller()
export class UserController {
  @EventPattern('user_created')
  @RpcTracing({ adapter: KafkaHeadersExtractorRpcTracingAdapter.getInstance() })
  async handleUserCreated(data: any) {
    // business logic
  }
}
```

### Using the `TracingService`

Inject it using standard constructor injection

```typescript
import { Injectable } from '@nestjs/common';
import { TracingService } from '@taticbr/nestjs-simple-tracing';

@Injectable()
export class CatsService {
  constructor(private tracingService: TracingService) {}
}
```

### Access the current tracing context

To access the current tracing context, inject the `TRACING_CONTEXT` object

> **NOTE:** `TRACING_CONTEXT` is a request-scoped provider and can have an impact on application performance.
> See: [NestJS - Injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes#performance)

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { TracingContextRef, TRACING_CONTEXT } from '@taticbr/nestjs-simple-tracing';

@Injectable()
export class CatsService {
  constructor(@Inject(TRACING_CONTEXT) private tracingContextRef: TracingContextRef) {}
}
```

## License

[MIT](https://opensource.org/licenses/MIT)
