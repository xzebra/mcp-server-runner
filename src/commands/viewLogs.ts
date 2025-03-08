import * as vscode from 'vscode';
import { MCPServer, ServerManager } from '../serverManager';

export async function viewLogsCommand(
  serverManager: ServerManager,
  server: MCPServer
): Promise<void> {
  try {
    // Get the logs
    const logs = serverManager.getServerLogs(server.id);
    
    // Create a new document with the logs
    const document = await vscode.workspace.openTextDocument({
      content: logs,
      language: 'log'
    });
    
    // Show the document
    await vscode.window.showTextDocument(document);
    
    // Add option to clear logs
    const clearLogsAction = await vscode.window.showInformationMessage(
      `Showing logs for ${server.name}`,
      'Clear Logs'
    );
    
    if (clearLogsAction === 'Clear Logs') {
      serverManager.clearServerLogs(server.id);
      vscode.window.showInformationMessage(`Cleared logs for ${server.name}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to view logs: ${error}`);
  }
} 