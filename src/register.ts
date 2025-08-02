import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { McpInstrumentation } from './index';

let _sdkStarted = false;

export function register() {
  if (_sdkStarted) {
    return;
  }
  _sdkStarted = true;

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: {
      Authorization: `Api-Token ${process.env.DYNATRACE_API_TOKEN}`,
    },
  });

  const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations(),
      new McpInstrumentation(),
    ],
  });

sdk.start().then((): void => {
    console.error('[otel] ✅ OpenTelemetry SDK started by MCP instrumentation');
}).catch((err: Error): void => {
    console.error('[otel] ❌ Failed to start OpenTelemetry SDK:', err);
});

  return sdk;
}

// Automatically run register() when imported
register();
