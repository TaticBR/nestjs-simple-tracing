export interface HttpClient<
  TConfig extends HttpRequestConfig = HttpRequestConfig,
> {
  get<TData = any, TResponse extends HttpResponse<TData> = HttpResponse<TData>>(
    url: string,
    config?: TConfig,
  ): Promise<TResponse>;

  delete<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(
    url: string,
    config?: TConfig,
  ): Promise<TResponse>;

  head<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(
    url: string,
    config?: TConfig,
  ): Promise<TResponse>;

  options<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(
    url: string,
    config?: TConfig,
  ): Promise<TResponse>;

  post<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(
    url: string,
    data?: any,
    config?: TConfig,
  ): Promise<TResponse>;

  put<TData = any, TResponse extends HttpResponse<TData> = HttpResponse<TData>>(
    url: string,
    data?: any,
    config?: TConfig,
  ): Promise<TResponse>;

  patch<
    TData = any,
    TResponse extends HttpResponse<TData> = HttpResponse<TData>,
  >(
    url: string,
    data?: any,
    config?: TConfig,
  ): Promise<TResponse>;
}

export interface HttpResponse<TData = any> {
  data: TData;
  status: number;
}

export interface HttpRequestConfig {
  headers?: HttpRequestHeaders;
}

export type HttpRequestHeaders = Record<
  string,
  string | string[] | number | boolean
>;
