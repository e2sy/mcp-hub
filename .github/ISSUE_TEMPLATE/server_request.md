---
name: Server request
about: Request adding a new MCP server to the directory
title: '[SERVER] '
labels: server-request
assignees: ''
---

## Server name

The display name of the MCP server.

## Repository URL

Link to the GitHub repo.

## Category

Which category does this fit? (database / search / filesystem / api / productivity / devtools / cloud / communication / data / ai)

## Description

One sentence describing what this server does.

## Install command

The `npx` or `npm` command to install it.

## Config JSON

The config snippet for Claude Desktop (or the most common client).

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {}
    }
  }
}
```

## Why should this be added?

Why is this server useful? Who is the target audience?

## Checklist

- [ ] The server is open source
- [ ] The server has a working npx/npm install
- [ ] The repo has a README
- [ ] The config JSON above is tested and working
