export interface HttpTracingEvents {
  'http.request': unknown;
  'http.response': unknown;
  'http.request.error': unknown;
  'http.response.error': unknown;
}

export interface RpcTracingEvents {
  'rpc.request': unknown;
  'rpc.response': unknown;
  'rpc.error': unknown;
}

export interface StandardTracingEvents
  extends HttpTracingEvents,
    RpcTracingEvents {}

export interface CustomTracingEvents {
  // This interface is meant to be overridden by Declaration Merging
}

export interface TracingEvents
  extends StandardTracingEvents,
    CustomTracingEvents {}
