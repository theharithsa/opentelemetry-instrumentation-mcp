# OpenTelemetry Instrumentation for Model Context Protocol (MCP)

Automatic OpenTelemetry instrumentation for the Model Context Protocol SDK, enabling observability and telemetry collection for MCP-based applications with zero configuration required.

## Features

- 🔄 **Automatic instrumentation** of MCP tool calls
- 📊 **Built-in OpenTelemetry setup** with NodeSDK
- 🚀 **Drop-in solution** - no manual OpenTelemetry configuration needed
- 📈 **OTLP export** with Dynatrace support out of the box
- 🔍 **Comprehensive tracing** of tool execution with error handling
- ⚡ **Zero-code integration** - just import and go

## Installation

```bash
npm install @theharithsa/opentelemetry-instrumentation-mcp
```

## Quick Start

### Option 1: Auto-Registration (Recommended)

Simply import the register module at the very top of your application entry point:

```typescript
// At the top of your src/index.ts or main file
import '@theharithsa/opentelemetry-instrumentation-mcp/register';

// Your existing MCP server code...
import { McpServer } from '@modelcontextprotocol/sdk';
// ... rest of your application
```

### Option 2: Manual Setup

If you need more control over the OpenTelemetry configuration:

```typescript
import { McpInstrumentation } from '@theharithsa/opentelemetry-instrumentation-mcp';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations(),
    new McpInstrumentation(),
  ],
  // Your custom configuration...
});

sdk.start();
```

## Environment Variables

When using the auto-registration approach, configure these environment variables:

```bash
# Required: OTLP endpoint for trace export
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-dynatrace-endpoint.com/api/v2/otlp/v1/traces

# Required: Dynatrace API token for authentication
DYNATRACE_API_TOKEN=your-dynatrace-api-token
```

## What Gets Instrumented

The instrumentation automatically creates spans for:

- **MCP Tool Calls**: Each tool invocation gets its own span named `mcp.tool:{toolName}`
- **Error Tracking**: Exceptions are recorded and spans are marked with error status
- **Execution Context**: Full OpenTelemetry context propagation

## Example Trace Output

When your MCP tools are called, you'll see traces like:

```
mcp.tool:calculate
  ├── Duration: 45ms
  ├── Status: OK
  └── Attributes: tool execution details

mcp.tool:search_files
  ├── Duration: 120ms
  ├── Status: ERROR
  └── Exception: FileNotFoundError
```

## Requirements

- Node.js >= 16.0.0
- MCP SDK (`@modelcontextprotocol/sdk`)
- Environment variables for OTLP export

## Package Structure

```
@theharithsa/opentelemetry-instrumentation-mcp/
├── index.js          # McpInstrumentation class
└── register.js       # Auto-registration with NodeSDK
```

## Migration from Manual Setup

If you were previously setting up OpenTelemetry manually:

1. Remove your custom OpenTelemetry setup code
2. Delete manual instrumentation imports
3. Add the single import line at the top of your entry point:

   ```typescript
   import '@theharithsa/opentelemetry-instrumentation-mcp/register';
   ```
   
4. Set the required environment variables
5. Restart your application

## License

ISC

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/theharithsa/opentelemetry-instrumentation-mcp).