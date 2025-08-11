# Changelog

All notable changes to the VSCode MCP Server Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-12-09

### Added
- Initial release of VSCode MCP Server Extension
- Core MCP server implementation with stdio transport
- Integration with VSCode Extension API
- Status bar integration showing server status and port
- Command palette integration with all MCP operations
- Tree view in Explorer sidebar for MCP server management
- Comprehensive output channel for logging and debugging
- Configuration settings for server customization

#### MCP Tools Implemented
- `read_file` - Read content from workspace files
- `write_file` - Write content to workspace files with directory creation
- `list_files` - List files and directories with recursive option
- `create_directory` - Create directory structures
- `delete_file` - Delete files and directories
- `search_files` - Search for text within files using patterns
- `get_workspace_info` - Get detailed workspace information

#### VSCode Commands Added
- `MCP: Start MCP Server` - Start the MCP server
- `MCP: Stop MCP Server` - Stop the MCP server  
- `MCP: Restart MCP Server` - Restart the MCP server
- `MCP: Show MCP Server Status` - Display server status information
- `MCP: Open MCP Configuration` - Open extension settings
- `MCP: Show MCP Server Logs` - Show output channel with logs

#### Configuration Options Added
- `mcpServer.autoStart` - Auto-start server on VSCode launch
- `mcpServer.port` - Configure server port (default: 3001)
- `mcpServer.host` - Configure server host (default: localhost)
- `mcpServer.logLevel` - Set logging level (error, warn, info, debug)
- `mcpServer.maxConnections` - Maximum concurrent connections
- `mcpServer.enableCORS` - Enable/disable CORS

#### Development Features
- TypeScript project structure with strict type checking
- ESLint configuration for code quality
- VSCode debug configurations for extension development
- Comprehensive build and packaging scripts
- Unit test framework setup

### Technical Details
- Built with TypeScript 5.1.6
- Uses @modelcontextprotocol/sdk v0.4.0
- Compatible with VSCode 1.74.0+
- Supports Node.js 18.x+
- Cross-platform: Windows, macOS, Linux

### Documentation
- Comprehensive README with usage examples
- API documentation for all MCP tools
- Development setup and contribution guidelines
- Troubleshooting guide with common issues
- Configuration reference with all settings

---

### Legend
- `Added` - New features
- `Changed` - Changes in existing functionality  
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements