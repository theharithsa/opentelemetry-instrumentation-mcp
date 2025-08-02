# OpenTelemetry MCP Instrumentation

[![npm version](https://badge.fury.io/js/@theharithsa%2Fopentelemetry-instrumentation-mcp.svg)](https://badge.fury.io/js/@theharithsa%2Fopentelemetry-instrumentation-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

An OpenTelemetry instrumentation package that automatically traces [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server operations, providing observability into MCP tool invocations.

## Features

- 🔍 **Automatic tracing** of MCP tool invocations
- 📊 **Rich telemetry data** including execution time, success/failure status
- 🚀 **Zero-code instrumentation** - just register and run
- 🎯 **Focused on MCP SDK** - specifically targets `@modelcontextprotocol/sdk`
- 📈 **Exception tracking** for failed tool executions

## Installation

```bash
npm install @theharithsa/opentelemetry-instrumentation-mcp
```

## Quick Start

### Basic Usage

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { McpInstrumentation } from '@theharithsa/opentelemetry-instrumentation-mcp';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations(),
    new McpInstrumentation(),
  ],
});

sdk.start();
```

### Manual Registration

```typescript
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { McpInstrumentation } from '@theharithsa/opentelemetry-instrumentation-mcp';

registerInstrumentations({
  instrumentations: [new McpInstrumentation()],
});
```

## What Gets Traced

This instrumentation automatically creates spans for:

- **MCP Tool Invocations**: Every call to an MCP tool registered via `McpServer.tool()`
- **Span Names**: Follow the pattern `mcp.tool:{toolName}`
- **Status Tracking**: Automatic success/error status based on execution results
- **Exception Recording**: Detailed error information when tools fail

### Example Trace Output

```
Span: mcp.tool:get_weather
├── Duration: 245ms
├── Status: OK
└── Attributes:
    ├── service.name: my-mcp-server
    └── operation.name: get_weather
```

## Configuration

### Basic Configuration

```typescript
import { McpInstrumentation } from '@theharithsa/opentelemetry-instrumentation-mcp';

const mcpInstrumentation = new McpInstrumentation();
```

### With Custom OpenTelemetry Setup

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { McpInstrumentation } from '@theharithsa/opentelemetry-instrumentation-mcp';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [new McpInstrumentation()],
});

sdk.start();
console.log('OpenTelemetry started with MCP instrumentation');
```

## Complete Example

Here's a complete example of an MCP server with OpenTelemetry tracing:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { McpInstrumentation } from '@theharithsa/opentelemetry-instrumentation-mcp';
import { McpServer } from '@modelcontextprotocol/sdk';

// Initialize OpenTelemetry
const sdk = new NodeSDK({
  instrumentations: [new McpInstrumentation()],
});
sdk.start();

// Create MCP Server
const server = new McpServer({
  name: 'example-server',
  version: '1.0.0',
});

// Register a tool (will be automatically traced)
server.tool(
  'get_weather',
  'Get current weather for a location',
  {
    type: 'object',
    properties: {
      location: { type: 'string' }
    }
  },
  async (args) => {
    // This execution will be traced automatically
    const weather = await fetchWeather(args.location);
    return { weather };
  }
);

async function fetchWeather(location: string) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 200));
  return `Sunny, 72°F in ${location}`;
}
```

## Supported Versions

- **Node.js**: >= 16.0.0
- **@modelcontextprotocol/sdk**: >= 0.0.0
- **@opentelemetry/api**: ^1.9.0
- **@opentelemetry/instrumentation**: ^0.203.0

## How It Works

This instrumentation uses OpenTelemetry's monkey-patching capabilities to wrap the `tool()` method of the MCP SDK's `McpServer` class. When you register a tool, the instrumentation:

1. Wraps your tool callback function
2. Creates a new span when the tool is invoked
3. Tracks execution time and status
4. Records any exceptions that occur
5. Properly ends the span when execution completes

## Troubleshooting

### No traces appearing?

1. Ensure OpenTelemetry is properly initialized before importing MCP SDK
2. Verify your exporter configuration
3. Check that you're using a supported version of `@modelcontextprotocol/sdk`

### Missing spans for some tools?

- Make sure tools are registered using `McpServer.tool()` method
- Verify the instrumentation is loaded before the MCP SDK

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
git clone https://github.com/theharithsa/opentelemetry-instrumentation-mcp.git
cd opentelemetry-instrumentation-mcp
npm install
npm run build
```

### Running Tests

```bash
npm test
```

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Changelog

### 0.0.1
- Initial release
- Basic MCP tool instrumentation
- Support for `@modelcontextprotocol/sdk`

## Related Projects

- [OpenTelemetry](https://opentelemetry.io/) - Observability framework
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol for AI tool integration
- [MCP SDK](https://github.com/modelcontextprotocol/sdk) - Official MCP SDK

## Support

For questions and support, please open an issue on [GitHub](https://github.com/theharithsa/opentelemetry-instrumentation-mcp/issues).
