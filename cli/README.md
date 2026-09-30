# mcp-hub CLI

The command-line installer for [MCP Hub](https://github.com/e2sy/mcp-hub) — the homebrew for MCP servers.

## Install

```bash
# Use without installing (recommended)
npx mcp-hub install github

# Or install globally
npm install -g mcp-hub
```

## Usage

```bash
mcp-hub install <name>           # Install a server into all detected AI clients
mcp-hub install <name> -c cursor # Install into a specific client only
mcp-hub list                     # List all available MCP servers
mcp-hub list --category database # Filter by category
mcp-hub list --featured          # Show only featured servers
mcp-hub search "postgres"        # Search by name, tag, or description
mcp-hub info <name>              # Show detailed server info + config JSON
mcp-hub remove <name>            # Remove a server from all clients
mcp-hub clients                  # Show detected AI clients + config paths
mcp-hub installed                # List what's currently installed
mcp-hub categories               # List all categories
mcp-hub update                   # Fetch the latest registry from GitHub
mcp-hub add <github-url>         # Get config template for a custom server
```

## Supported clients

- **Claude Desktop** (macOS, Windows, Linux)
- **Cursor** (macOS, Windows, Linux)
- **Cline** (macOS, Windows, Linux)
- **Windsurf** (macOS, Windows, Linux)

## How it works

1. The CLI bundles the full MCP server registry (30+ servers) — works offline.
2. When you run `install`, it auto-detects which AI clients are installed on your machine.
3. For each detected client, it reads the config file, creates a `.backup`, and writes the new server entry.
4. Restart your AI client and the server is live.

## Requirements

- Node.js 18 or higher
- At least one supported AI client (optional — use `--all-clients` to write config anyway)

## License

MIT
