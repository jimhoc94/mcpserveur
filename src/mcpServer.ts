import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface MCPServerConfig {
  port: number;
  host: string;
  logLevel: string;
  maxConnections: number;
  enableCORS: boolean;
}

export class MCPServerInstance {
  private server: Server;
  private config: MCPServerConfig;
  private outputChannel: vscode.OutputChannel;
  private isRunning = false;

  constructor(config: MCPServerConfig, outputChannel: vscode.OutputChannel) {
    this.config = config;
    this.outputChannel = outputChannel;
    this.server = new Server(
      {
        name: "vscode-mcp-server",
        version: "0.1.0",
        description: "VSCode integrated MCP server providing workspace tools and file operations"
      }
    );

    this.setupTools();
    this.setupErrorHandling();
  }

  private setupTools(): void {
    // Tool: Read file content
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "read_file",
            description: "Read content from a file in the VSCode workspace",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Relative path to the file from workspace root"
                }
              },
              required: ["path"]
            }
          },
          {
            name: "write_file",
            description: "Write content to a file in the VSCode workspace",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Relative path to the file from workspace root"
                },
                content: {
                  type: "string",
                  description: "Content to write to the file"
                }
              },
              required: ["path", "content"]
            }
          },
          {
            name: "list_files",
            description: "List files and directories in the workspace",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Relative path to directory (default: workspace root)",
                  default: "."
                },
                recursive: {
                  type: "boolean",
                  description: "Include subdirectories recursively",
                  default: false
                }
              }
            }
          },
          {
            name: "create_directory",
            description: "Create a directory in the workspace",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Relative path to directory to create"
                }
              },
              required: ["path"]
            }
          },
          {
            name: "delete_file",
            description: "Delete a file or directory from the workspace",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Relative path to file or directory to delete"
                }
              },
              required: ["path"]
            }
          },
          {
            name: "search_files",
            description: "Search for text within files in the workspace",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Text to search for"
                },
                filePattern: {
                  type: "string",
                  description: "Glob pattern for files to search in (e.g., '*.ts')",
                  default: "*"
                },
                caseSensitive: {
                  type: "boolean",
                  description: "Whether search should be case sensitive",
                  default: false
                }
              },
              required: ["query"]
            }
          },
          {
            name: "get_workspace_info",
            description: "Get information about the current VSCode workspace",
            inputSchema: {
              type: "object",
              properties: {}
            }
          }
        ]
      };
    });

    // Tool handlers
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "read_file":
            return await this.handleReadFile(args?.path as string);

          case "write_file":
            return await this.handleWriteFile(args?.path as string, args?.content as string);

          case "list_files":
            return await this.handleListFiles((args?.path as string) || ".", (args?.recursive as boolean) || false);

          case "create_directory":
            return await this.handleCreateDirectory(args?.path as string);

          case "delete_file":
            return await this.handleDeleteFile(args?.path as string);

          case "search_files":
            return await this.handleSearchFiles(args?.query as string, args?.filePattern as string, args?.caseSensitive as boolean);

          case "get_workspace_info":
            return await this.handleGetWorkspaceInfo();

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        this.log(`Tool execution error: ${error}`, 'error');
        throw error;
      }
    });
  }

  private async handleReadFile(relativePath: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new McpError(ErrorCode.InternalError, "No workspace folder open");
    }

    const absolutePath = path.join(workspaceFolders[0].uri.fsPath, relativePath);
    
    try {
      const content = await fs.promises.readFile(absolutePath, 'utf-8');
      return {
        content: [
          {
            type: "text",
            text: `File content from ${relativePath}:\n\n${content}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to read file: ${error}`);
    }
  }

  private async handleWriteFile(relativePath: string, content: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new McpError(ErrorCode.InternalError, "No workspace folder open");
    }

    const absolutePath = path.join(workspaceFolders[0].uri.fsPath, relativePath);
    
    try {
      // Ensure directory exists
      const dir = path.dirname(absolutePath);
      await fs.promises.mkdir(dir, { recursive: true });
      
      await fs.promises.writeFile(absolutePath, content, 'utf-8');
      return {
        content: [
          {
            type: "text",
            text: `Successfully wrote content to ${relativePath}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to write file: ${error}`);
    }
  }

  private async handleListFiles(relativePath: string, recursive: boolean) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new McpError(ErrorCode.InternalError, "No workspace folder open");
    }

    const absolutePath = path.join(workspaceFolders[0].uri.fsPath, relativePath);
    
    try {
      const files = await this.listDirectory(absolutePath, recursive);
      return {
        content: [
          {
            type: "text",
            text: `Files in ${relativePath}:\n\n${files.join('\n')}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list files: ${error}`);
    }
  }

  private async listDirectory(dirPath: string, recursive: boolean): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const relativePath = workspaceFolders ? 
        path.relative(workspaceFolders[0].uri.fsPath, fullPath) : 
        entry.name;

      if (entry.isDirectory()) {
        files.push(`📁 ${relativePath}/`);
        if (recursive) {
          const subFiles = await this.listDirectory(fullPath, true);
          files.push(...subFiles);
        }
      } else {
        files.push(`📄 ${relativePath}`);
      }
    }
    
    return files;
  }

  private async handleCreateDirectory(relativePath: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new McpError(ErrorCode.InternalError, "No workspace folder open");
    }

    const absolutePath = path.join(workspaceFolders[0].uri.fsPath, relativePath);
    
    try {
      await fs.promises.mkdir(absolutePath, { recursive: true });
      return {
        content: [
          {
            type: "text",
            text: `Successfully created directory: ${relativePath}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to create directory: ${error}`);
    }
  }

  private async handleDeleteFile(relativePath: string) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new McpError(ErrorCode.InternalError, "No workspace folder open");
    }

    const absolutePath = path.join(workspaceFolders[0].uri.fsPath, relativePath);
    
    try {
      const stats = await fs.promises.stat(absolutePath);
      if (stats.isDirectory()) {
        await fs.promises.rmdir(absolutePath, { recursive: true });
      } else {
        await fs.promises.unlink(absolutePath);
      }
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully deleted: ${relativePath}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to delete: ${error}`);
    }
  }

  private async handleSearchFiles(query: string, filePattern: string = "*", caseSensitive: boolean = false) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      throw new McpError(ErrorCode.InternalError, "No workspace folder open");
    }

    try {
      // Use vscode.workspace.findFiles and read files manually for search
      const pattern = new vscode.RelativePattern(workspaceFolders[0], filePattern || '**/*');
      const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 100);
      
      const searchResults: string[] = [];
      const regex = new RegExp(query, caseSensitive ? 'g' : 'gi');
      
      for (const file of files) {
        try {
          const content = await fs.promises.readFile(file.fsPath, 'utf-8');
          const lines = content.split('\n');
          const matches: { line: number; text: string }[] = [];
          
          lines.forEach((line, index) => {
            if (regex.test(line)) {
              matches.push({ line: index + 1, text: line });
            }
          });
          
          if (matches.length > 0) {
            const relativePath = vscode.workspace.asRelativePath(file);
            searchResults.push(`📄 ${relativePath}:`);
            
            matches.forEach(match => {
              searchResults.push(`  Line ${match.line}: ${match.text.trim()}`);
            });
            searchResults.push('');
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }

      return {
        content: [
          {
            type: "text",
            text: `Search results for "${query}":\n\n${searchResults.join('\n')}`
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to search files: ${error}`);
    }
  }

  private async handleGetWorkspaceInfo() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    const info = {
      workspaceFolders: workspaceFolders?.map(folder => ({
        name: folder.name,
        uri: folder.uri.toString(),
        path: folder.uri.fsPath
      })) || [],
      activeTextEditor: vscode.window.activeTextEditor ? {
        fileName: vscode.window.activeTextEditor.document.fileName,
        languageId: vscode.window.activeTextEditor.document.languageId,
        lineCount: vscode.window.activeTextEditor.document.lineCount
      } : null,
      vsCodeVersion: vscode.version,
      extensions: vscode.extensions.all.length
    };

    return {
      content: [
        {
          type: "text",
          text: `VSCode Workspace Information:\n\n${JSON.stringify(info, null, 2)}`
        }
      ]
    };
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      this.log(`Server error: ${error}`, 'error');
    };

    process.on('SIGINT', async () => {
      await this.stop();
      process.exit(0);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('MCP Server is already running');
    }

    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      this.isRunning = true;
      this.log('MCP Server started successfully', 'info');
    } catch (error) {
      this.log(`Failed to start MCP Server: ${error}`, 'error');
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.server.close();
      this.isRunning = false;
      this.log('MCP Server stopped', 'info');
    } catch (error) {
      this.log(`Error stopping MCP Server: ${error}`, 'error');
      throw error;
    }
  }

  isServerRunning(): boolean {
    return this.isRunning;
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    this.outputChannel.appendLine(logMessage);
    
    if (level === 'error') {
      console.error(logMessage);
    } else if (level === 'warn') {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  }
}