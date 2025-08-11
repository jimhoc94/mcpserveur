# VSCode MCP Server Extension

A Visual Studio Code extension that provides an integrated Model Context Protocol (MCP) server, enabling AI assistants like Claude to interact directly with your VSCode workspace.

## 🚀 Features

### Core MCP Server Capabilities
- **File Operations**: Read, write, create, and delete files in your workspace
- **Directory Management**: Create directories and list file structures
- **Content Search**: Search for text within files using advanced patterns
- **Workspace Information**: Get detailed information about your VSCode environment

### VSCode Integration
- **Status Bar Integration**: Real-time server status with port information
- **Command Palette**: Full command support for all MCP operations
- **Tree View**: Dedicated MCP Server view in the Explorer sidebar
- **Output Channel**: Comprehensive logging and debugging information
- **Configuration**: Extensive settings for customizing server behavior

### Available Tools

The MCP server provides these tools for AI assistants:

#### `read_file`
Read content from any file in your workspace
```json
{
  "path": "src/main.ts"
}
```

#### `write_file`
Write content to a file (creates directories if needed)
```json
{
  "path": "src/new-file.ts",
  "content": "// Your TypeScript code here"
}
```

#### `list_files`
List files and directories with optional recursion
```json
{
  "path": "src",
  "recursive": true
}
```

#### `create_directory`
Create a new directory structure
```json
{
  "path": "src/components/ui"
}
```

#### `delete_file`
Delete files or directories
```json
{
  "path": "temp/old-file.txt"
}
```

#### `search_files`
Search for text within files using patterns
```json
{
  "query": "function handleClick",
  "filePattern": "*.ts",
  "caseSensitive": false
}
```

#### `get_workspace_info`
Get comprehensive workspace information
```json
{}
```

## 📦 Installation

### From VSIX Package
1. Download the latest `.vsix` file from releases
2. Open VSCode Command Palette (`Ctrl+Shift+P`)
3. Run `Extensions: Install from VSIX...`
4. Select the downloaded `.vsix` file

### Development Installation
1. Clone this repository
2. Run `npm install` to install dependencies
3. Open in VSCode and press `F5` to launch Extension Development Host
4. The extension will be active in the new VSCode window

## 🔧 Configuration

Configure the MCP server through VSCode settings:

### Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mcpServer.autoStart` | boolean | `true` | Automatically start MCP server when VSCode starts |
| `mcpServer.port` | number | `3001` | Port for the MCP server |
| `mcpServer.host` | string | `localhost` | Host for the MCP server |
| `mcpServer.logLevel` | string | `info` | Log level (error, warn, info, debug) |
| `mcpServer.maxConnections` | number | `10` | Maximum concurrent MCP connections |
| `mcpServer.enableCORS` | boolean | `true` | Enable CORS for MCP server |

### Access Settings
- **Command Palette**: `Preferences: Open Settings (JSON)`
- **Settings UI**: Go to File → Preferences → Settings, search for "MCP Server"
- **Command**: Run `MCP: Open MCP Configuration`

## 🎮 Usage

### Starting the Server
The MCP server starts automatically when VSCode loads (if `autoStart` is enabled).

**Manual control:**
- **Start**: `Ctrl+Shift+P` → `MCP: Start MCP Server`
- **Stop**: `Ctrl+Shift+P` → `MCP: Stop MCP Server`
- **Restart**: `Ctrl+Shift+P` → `MCP: Restart MCP Server`
- **Status**: `Ctrl+Shift+P` → `MCP: Show MCP Server Status`

### Status Monitoring
- **Status Bar**: Shows current server status and port
- **Tree View**: Dedicated MCP Server view in Explorer sidebar
- **Output Channel**: Comprehensive logs via `MCP: Show MCP Server Logs`

### Connecting AI Assistants
Once the server is running, AI assistants can connect using the Model Context Protocol:

1. **Server Address**: `localhost:3001` (or your configured host/port)
2. **Protocol**: Standard MCP over stdio transport
3. **Capabilities**: File operations, search, workspace inspection

## 🛠️ Development

### Building the Extension
```bash
npm install
npm run compile
```

### Running Tests
```bash
npm run test
```

### Packaging
```bash
npm run package
```

### Development Workflow
1. Make changes to source code in `src/`
2. Run `npm run watch` for automatic compilation
3. Press `F5` to launch Extension Development Host
4. Test your changes in the new VSCode window
5. Use `Developer: Reload Window` to reload after changes

### Project Structure
```
src/
├── extension.ts          # Main extension activation
├── mcpServer.ts         # Core MCP server implementation
└── mcpStatusProvider.ts # TreeView provider for status
.vscode/
├── launch.json          # Debug configurations
├── tasks.json          # Build tasks
└── settings.json       # Development settings
```

## 🔍 Troubleshooting

### Common Issues

#### Server Won't Start
1. Check if port is already in use: `netstat -an | grep :3001`
2. Try changing the port in settings
3. Check output channel for detailed error messages

#### Permission Errors
- Ensure VSCode has read/write permissions to your workspace
- Check file permissions on workspace directories

#### Connection Issues
- Verify firewall settings allow connections on configured port
- Check if CORS is enabled if connecting from web applications

### Debug Mode
Enable debug logging:
1. Set `mcpServer.logLevel` to `debug`
2. Restart the server
3. Check output channel for detailed logs

### Getting Help
- Check the output channel: `MCP: Show MCP Server Logs`
- Open an issue on GitHub with logs and system information
- Include VSCode version, extension version, and operating system

## 📋 Requirements

- **VSCode**: Version 1.74.0 or higher
- **Node.js**: Version 18.x or higher (for development)
- **Operating System**: Windows, macOS, or Linux

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add JSDoc comments for public APIs
- Include tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - The standard protocol for AI-IDE integration
- [Anthropic](https://anthropic.com/) - For developing Claude and MCP
- [VSCode Extension API](https://code.visualstudio.com/api) - For the excellent extension development framework

## 📈 Changelog

### Version 0.1.0
- Initial release
- Core MCP server functionality
- VSCode integration with commands and status bar
- File operations and workspace inspection tools
- Comprehensive configuration options
- Logging and debugging features

---

**Made with ❤️ for the VSCode and AI community**