# Changelog

All notable changes to this project will be documented in this file. This
project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2025-01-XX

### Added

- **Comprehensive documentation** - Added detailed guide for enriching traces with custom span attributes
- **Dual attribute approach** - Documented both application-level and instrumentation-level methods for adding span attributes
- **Best practices guide** - Included recommendations on when to use each attribute approach
- **Production-ready status** - Marking the package as stable with 1.0.0 release

### Changed

- **Documentation enhancement** - Significantly improved README with detailed examples for span attribute management
- **API stability** - Committed to stable API contract with semantic versioning

## [0.2.0] - 2025-08-02

### Added

- **Automatic SDK registration** – introduced a new register entry point that boots the NodeSDK and registers both the default OpenTelemetry auto‑instrumentations and the custom McpInstrumentation. Consumers can now simply add `import '@theharithsa/opentelemetry-instrumentation-mcp/register'` at the top of their application to enable tracing without writing their own otel.ts setup.

- **Environment‑based configuration** – the new register module reads `OTEL_EXPORTER_OTLP_ENDPOINT` and `DYNATRACE_API_TOKEN` environment variables to configure the OTLP exporter, making it easy to point traces at a Dynatrace backend without code changes.

- **Active span access** – documented how to access the active span in tool callbacks via `trace.getSpan(context.active())`, allowing application code to attach arbitrary attributes (e.g. model name, API name) to the span.

### Changed

- **Package exports** – updated package.json to expose a `./register` sub‑path and mark it as a side effect. This ensures bundlers do not tree‑shake the register module and allows consumers to import it directly.

- **Version bump** – incremented the version number from 0.1.x to 0.2.0 to reflect the addition of the new register API.

### Removed

- **Manual span boilerplate** – with the introduction of register, users no longer need to create their own otel.ts file or manually start the OpenTelemetry SDK. Manual span creation around each tool callback is optional; the custom instrumentation now handles starting and finishing spans for all tool invocations.

## [0.1.0] - Initial Release

### Added

- **Basic MCP instrumentation** - Core instrumentation for Model Context Protocol tool calls
- **Manual setup support** - Basic integration with OpenTelemetry NodeSDK
- **Span creation** - Automatic span generation for MCP tool invocations
- **Error tracking** - Exception recording and error status marking
