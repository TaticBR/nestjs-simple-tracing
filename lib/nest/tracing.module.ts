import {
  DynamicModule,
  Module,
  ModuleMetadata,
  Provider,
  Scope,
} from '@nestjs/common';
import { TracingConfig, TracingService } from '..';
import { TracingContextRef } from './tracing-context-ref.interface';
import { TRACING_CONTEXT } from './tracing.constants';

export const TRACING_MODULE_CONFIG = 'TRACING_MODULE_CONFIG';

export interface TracingModuleOptions {
  global?: boolean;
}

export interface TracingModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  global?: boolean;
  useFactory: (...args: any[]) => Promise<TracingConfig> | TracingConfig;
  inject?: any[];
}

@Module({})
export class TracingModule {
  static forRoot(
    config: TracingConfig,
    options?: TracingModuleOptions,
  ): DynamicModule {
    return {
      module: TracingModule,
      global: options?.global ?? true,
      providers: [
        {
          provide: TracingService,
          useValue: new TracingService(config),
        },
        this.createTracingContextProvider(),
      ],
      exports: [TracingService, TRACING_CONTEXT],
    };
  }

  static forRootAsync(options: TracingModuleAsyncOptions): DynamicModule {
    const tracingServiceProvider: Provider = {
      provide: TracingService,
      useFactory(config: TracingConfig) {
        return new TracingService(config);
      },
      inject: [TRACING_MODULE_CONFIG],
    };
    const asyncConfigProvider: Provider = {
      provide: TRACING_MODULE_CONFIG,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: TracingModule,
      global: options.global ?? true,
      imports: options.imports,
      providers: [
        asyncConfigProvider,
        tracingServiceProvider,
        this.createTracingContextProvider(),
      ],
      exports: [TracingService, TRACING_CONTEXT],
    };
  }

  private static createTracingContextProvider(): Provider {
    return {
      provide: TRACING_CONTEXT,
      scope: Scope.REQUEST,
      useFactory(): TracingContextRef {
        return {};
      },
    };
  }
}
