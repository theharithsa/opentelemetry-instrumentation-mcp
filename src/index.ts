import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
} from '@opentelemetry/instrumentation';

// This instrumentation targets the MCP SDK’s server class
export class McpInstrumentation extends InstrumentationBase {
  constructor() {
    super('opentelemetry-instrumentation-mcp', '0.0.1', {});
  }

  // OpenTelemetry calls init() to let your instrumentation patch modules
  init() {
    return [
      new InstrumentationNodeModuleDefinition(
        '@modelcontextprotocol/sdk',
        ['>=0.0.0'],                    // version range this instrumentation supports
        (moduleExports) => {
          const McpServer = moduleExports.McpServer;
          if (McpServer?.prototype?.tool) {
            this._wrap(
              McpServer.prototype,
              'tool',
              (original: any) => {
                const instrumentation = this;
                return function (this: any, name: string, description: any, schema: any, cb: any) {
                  // Wrap the provided callback to create a span for each tool invocation
                  const wrappedCallback = async (args: any, extra?: any) => {
                    const tracer = instrumentation.tracer;
                    const span = tracer.startSpan(`mcp.tool:${name}`);
                    return await context.with(
                      trace.setSpan(context.active(), span),
                      async () => {
                        try {
                          const result = await cb(args, extra);
                          span.setStatus({ code: SpanStatusCode.OK });
                          return result;
                        } catch (err: any) {
                          span.recordException(err);
                          span.setStatus({ code: SpanStatusCode.ERROR });
                          throw err;
                        } finally {
                          span.end();
                        }
                      }
                    );
                  };

                  // Call the original tool() with the wrapped callback
                  return original.call(this, name, description, schema, wrappedCallback);
                };
              }
            );
          }
          return moduleExports;
        },
        () => {
          // unpatch: restore the original tool() when instrumentation is disabled
        }
      ),
    ];
  }
}
