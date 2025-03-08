import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { MCPServer, ServerManager } from '../serverManager';
import { ServerProvider } from '../serverProvider';

export async function addServerCommand(
  serverManager: ServerManager,
  serverProvider: ServerProvider
): Promise<void> {
  // Get server name
  const name = await vscode.window.showInputBox({
    prompt: 'Enter a name for the MCP server',
    placeHolder: 'My MCP Server'
  });
  
  if (!name) {
    return;
  }
  
  // Get command
  const command = await vscode.window.showInputBox({
    prompt: 'Enter the command to start the MCP server (including all arguments)',
    placeHolder: 'python -m mcp_server --host 127.0.0.1 --port 8000'
  });
  
  if (!command) {
    return;
  }
  
  // Get port
  const portString = await vscode.window.showInputBox({
    prompt: 'Enter the port number',
    placeHolder: '8000',
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
  
  // Create server configuration
  const server: MCPServer = {
    id: uuidv4(),
    name,
    command,
    port,
    autoStart: autoStartItem?.label === 'Yes'
  };
  
  // Save the server configuration
  await serverManager.saveServer(server);
  
  // Refresh the tree view
  serverProvider.refresh();
  
  vscode.window.showInformationMessage(`Added MCP server: ${name}`);
  
  // Ask if the user wants to start the server now
  const startNowItem = await vscode.window.showQuickPick(
    ['Yes', 'No'].map(label => ({ label })),
    {
      placeHolder: 'Start the server now?'
    }
  );
  
  if (startNowItem?.label === 'Yes') {
    await serverManager.startServer(server);
    serverProvider.refresh();
  }
} 