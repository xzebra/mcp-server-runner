import * as vscode from 'vscode';
import { ServerProvider } from './serverProvider';
import { ServerManager } from './serverManager';
import { addServerCommand } from './commands/addServer';
import { editServerCommand } from './commands/editServer';
import { deleteServerCommand } from './commands/deleteServer';
import { startServerCommand } from './commands/startServer';
import { stopServerCommand } from './commands/stopServer';
import { viewLogsCommand } from './commands/viewLogs';

export function activate(context: vscode.ExtensionContext) {
  console.log('MCP Server Runner extension is now active');

  // Initialize the server manager
  const serverManager = new ServerManager(context);
  
  // Register the tree data provider
  const serverProvider = new ServerProvider(serverManager);
  vscode.window.registerTreeDataProvider('mcpServersView', serverProvider);
  
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('mcp-server-runner.addServer', () => 
      addServerCommand(serverManager, serverProvider)),
    vscode.commands.registerCommand('mcp-server-runner.editServer', (server) => 
      editServerCommand(serverManager, serverProvider, server)),
    vscode.commands.registerCommand('mcp-server-runner.deleteServer', (server) => 
      deleteServerCommand(serverManager, serverProvider, server)),
    vscode.commands.registerCommand('mcp-server-runner.startServer', (server) => 
      startServerCommand(serverManager, server)),
    vscode.commands.registerCommand('mcp-server-runner.stopServer', (server) => 
      stopServerCommand(serverManager, server)),
    vscode.commands.registerCommand('mcp-server-runner.viewLogs', (server) => 
      viewLogsCommand(serverManager, server)),
    vscode.commands.registerCommand('mcp-server-runner.refresh', () => 
      serverProvider.refresh())
  );
}

export function deactivate() {
  // Clean up any running servers
  console.log('MCP Server Runner extension is now deactivated');
} 