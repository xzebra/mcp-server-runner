# MCP Server Runner

A VS Code / Cursor extension for managing and running Model Context Protocol (MCP) servers locally.

## Features

- Configure and save multiple MCP server configurations
- Start and stop MCP servers with a single click
- View server logs directly in the editor
- Auto-start servers when VS Code starts

## Usage

### Adding a Server

1. Click the MCP Servers icon in the activity bar
2. Click the "+" button or use the command "MCP: Add Server Configuration"
3. Enter the server details:
   - Name: A friendly name for your server
   - Command: The full command to start the server (e.g., `python -m mcp_server --host 127.0.0.1 --port 8000`)
   - Port: The port number the server will listen on
   - Auto-start: Whether to start the server automatically when VS Code starts

### Starting a Server

- Click on a server in the MCP Servers view to start it
- Or right-click and select "Start Server"
- Or use the command "MCP: Start Server"

### Stopping a Server

- Click on a running server in the MCP Servers view to stop it
- Or right-click and select "Stop Server"
- Or use the command "MCP: Stop Server"

### Viewing Logs

- Right-click on a server and select "View Logs"
- Or use the command "MCP: View Server Logs"

### Editing a Server

- Right-click on a server and select "Edit Server"
- Or use the command "MCP: Edit Server Configuration"

### Deleting a Server

- Right-click on a server and select "Delete Server"
- Or use the command "MCP: Delete Server Configuration"

## Requirements

- VS Code 1.80.0 or higher

## Extension Settings

This extension contributes the following settings:

* `mcpServerRunner.servers`: List of MCP server configurations

## Development

### Building the Extension

```bash
npm install
npm run compile
```

### Packaging the Extension

```bash
npm run package
```

## License

MIT 