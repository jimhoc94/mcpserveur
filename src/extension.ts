import * as vscode from 'vscode';
import { MCPServerInstance } from './mcpServer.js';
import { MCPStatusProvider } from './mcpStatusProvider.js';

let mcpServer: MCPServerInstance | undefined;
let outputChannel: vscode.OutputChannel;
let statusProvider: MCPStatusProvider;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Activating VSCode MCP Server Extension');

    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('MCP Server');
    context.subscriptions.push(outputChannel);

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'mcpServer.status';
    statusBarItem.text = '$(server-environment) MCP: Stopped';
    statusBarItem.tooltip = 'Click to view MCP Server status';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Create tree view provider for MCP status
    statusProvider = new MCPStatusProvider(context);
    vscode.window.createTreeView('mcpServerView', {
        treeDataProvider: statusProvider,
        showCollapseAll: true
    });

    // Register commands
    const commands = [
        vscode.commands.registerCommand('mcpServer.start', startMCPServer),
        vscode.commands.registerCommand('mcpServer.stop', stopMCPServer),
        vscode.commands.registerCommand('mcpServer.restart', restartMCPServer),
        vscode.commands.registerCommand('mcpServer.status', showMCPServerStatus),
        vscode.commands.registerCommand('mcpServer.openConfig', openMCPConfig),
        vscode.commands.registerCommand('mcpServer.showLogs', showMCPLogs)
    ];

    context.subscriptions.push(...commands);

    // Set context for conditional UI elements
    vscode.commands.executeCommand('setContext', 'mcpServer.enabled', true);

    // Auto-start server if configured
    const config = vscode.workspace.getConfiguration('mcpServer');
    if (config.get('autoStart', true)) {
        setTimeout(() => {
            startMCPServer();
        }, 1000); // Delay to let VSCode fully initialize
    }

    outputChannel.appendLine('VSCode MCP Server Extension activated');
}

export function deactivate() {
    console.log('Deactivating VSCode MCP Server Extension');
    
    if (mcpServer && mcpServer.isServerRunning()) {
        mcpServer.stop();
    }
    
    if (outputChannel) {
        outputChannel.appendLine('VSCode MCP Server Extension deactivated');
    }
}

async function startMCPServer() {
    if (mcpServer && mcpServer.isServerRunning()) {
        vscode.window.showWarningMessage('MCP Server is already running');
        return;
    }

    try {
        const config = vscode.workspace.getConfiguration('mcpServer');
        
        const serverConfig = {
            port: config.get('port', 3001),
            host: config.get('host', 'localhost'),
            logLevel: config.get('logLevel', 'info'),
            maxConnections: config.get('maxConnections', 10),
            enableCORS: config.get('enableCORS', true)
        };

        mcpServer = new MCPServerInstance(serverConfig, outputChannel);
        
        outputChannel.appendLine('Starting MCP Server...');
        
        await mcpServer.start();
        
        updateStatusBarItem(true);
        statusProvider.refresh();
        
        vscode.window.showInformationMessage(
            `MCP Server started on ${serverConfig.host}:${serverConfig.port}`,
            'View Logs'
        ).then(selection => {
            if (selection === 'View Logs') {
                showMCPLogs();
            }
        });

    } catch (error) {
        const errorMessage = `Failed to start MCP Server: ${error}`;
        outputChannel.appendLine(errorMessage);
        vscode.window.showErrorMessage(errorMessage);
        updateStatusBarItem(false);
    }
}

async function stopMCPServer() {
    if (!mcpServer || !mcpServer.isServerRunning()) {
        vscode.window.showWarningMessage('MCP Server is not running');
        return;
    }

    try {
        outputChannel.appendLine('Stopping MCP Server...');
        
        await mcpServer.stop();
        mcpServer = undefined;
        
        updateStatusBarItem(false);
        statusProvider.refresh();
        
        vscode.window.showInformationMessage('MCP Server stopped');
        
    } catch (error) {
        const errorMessage = `Failed to stop MCP Server: ${error}`;
        outputChannel.appendLine(errorMessage);
        vscode.window.showErrorMessage(errorMessage);
    }
}

async function restartMCPServer() {
    outputChannel.appendLine('Restarting MCP Server...');
    
    await stopMCPServer();
    
    // Wait a moment before restarting
    setTimeout(async () => {
        await startMCPServer();
    }, 1000);
}

function showMCPServerStatus() {
    const isRunning = mcpServer && mcpServer.isServerRunning();
    const config = vscode.workspace.getConfiguration('mcpServer');
    
    const status = {
        running: isRunning,
        host: config.get('host', 'localhost'),
        port: config.get('port', 3001),
        autoStart: config.get('autoStart', true),
        logLevel: config.get('logLevel', 'info')
    };

    const statusMessage = `
MCP Server Status:
- Running: ${status.running ? '✅ Yes' : '❌ No'}
- Host: ${status.host}
- Port: ${status.port}  
- Auto Start: ${status.autoStart ? 'Enabled' : 'Disabled'}
- Log Level: ${status.logLevel}
    `.trim();

    vscode.window.showInformationMessage(statusMessage, 
        ...(isRunning ? ['Stop Server', 'View Logs'] : ['Start Server']),
        'Configure'
    ).then(selection => {
        switch (selection) {
            case 'Start Server':
                startMCPServer();
                break;
            case 'Stop Server':
                stopMCPServer();
                break;
            case 'View Logs':
                showMCPLogs();
                break;
            case 'Configure':
                openMCPConfig();
                break;
        }
    });
}

function openMCPConfig() {
    vscode.commands.executeCommand('workbench.action.openSettings', 'mcpServer');
}

function showMCPLogs() {
    outputChannel.show(true);
}

function updateStatusBarItem(isRunning: boolean) {
    if (isRunning) {
        const config = vscode.workspace.getConfiguration('mcpServer');
        const port = config.get('port', 3001);
        statusBarItem.text = `$(server-environment) MCP: Running:${port}`;
        statusBarItem.tooltip = `MCP Server is running on port ${port}. Click for status.`;
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
    } else {
        statusBarItem.text = '$(server-environment) MCP: Stopped';
        statusBarItem.tooltip = 'MCP Server is stopped. Click to view status.';
        statusBarItem.backgroundColor = undefined;
    }
}