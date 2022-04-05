import { TracingContextRef } from '../..';
import { TracingInjector, TracingService, TracingSpanKind } from '../../..';
import {
  HttpClient,
  HttpRequestConfig,
  HttpRequestHeaders,
  HttpResponse,
} from './http-client.interface';

type RequestInfo = {
  url: string;
  method: string;
  data?: unknown;
};

export class TracingHttpClient<
  TConfig extends HttpRequestConfig = HttpRequestConfig,
> implements HttpClient<TConfig>
{
  constructor(
    private readonly client: HttpClient<TConfig>,
    private readonly tracingService: TracingService,
    private readonly tracingInjector: TracingInjector<HttpRequestHeaders>,
    private readonly tracingContextRef: TracingContextRef,
    private readonly operation = 'http-request',
  ) {}

  private async traceRequest<TResponse extends HttpResponse<unknown>>(
    info: RequestInfo,
    config: TConfig | undefined,
    createRequest: (newConfig: TConfig) => Promise<TResponse>,
  ): Promise<TResponse> {
    const span = this.tracingService.startSpan(this.operation, {
      parent: this.tracingContextRef.context,
      tags: {
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

        this.tracingService.inject(
          span.context,
          this.tracingInjector,
          actualConfig.headers,
        );
        request = createRequest(actualConfig);
      } catch (err) {
        span.addTags({ error: true }).log('http.request.error', err);
        throw err;
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
            'http.status_code': error.status ?? error.code ?? 500,
            error: true,
          })
          .log('http.response.error', error);
        throw error;
      }
    } finally {
      span.finish();
    }
  }

  protected createConfig(): TConfig {
    return {} as TConfig;
  }

  protected getUrl(url: string, config?: any): string {
    const baseUrl = config?.baseURL || config?.baseUrl;
    if (baseUrl) {
      return baseUrl + url;
    }
    return url;
  }

  get<TData = any, TResponse extends HttpResponse<TData> = HttpResponse<TData>>(
    url: string,
    config?: TConfig,
  ): Promise<TResponse> {
    return this.traceRequest(
      {
        url,
        method: 'get',
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
        method: 'delete',
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
        method: 'head',
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
        method: 'options',
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
        method: 'post',
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
        method: 'put',
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
        method: 'patch',
        data,
      },
      config,
      (newConfig) => this.client.patch<TData, TResponse>(url, data, newConfig),
    );
  }
}
