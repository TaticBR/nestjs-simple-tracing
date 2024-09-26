import { TracingContextRef } from '../..';
import {
  TracingInjector,
  TracingService,
  TracingSetter,
  TracingSpanKind,
  TracingTags,
} from '../../..';
import {
  HttpClient,
  HttpRequestConfig,
  HttpResponse,
} from './http-client.interface';

type RequestInfo = {
  url: string;
  method: string;
  data?: unknown;
};

export type TracingHttpClientConfig<TConfig> = {
  tracingService: TracingService;
  tracingInjector: TracingInjector<TracingSetter>;
  tracingContextRef: TracingContextRef;
  operation?: string;
  tags?: TracingTags;
  createConfig?: () => TConfig;
  getUrl?: (url: string, config?: TConfig) => string;
  getErrorStatusCode?: (error: any) => number;
};

export class TracingHttpClient<
  TConfig extends HttpRequestConfig = HttpRequestConfig,
> implements HttpClient<TConfig>
{
  private readonly tracingService: TracingService;
  private readonly tracingInjector: TracingInjector<TracingSetter>;
  private readonly tracingContextRef: TracingContextRef;
  private readonly operation: string;
  private readonly tags?: TracingTags;
  private readonly createConfig: () => TConfig;
  private readonly getUrl: (url: string, config?: TConfig) => string;
  private readonly getErrorStatusCode: (error: any) => number;

  constructor(
    private readonly client: HttpClient<TConfig>,
    config: TracingHttpClientConfig<TConfig>,
  ) {
    this.tracingService = config.tracingService;
    this.tracingInjector = config.tracingInjector;
    this.tracingContextRef = config.tracingContextRef;
    this.operation = config.operation ?? 'http-request';
    this.tags = config.tags;
    this.createConfig = config.createConfig ?? this.createConfigFallback;
    this.getUrl = config.getUrl ?? this.getUrlFallback;
    this.getErrorStatusCode =
      config.getErrorStatusCode ?? this.getErrorStatusCodeFallback;
  }

  private async traceRequest<TResponse extends HttpResponse<unknown>>(
    info: RequestInfo,
    config: TConfig | undefined,
    createRequest: (newConfig: TConfig) => Promise<TResponse>,
  ): Promise<TResponse> {
    const span = this.tracingService.startSpan(this.operation, {
      parent: this.tracingContextRef.context,
      tags: {
        ...this.tags,
        'span.kind': TracingSpanKind.HTTP,
        'http.url': this.getUrl(info.url, config),
        'http.method': info.method,
      },
    });
    try {
      let request: Promise<TResponse>;
      try {
        const actualConfig = config ?? this.createConfig();
        actualConfig.headers ??= {};
        const headers = actualConfig.headers;

        this.tracingService.inject(
          span.context,
          this.tracingInjector,
          (key, value) => (headers[key] = value),
        );
        request = createRequest(actualConfig);
      } catch (error) {
        span.addTags({ error: true }).log('http.request.error', error);
        throw error;
      }

      try {
        span.log('http.request', info.data);
        const response = await request;
        span
          .addTags({
            'http.status_code': response.status ?? 200,
          })
          .log('http.response', response.data);
        return response;
      } catch (error) {
        if (error.response) {
          const { status, headers, data } = error.response;
          error.status ??= status;
          error.headers ??= headers;
          error.data ??= data;
        }
        span
          .addTags({
            'http.status_code': this.getErrorStatusCode(error),
            error: true,
          })
          .log('http.response.error', error);
        throw error;
      }
    } finally {
      span.finish();
    }
  }

  protected createConfigFallback(): TConfig {
    return {} as TConfig;
  }

  protected getUrlFallback(url: string, config?: any): string {
    const baseUrl = config?.baseURL || config?.baseUrl;
    if (baseUrl) {
      return baseUrl + url;
    }
    return url;
  }

  protected getErrorStatusCodeFallback(error: any): number {
    return error.status ?? error.code ?? 500;
  }

  get<TData = any, TResponse extends HttpResponse<TData> = HttpResponse<TData>>(
    url: string,
    config?: TConfig,
  ): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'GET',
      },
      config,
      (newConfig) => this.client.get<TData, TResponse>(url, newConfig),
    );
  }

  delete<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(url: string, config?: TConfig): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'DELETE',
      },
      config,
      (newConfig) => this.client.delete<TData, TResponse>(url, newConfig),
    );
  }

  head<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(url: string, config?: TConfig): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'HEAD',
      },
      config,
      (newConfig) => this.client.head<TData, TResponse>(url, newConfig),
    );
  }

  options<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(url: string, config?: TConfig): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'OPTIONS',
      },
      config,
      (newConfig) => this.client.options<TData, TResponse>(url, newConfig),
    );
  }

  post<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(url: string, data?: any, config?: TConfig): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'POST',
        data,
      },
      config,
      (newConfig) => this.client.post<TData, TResponse>(url, data, newConfig),
    );
  }

  put<TData = any, TResponse extends HttpResponse<TData> = HttpResponse<TData>>(
    url: string,
    data?: any,
    config?: TConfig,
  ): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'PUT',
        data,
      },
      config,
      (newConfig) => this.client.put<TData, TResponse>(url, data, newConfig),
    );
  }

  patch<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(url: string, data?: any, config?: TConfig): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'PATCH',
        data,
      },
      config,
      (newConfig) => this.client.patch<TData, TResponse>(url, data, newConfig),
    );
  }
}
