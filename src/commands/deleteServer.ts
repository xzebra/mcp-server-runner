import * as vscode from 'vscode';
import { MCPServer, ServerManager } from '../serverManager';
import { ServerProvider } from '../serverProvider';

export async function deleteServerCommand(
  serverManager: ServerManager,
  serverProvider: ServerProvider,
  server: MCPServer
): Promise<void> {
  // Confirm deletion
  const confirm = await vscode.window.showWarningMessage(
    `Are you sure you want to delete the server "${server.name}"?`,
    { modal: true },
    'Delete',
    'Cancel'
  );
  
  if (confirm !== 'Delete') {
    return;
  }
  
  // Delete the server
  await serverManager.deleteServer(server.id);
  
  // Refresh the tree view
  serverProvider.refresh();
  
  vscode.window.showInformationMessage(`Deleted MCP server: ${server.name}`);
} 