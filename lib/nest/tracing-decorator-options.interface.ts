import { ExecutionContext } from '@nestjs/common';
import {
  TracingAdapter,
  TracingExtractor,
  TracingGetter,
  TracingLogger,
} from '..';
import { TracingTags } from '../tracing-tags.interface';

export type ExtractorAndAdapterOptions<TCarrier> = {
  extractor: TracingExtractor<TCarrier>;
  adapter: TracingAdapter<ExecutionContext, TCarrier>;
};

export type ExtractorNorAdapterOptions = {
  extractor?: never;
  adapter?: never;
};

export type ExtractorOnlyOptions<TCarrier extends ExecutionContext> = {
  extractor: TracingExtractor<TCarrier>;
  adapter?: never;
};

export type AdapterOnlyOptions<TCarrier extends ExecutionContext> = {
  adapter: TracingAdapter<TCarrier, TracingGetter>;
  extractor?: never;
};

export type TracingExtractorOptions<TCarrier> =
  TCarrier extends ExecutionContext
    ? ExtractorOnlyOptions<TCarrier> | AdapterOnlyOptions<TCarrier>
    : ExtractorAndAdapterOptions<TCarrier> | ExtractorNorAdapterOptions;

export type TracingLoggerOptions = {
  logger?: TracingLogger<ExecutionContext>;
};

export type TracingDecoratorOptions<TCarrier> =
  TracingExtractorOptions<TCarrier> & TracingLoggerOptions;

export type TracingOperationOptions = {
  operation?: string;
  tags?: TracingTags;
};

export type TracingReferenceExtractorOptions = {
  prefix?: string;
  suffix?: string;
  override?: boolean;
};
