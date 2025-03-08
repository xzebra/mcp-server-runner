import * as vscode from 'vscode';
import { MCPServer, ServerManager } from './serverManager';

export class ServerTreeItem extends vscode.TreeItem {
  constructor(
    public readonly server: MCPServer,
    public readonly serverManager: ServerManager
  ) {
    super(
      server.name,
      vscode.TreeItemCollapsibleState.None
    );

    this.id = server.id;
    this.tooltip = `${server.name} (Port: ${server.port})`;
    this.description = serverManager.isServerRunning(server.id) ? 'Running' : 'Stopped';
    
    this.iconPath = new vscode.ThemeIcon(
      serverManager.isServerRunning(server.id) ? 'play' : 'stop'
    );

    this.contextValue = serverManager.isServerRunning(server.id) ? 'runningServer' : 'stoppedServer';
    
    // Add commands
    this.command = {
      title: 'Select Server',
      command: serverManager.isServerRunning(server.id) 
        ? 'mcp-server-runner.stopServer' 
        : 'mcp-server-runner.startServer',
      arguments: [server]
    };
  }
}

export class ServerProvider implements vscode.TreeDataProvider<ServerTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ServerTreeItem | undefined | null | void> = new vscode.EventEmitter<ServerTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ServerTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private serverManager: ServerManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ServerTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ServerTreeItem): Promise<ServerTreeItem[]> {
    if (element) {
      return [];
    }

    const servers = this.serverManager.getServers();
    return servers.map(server => new ServerTreeItem(server, this.serverManager));
  }
} 