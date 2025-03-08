import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface MCPServer {
  id: string;
  name: string;
  command: string;
  port: number;
  autoStart?: boolean;
}

export interface RunningServer {
  server: MCPServer;
  process: child_process.ChildProcess;
  outputChannel: vscode.OutputChannel;
}

export class ServerManager {
  private context: vscode.ExtensionContext;
  private runningServers: Map<string, RunningServer> = new Map();
  private logsDir: string;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.logsDir = path.join(context.globalStorageUri.fsPath, 'logs');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    // Auto-start servers marked for auto-start
    this.autoStartServers();
  }

  private autoStartServers(): void {
    const servers = this.getServers();
    servers.forEach(server => {
      if (server.autoStart) {
        this.startServer(server);
      }
    });
  }

  public getServers(): MCPServer[] {
    const config = vscode.workspace.getConfiguration('mcpServerRunner');
    return config.get<MCPServer[]>('servers') || [];
  }

  public async saveServer(server: MCPServer): Promise<void> {
    const servers = this.getServers();
    const index = servers.findIndex(s => s.id === server.id);
    
    if (index >= 0) {
      servers[index] = server;
    } else {
      servers.push(server);
    }
    
    await vscode.workspace.getConfiguration('mcpServerRunner').update('servers', servers, vscode.ConfigurationTarget.Global);
  }

  public async deleteServer(serverId: string): Promise<void> {
    // Stop the server if it's running
    if (this.isServerRunning(serverId)) {
      await this.stopServer(serverId);
    }
    
    const servers = this.getServers();
    const updatedServers = servers.filter(s => s.id !== serverId);
    await vscode.workspace.getConfiguration('mcpServerRunner').update('servers', updatedServers, vscode.ConfigurationTarget.Global);
  }

  public async startServer(server: MCPServer): Promise<void> {
    if (this.isServerRunning(server.id)) {
      vscode.window.showInformationMessage(`Server ${server.name} is already running`);
      return;
    }

    try {
      const outputChannel = vscode.window.createOutputChannel(`MCP Server: ${server.name}`);
      outputChannel.show();
      
      // Split the command into the executable and arguments
      const parts = server.command.split(' ');
      const executable = parts[0];
      const args = parts.slice(1);
      
      const proc = child_process.spawn(executable, args, {
        shell: true
      });
      
      this.runningServers.set(server.id, {
        server,
        process: proc,
        outputChannel
      });
      
      outputChannel.appendLine(`Starting MCP server: ${server.name}`);
      outputChannel.appendLine(`Command: ${server.command}`);
      
      proc.stdout?.on('data', (data) => {
        outputChannel.append(data.toString());
        this.logToFile(server.id, data.toString());
      });
      
      proc.stderr?.on('data', (data) => {
        outputChannel.append(data.toString());
        this.logToFile(server.id, data.toString());
      });
      
      proc.on('close', (code) => {
        outputChannel.appendLine(`\nServer process exited with code ${code}`);
        // Ensure the server is removed from the running servers map
        this.runningServers.delete(server.id);
        // Refresh the tree view to update the UI
        vscode.commands.executeCommand('mcp-server-runner.refresh');
      });
      
      vscode.window.showInformationMessage(`Started MCP server: ${server.name}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to start server ${server.name}: ${error}`);
    }
  }

  public async stopServer(serverId: string): Promise<void> {
    const runningServer = this.runningServers.get(serverId);
    if (!runningServer) {
      return;
    }
    
    try {
      // Kill the process
      if (process.platform === 'win32') {
        child_process.exec(`taskkill /pid ${runningServer.process.pid} /T /F`);
        // Remove from running servers after killing the process
        this.runningServers.delete(serverId);
        // Refresh the tree view to update the UI
        vscode.commands.executeCommand('mcp-server-runner.refresh');
      } else {
        runningServer.process.kill('SIGTERM');
        
        // Give it a moment to shut down gracefully
        setTimeout(() => {
          if (this.runningServers.has(serverId)) {
            runningServer.process.kill('SIGKILL');
            this.runningServers.delete(serverId);
            // Refresh the tree view to update the UI
            vscode.commands.executeCommand('mcp-server-runner.refresh');
          }
        }, 3000);
      }
      
      runningServer.outputChannel.appendLine('\nStopping server...');
      vscode.window.showInformationMessage(`Stopped MCP server: ${runningServer.server.name}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to stop server ${runningServer.server.name}: ${error}`);
    }
  }

  public isServerRunning(serverId: string): boolean {
    return this.runningServers.has(serverId);
  }

  public getRunningServer(serverId: string): RunningServer | undefined {
    return this.runningServers.get(serverId);
  }

  private logToFile(serverId: string, data: string): void {
    const logFile = path.join(this.logsDir, `${serverId}.log`);
    fs.appendFileSync(logFile, data);
  }

  public getServerLogs(serverId: string): string {
    const logFile = path.join(this.logsDir, `${serverId}.log`);
    if (fs.existsSync(logFile)) {
      return fs.readFileSync(logFile, 'utf8');
    }
    return '';
  }

  public clearServerLogs(serverId: string): void {
    const logFile = path.join(this.logsDir, `${serverId}.log`);
    if (fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, '');
    }
  }
} 