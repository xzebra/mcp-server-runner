import * as vscode from 'vscode';
import { MCPServer, ServerManager } from '../serverManager';
import { ServerProvider } from '../serverProvider';

export async function editServerCommand(
  serverManager: ServerManager,
  serverProvider: ServerProvider,
  server: MCPServer
): Promise<void> {
  // Check if server is running
  if (serverManager.isServerRunning(server.id)) {
    const stopFirst = await vscode.window.showQuickPick(
      ['Yes', 'No'].map(label => ({ label })),
      {
        placeHolder: 'Server is running. Stop it before editing?'
      }
    );
    
    if (stopFirst?.label === 'Yes') {
      await serverManager.stopServer(server.id);
      serverProvider.refresh();
    } else {
      vscode.window.showInformationMessage('Cannot edit a running server. Please stop it first.');
      return;
    }
  }
  
  // Get server name
  const name = await vscode.window.showInputBox({
    prompt: 'Enter a name for the MCP server',
    value: server.name
  });
  
  if (!name) {
    return;
  }
  
  // Get command
  const command = await vscode.window.showInputBox({
    prompt: 'Enter the command to start the MCP server (including all arguments)',
    value: server.command
  });
  
  if (!command) {
    return;
  }
  
  // Get port
  const portString = await vscode.window.showInputBox({
    prompt: 'Enter the port number',
    value: server.port.toString(),
    validateInput: (value) => {
      const port = parseInt(value);
      if (isNaN(port) || port < 1 || port > 65535) {
        return 'Please enter a valid port number (1-65535)';
      }
      return null;
    }
  });
  
  if (!portString) {
    return;
  }
  
  const port = parseInt(portString);
  
  // Ask about auto-start
  const autoStartItem = await vscode.window.showQuickPick(
    ['Yes', 'No'].map(label => ({ label })),
    {
      placeHolder: 'Auto-start server when extension activates?'
    }
  );
  
  // Create updated server configuration
  const updatedServer: MCPServer = {
    ...server,
    name,
    command,
    port,
    autoStart: autoStartItem?.label === 'Yes'
  };
  
  // Save the server configuration
  await serverManager.saveServer(updatedServer);
  
  // Refresh the tree view
  serverProvider.refresh();
  
  vscode.window.showInformationMessage(`Updated MCP server: ${name}`);
} 