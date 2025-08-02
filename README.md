# OpenTelemetry Instrumentation for Model Context Protocol (MCP)

[![npm version](https://badge.fury.io/js/@theharithsa%2Fopentelemetry-instrumentation-mcp.svg)](https://www.npmjs.com/package/@theharithsa/opentelemetry-instrumentation-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theharithsa/opentelemetry-instrumentation-mcp.svg)](https://www.npmjs.com/package/@theharithsa/opentelemetry-instrumentation-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Build Status](https://img.shields.io/github/actions/workflow/status/theharithsa/opentelemetry-instrumentation-mcp/ci.yml?branch=main)](https://github.com/theharithsa/opentelemetry-instrumentation-mcp/actions)

Automatic OpenTelemetry instrumentation for the Model Context Protocol SDK, enabling observability and telemetry collection for MCP-based applications with zero configuration required.

**Version 1.0.0** - Production ready with stable API.

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

## Adding Custom Span Attributes

You have two effective ways to enrich your traces with custom attributes:

### Option 1: Set Attributes in Your Application Code (Recommended)

Because `McpInstrumentation` calls your tool callback inside a context, the span it created is the current active span during the callback. You can grab it and attach any metadata you need:

```typescript
import { trace, context } from '@opentelemetry/api';

tool('create_workflow', 'Create a workflow', { /* schema */ }, async (args) => {
  // Derive the additional data you want to record
  const modelName = args.model;
  const apiName = 'workflowAPI'; // or compute dynamically

  // Get the active span created by the instrumentation
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttribute('mcp.tool', 'create_workflow');
    span.setAttribute('model.name', modelName);
    span.setAttribute('api.name', apiName);
    span.setAttribute('workflow.type', args.workflowType);
  }

  // Perform the actual work
  const result = await createWorkflow(args);
  return `Workflow created: ${result.id}`;
});
```

### Option 2: Add Default Attributes in Instrumentation

If you want certain attributes added automatically for every tool without changing your application code, you can modify the instrumentation itself. In `McpInstrumentation`'s wrapper around `server.tool()`, you can set attributes before calling the user's callback:

```typescript
// Inside the wrapped callback in McpInstrumentation
const tracer = instrumentation.tracer;
const span = tracer.startSpan(`mcp.tool:${name}`);
span.setAttribute('mcp.tool', name);

// Optionally capture common metadata from args or extra
if (args?.model) {
  span.setAttribute('model.name', args.model);
}
if (extra?.caller) {
  span.setAttribute('caller', extra.caller);
}

return context.with(trace.setSpan(context.active(), span), async () => {
  // Call the original callback and handle status/errors...
});
```

### Which Approach to Use?

- **Per-tool attributes (Option 1)** give you maximum flexibility, as you can compute attributes using local variables and know exactly when they should be added.

- **Instrumentation-level defaults (Option 2)** are useful for metadata that is always available and consistent (like the tool name). It keeps your application callbacks clean but is limited to information that your instrumentation can see.

You can combine both approaches: set default attributes in the instrumentation and add specialized attributes in the application where needed. Either way, you're simply calling `span.setAttribute(key, value)` on the active span – OpenTelemetry will include those values in the trace export.

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

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and breaking changes.

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/theharithsa/opentelemetry-instrumentation-mcp).