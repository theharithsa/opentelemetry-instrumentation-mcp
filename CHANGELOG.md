# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-08-04

### Added

- Documentation for parent span stitching solution using tool wrapper pattern
- Comprehensive examples of custom tool wrapper implementation
- Detailed trace context propagation examples
- Best practices section for tool wrapper implementation
- Example trace output showing proper parent-child span hierarchy

### Changed

- Updated README with detailed parent span stitching implementation
- Enhanced documentation for maintaining trace context in MCP tool executions
- Improved examples showing how wrapper creates parent spans automatically
- Clarified that individual tools don't need manual span management

### Documentation

- Added production-ready tool wrapper pattern based on real implementation
- Enhanced troubleshooting section for span context issues
- Updated migration guide to include tool wrapper pattern implementation
- Documented benefits of automatic hierarchy establishment

## [1.0.1] - 2024-08-03

### Added

- Initial stable release
- Automatic MCP tool instrumentation
- OTLP export support
- Auto-registration capability

### Features

- Zero-configuration OpenTelemetry setup
- Built-in error handling and span status management
- Comprehensive span attribute collection
- Production-ready stability

## [1.0.0] - 2024-08-03

### Added

- Initial release of OpenTelemetry instrumentation for MCP
- Basic tool call tracing
- Error tracking and span status management
- NodeSDK integration
- Error tracking and span status management
- NodeSDK integration
