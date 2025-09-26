import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { McpInstrumentation } from './index';

let _sdkStarted = false;

function parseOtelHeaders(): Record<string, string> {
  const headersEnv = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  if (!headersEnv?.trim()) {
    return {};
  }

  const headers: Record<string, string> = {};
  
  try {
    // Parse comma-separated key=value pairs
    // Handle escaped commas and equal signs properly
    const pairs = headersEnv.split(',');
    
    for (const pair of pairs) {
      const trimmedPair = pair.trim();
      if (!trimmedPair) continue;
      
      const equalIndex = trimmedPair.indexOf('=');
      if (equalIndex === -1) {
        console.warn(`[otel] ⚠️ Invalid header format, missing '=' in: ${trimmedPair}`);
        continue;
      }
      
      const key = trimmedPair.substring(0, equalIndex).trim();
      const value = trimmedPair.substring(equalIndex + 1).trim();
      
      if (!key) {
        console.warn(`[otel] ⚠️ Invalid header format, empty key in: ${trimmedPair}`);
        continue;
      }
      
      headers[key] = value;
    }
    
    console.log(`[otel] ✅ Parsed ${Object.keys(headers).length} OTLP headers from OTEL_EXPORTER_OTLP_HEADERS`);
  } catch (error) {
    console.error(`[otel] ❌ Failed to parse OTEL_EXPORTER_OTLP_HEADERS:`, error);
    return {};
  }
  
  return headers;
}

export function register() {
  if (_sdkStarted) {
    return;
  }
  _sdkStarted = true;

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

  // Parse headers from OTEL_EXPORTER_OTLP_HEADERS
  const headers = parseOtelHeaders();
  
  // Validate that authorization is provided
  if (!headers.Authorization && !headers.authorization) {
    console.warn('[otel] ⚠️ No Authorization header found in OTEL_EXPORTER_OTLP_HEADERS. Traces may not be accepted by the OTLP endpoint.');
  }

  const exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers,
  });

  const sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations(),
      new McpInstrumentation(),
    ],
  });

  try {
    sdk.start();
    console.error('[otel] ✅ OpenTelemetry SDK started by MCP instrumentation');
  } catch (err) {
    console.error('[otel] ❌ Failed to start OpenTelemetry SDK:', err);
  }

  return sdk;
}

// Automatically run register() when imported
register();
