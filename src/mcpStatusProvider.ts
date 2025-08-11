import * as vscode from 'vscode';

export class MCPStatusProvider implements vscode.TreeDataProvider<MCPStatusItem> {
    
    private _onDidChangeTreeData: vscode.EventEmitter<MCPStatusItem | undefined | null | void> = new vscode.EventEmitter<MCPStatusItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MCPStatusItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MCPStatusItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MCPStatusItem): Thenable<MCPStatusItem[]> {
        if (!element) {
            return Promise.resolve(this.getRootItems());
        }
        return Promise.resolve([]);
    }

    private getRootItems(): MCPStatusItem[] {
        const config = vscode.workspace.getConfiguration('mcpServer');
        const isRunning = this.isMCPServerRunning();

        return [
            new MCPStatusItem(
                `Status: ${isRunning ? 'Running' : 'Stopped'}`,
                isRunning ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.None,
                {
                    command: 'mcpServer.status',
                    title: 'Show Status'
                },
                isRunning ? 'status-running' : 'status-stopped'
            ),
            new MCPStatusItem(
                `Host: ${config.get('host', 'localhost')}`,
                vscode.TreeItemCollapsibleState.None,
                undefined,
                'host'
            ),
            new MCPStatusItem(
                `Port: ${config.get('port', 3001)}`,
                vscode.TreeItemCollapsibleState.None,
                undefined,
                'port'
            ),
            new MCPStatusItem(
                `Auto Start: ${config.get('autoStart', true) ? 'Enabled' : 'Disabled'}`,
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'mcpServer.openConfig',
                    title: 'Configure'
                },
                'auto-start'
            ),
            new MCPStatusItem(
                'Actions',
                vscode.TreeItemCollapsibleState.Expanded,
                undefined,
                'actions'
            )
        ];
    }

    private isMCPServerRunning(): boolean {
        // This would need to be integrated with the actual server status
        // For now, we'll check if there are any active connections or processes
        return false; // Placeholder
    }
}

class MCPStatusItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        contextValue?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        this.contextValue = contextValue;

        // Set icons based on context
        switch (contextValue) {
            case 'status-running':
                this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
                break;
            case 'status-stopped':
                this.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.red'));
                break;
            case 'host':
                this.iconPath = new vscode.ThemeIcon('globe');
                break;
            case 'port':
                this.iconPath = new vscode.ThemeIcon('plug');
                break;
            case 'auto-start':
                this.iconPath = new vscode.ThemeIcon('gear');
                break;
            case 'actions':
                this.iconPath = new vscode.ThemeIcon('tools');
                break;
        }
    }
}

export { MCPStatusItem };