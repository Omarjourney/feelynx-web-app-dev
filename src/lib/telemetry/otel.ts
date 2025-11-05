import { diag, DiagConsoleLogger, DiagLogLevel, SpanStatusCode, metrics } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { logs } from '@opentelemetry/api-logs';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

const serviceName = process.env.OTEL_SERVICE_NAME ?? 'feelynx-web';

let tracerInstance: ReturnType<NodeTracerProvider['getTracer']> | undefined;
let initialized = false;

export const bootstrapTelemetry = () => {
  if (initialized || process.env.NODE_ENV === 'test') {
    return;
  }

  if (process.env.OTEL_DEBUG === 'true') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
  }

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'development',
    'feelynx.region': process.env.FEELYNX_REGION ?? 'us-east-1',
    'feelynx.tier': process.env.FEELYNX_TIER ?? 'web'
  });

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'https://otlp.grafana.net/v1/traces',
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : undefined
  });

  const provider = new NodeTracerProvider({ resource });
  provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
  provider.register();
  tracerInstance = provider.getTracer(serviceName);

  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ?? 'https://otlp.grafana.net/v1/metrics'
  });

  const meterProvider = new MeterProvider({ resource });
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL ?? 15000)
    })
  );
  metrics.setGlobalMeterProvider(meterProvider);

  const logExporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ?? 'https://otlp.grafana.net/v1/logs'
  });
  const loggerProvider = new LoggerProvider({ resource });
  loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));
  logs.setGlobalLoggerProvider(loggerProvider);
  initialized = true;
};

export const getTracer = () => {
  if (!tracerInstance) {
    bootstrapTelemetry();
  }

  return tracerInstance;
};

export const instrumentHandler = async <T>(name: string, fn: () => Promise<T>) => {
  const tracer = getTracer();

  if (!tracer) {
    return fn();
  }

  return new Promise<T>((resolve, reject) => {
    tracer.startActiveSpan(name, async (span: any) => {
      try {
        const result = await fn();
        span.setStatus({ code: SpanStatusCode.OK });
        resolve(result);
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
        reject(error);
      } finally {
        span.end();
      }
    });
  });
};
