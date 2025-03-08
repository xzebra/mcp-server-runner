import * as vscode from 'vscode';
import { MCPServer, ServerManager } from '../serverManager';
import { ServerProvider } from '../serverProvider';

export async function startServerCommand(
  serverManager: ServerManager,
  server: MCPServer
): Promise<void> {
  try {
    await serverManager.startServer(server);
    // Refresh the tree view to update the UI
    vscode.commands.executeCommand('mcp-server-runner.refresh');
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to start server: ${error}`);
  }
} 