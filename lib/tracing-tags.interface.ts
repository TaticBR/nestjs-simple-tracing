import { TracingSpanKind } from './tracing-span-kind.enum';

export interface CommonTracingTags {
  error?: boolean;
}

export interface SpanTracingTags {
  'span.kind'?: TracingSpanKind | Omit<string, TracingSpanKind>;
}

export interface HttpTracingTags {
  'http.url'?: string;
  'http.method'?: string;
  'http.status_code'?: number;
}

export interface RpcTracingTags {
  'rpc.pattern'?: string;
}

export interface DatabaseTracingTags {
  'db.instance'?: string;
  'db.statement'?: string;
  'db.type'?: string;
  'db.user'?: string;
}

export interface StandardTracingTags
  extends CommonTracingTags,
    SpanTracingTags,
    HttpTracingTags,
    RpcTracingTags,
    DatabaseTracingTags {}

export interface CustomTracingTags extends Record<string, unknown> {
  // This interface is meant to be overridden by Declaration Merging
}

export interface TracingTags extends StandardTracingTags, CustomTracingTags {}
