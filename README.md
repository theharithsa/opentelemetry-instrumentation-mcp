# OpenTelemetry Instrumentation for Model Context Protocol (MCP)

[![npm version](https://badge.fury.io/js/@theharithsa%2Fopentelemetry-instrumentation-mcp.svg)](https://www.npmjs.com/package/@theharithsa/opentelemetry-instrumentation-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@theharithsa/opentelemetry-instrumentation-mcp.svg)](https://www.npmjs.com/package/@theharithsa/opentelemetry-instrumentation-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Build Status](https://img.shields.io/github/actions/workflow/status/theharithsa/opentelemetry-instrumentation-mcp/ci.yml?branch=main)](https://github.com/theharithsa/opentelemetry-instrumentation-mcp/actions)

Automatic OpenTelemetry instrumentation for the Model Context Protocol SDK, enabling observability and telemetry collection for MCP-based applications with zero configuration required.

**Version 1.0.4** - Production ready with enhanced OTEL headers parsing and streamlined configuration.

> **🆕 What's New in v1.0.4:** Removed deprecated `DYNATRACE_API_TOKEN` support for cleaner configuration. Now uses only standard OpenTelemetry `OTEL_EXPORTER_OTLP_HEADERS` with improved parsing and validation.

## Features

- 🔄 **Automatic instrumentation** of MCP tool calls
- 📊 **Built-in OpenTelemetry setup** with NodeSDK
- 🚀 **Drop-in solution** - no manual OpenTelemetry configuration needed
- 📈 **OTLP export** with Dynatrace support out of the box
- 🔍 **Comprehensive tracing** of tool execution with error handling
- ⚡ **Zero-code integration** - just import and go
- 🔗 **Parent span stitching** - maintains trace context across tool executions

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

# Required: OTLP headers including authorization
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Api-Token <Token>
```

### Header Format

The `OTEL_EXPORTER_OTLP_HEADERS` environment variable supports comma-separated key=value pairs:

```bash
# Single header
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Api-Token your-token-here

# Multiple headers
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Api-Token your-token,Custom-Header=value,Another=header-value
```

## What Gets Instrumented

The instrumentation automatically creates spans for:

- **MCP Tool Calls**: Each tool invocation gets its own span named `mcp.tool:{toolName}`
- **Error Tracking**: Exceptions are recorded and spans are marked with error status
- **Execution Context**: Full OpenTelemetry context propagation

## Parent Span Stitching Solution

### The Challenge

By default, MCP tool executions may not maintain proper parent-child span relationships, leading to disconnected traces in complex applications.

### The Solution: Tool Wrapper Pattern

Create a custom wrapper function around your tool definitions that establishes parent spans. The McpInstrumentation will automatically create child spans within this context:

```typescript
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';

const tracer = trace.getTracer('your-application', '1.0.0');

const tool = (
  name: string,
  description: string,
  paramsSchema: ZodRawShape,
  cb: (args: z.infer<z.ZodObject<ZodRawShape>>, _extra?: any) => Promise<string>
) => {
  server.tool(name, description, paramsSchema, async (args, _extra) => {
    return await tracer.startActiveSpan(
      `Tool.${name}`,
      {
        kind: SpanKind.SERVER,
        attributes: {
          'Tool.name': name,
          'Tool.args': JSON.stringify(args),
        },
      },
      async (span) => {
        try {
          const result = await context.with(trace.setSpan(context.active(), span), async () => {
            return await cb(args, _extra);
          });
          
          span.setStatus({ code: SpanStatusCode.OK });
          span.setAttributes({
            'mcp.tool.result.length': result.length,
            'mcp.tool.success': true,
          });
          
          return {
            content: [{ type: 'text', text: result }],
          };
        } catch (error: any) {
          span.recordException(error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.setAttributes({
            'mcp.tool.success': false,
            'mcp.tool.error': error.message,
          });
          
          return {
            content: [{ type: 'text', text: `Unexpected error: ${error.message}` }],
            isError: true,
          };
        } finally {
          span.end();
        }
      }
    );
  });
};
```

### How It Works

1. **Parent Span Creation**: The wrapper creates a parent span named `Tool.${name}`
2. **Automatic Child Spans**: McpInstrumentation detects the active context and creates child spans `mcp.tool:${name}`
3. **Context Propagation**: All operations within the tool callback inherit the proper trace context
4. **No Manual Span Management**: Individual tools don't need to create or manage spans manually

### Benefits

1. **Automatic Hierarchy**: Parent-child span relationships are established automatically
2. **Zero Manual Work**: Individual tools don't need span management code
3. **Consistent Tracing**: Every tool gets proper instrumentation without code duplication
4. **Error Handling**: Exception recording and span status management is centralized
5. **Context Inheritance**: All async operations within tools inherit the correct trace context

## Adding Custom Span Attributes

Since the wrapper creates an active span context, you can easily add custom attributes in your tool implementations:

```typescript
tool('create_workflow', 'Create a workflow', { model: z.string() }, async ({ model }) => {
  // Get the active span (created by the wrapper)
  const span = trace.getSpan(context.active());
  if (span) {
    span.setAttribute('model.name', model);
    span.setAttribute('operation.category', 'workflow');
  }

  // Perform the actual work
  const result = await createWorkflow({ model });
  return `Workflow created: ${result.id}`;
});
```

## Example Trace Output

With the tool wrapper pattern, you'll see properly structured traces:

```text
Tool.get_environment_info (Parent Span - from wrapper)
  ├── mcp.tool:get_environment_info (Child Span - from McpInstrumentation)
  │   ├── Duration: 45ms
  │   ├── Status: OK
  │   └── Attributes: tool execution details
  └── Additional child spans from API calls...

Tool.execute_dql (Parent Span - from wrapper)
  ├── mcp.tool:execute_dql (Child Span - from McpInstrumentation)
  │   ├── Duration: 120ms
  │   ├── Status: ERROR
  │   └── Exception: QuerySyntaxError
  └── Additional context...
```

## Requirements

- Node.js >= 16.0.0
- MCP SDK (`@modelcontextprotocol/sdk`)
- Environment variables for OTLP export

## Package Structure

```text
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
5. Implement the tool wrapper pattern for proper span hierarchy
6. Restart your application

## Best Practices

### Tool Wrapper Implementation

- Create the wrapper once and reuse it for all tools
- Include essential attributes like tool name and arguments
- Let McpInstrumentation handle the detailed MCP-specific instrumentation
- Add custom attributes within tool callbacks as needed

### Error Handling

- The wrapper handles top-level errors and span status
- Individual tools should focus on business logic
- Thrown exceptions are automatically recorded and propagated

## License

ISC

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and breaking changes.

## Contributing

Issues and pull requests are welcome on [GitHub](https://github.com/theharithsa/opentelemetry-instrumentation-mcp).
