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

export type StandardTracingTags = CommonTracingTags &
  SpanTracingTags &
  HttpTracingTags &
  RpcTracingTags &
  DatabaseTracingTags;

export type CustomTracingTags = Record<string, any>;

export type TracingTags = StandardTracingTags & CustomTracingTags;
