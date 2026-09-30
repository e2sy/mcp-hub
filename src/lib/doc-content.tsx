import { CodeBlock, CodeTabs } from '@/components/docs/code-block'
import { Callout } from '@/components/docs/callout'

interface DocContent {
  body: React.ReactNode
}

export const docContent: Record<string, DocContent> = {
  introduction: {
    body: (
      <>
        <p className="text-base leading-relaxed text-foreground/90">
          <strong>MCP Hub</strong> is an open-source directory and CLI tool for the{' '}
          <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="text-primary hover:underline">
            Model Context Protocol
          </a>{' '}
          — an open standard introduced by Anthropic that lets AI assistants like Claude, Cursor, and Cline talk to external tools, databases, and APIs in a uniform way.
        </p>
        <p className="text-base leading-relaxed text-foreground/90">
          Think of it as <strong>homebrew for MCP servers</strong>: one command to browse, install, and configure any MCP server across all your AI clients.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Why MCP Hub?</h2>
        <p className="text-base text-foreground/90">
          Without MCP Hub, installing an MCP server requires finding the repo, reading the README, locating your AI client&apos;s config file, manually editing JSON, and hoping you don&apos;t break it. MCP Hub does all of this in one command.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold text-red-500">Without MCP Hub</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Search GitHub for an MCP server</li>
              <li>• Read the README to find the config</li>
              <li>• Find your client&apos;s config file path</li>
              <li>• Manually edit JSON</li>
              <li>• Repeat for each AI client</li>
              <li>• No backup if something breaks</li>
            </ul>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h3 className="font-semibold text-primary">With MCP Hub</h3>
            <ul className="mt-2 space-y-1 text-sm text-foreground/90">
              <li>✓ One command: <code className="rounded bg-muted px-1">mcp-hub install</code></li>
              <li>✓ Auto-detects all AI clients</li>
              <li>✓ Writes correct config automatically</li>
              <li>✓ Creates .backup before every write</li>
              <li>✓ Works across Claude, Cursor, Cline, Windsurf</li>
              <li>✓ Diagnose issues with <code className="rounded bg-muted px-1">doctor</code></li>
            </ul>
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold">What&apos;s included</h2>
        <ul className="space-y-2 text-base text-foreground/90">
          <li><strong>CLI tool</strong> — 17 commands for installing, managing, and diagnosing MCP servers</li>
          <li><strong>Directory website</strong> — Browse 34+ verified MCP servers across 10 categories</li>
          <li><strong>AI recommender</strong> — Describe what you want to build, get server recommendations</li>
          <li><strong>Auto-discovery</strong> — Weekly GitHub Action finds new MCP servers automatically</li>
          <li><strong>Star sync</strong> — Weekly GitHub Action keeps star counts fresh</li>
        </ul>

        <Callout type="tip" title="Ready to start?">
          Jump to the <a href="/docs/quickstart" className="text-primary hover:underline">Quick Start</a> guide to install your first MCP server in 60 seconds.
        </Callout>
      </>
    ),
  },

  installation: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          MCP Hub requires <strong>Node.js 18 or higher</strong>. You can use it without installing (via npx) or install it globally.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Option 1: Use with npx (recommended)</h2>
        <p className="text-base text-foreground/90">
          No installation required — npx downloads and runs the latest version every time:
        </p>
        <CodeBlock code="npx mcp-hub install github" label="Terminal" />

        <Callout type="tip" title="Why npx?">
          You always get the latest version with the newest server registry. No global install to maintain.
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Option 2: Install globally</h2>
        <p className="text-base text-foreground/90">
          If you use MCP Hub frequently, install it globally:
        </p>
        <CodeTabs
          label="Install globally"
          tabs={[
            { label: 'npm', code: 'npm install -g mcp-hub' },
            { label: 'bun', code: 'bun add -g mcp-hub' },
            { label: 'pnpm', code: 'pnpm add -g mcp-hub' },
            { label: 'yarn', code: 'yarn global add mcp-hub' },
          ]}
        />
        <p className="text-base text-foreground/90">Then use it without the <code className="rounded bg-muted px-1">npx</code> prefix:</p>
        <CodeBlock code="mcp-hub install github" label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">System requirements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Requirement</th>
                <th className="py-3 text-left font-semibold">Minimum</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3">Node.js</td><td className="py-3">18.0.0+</td></tr>
              <tr className="border-b border-border/50"><td className="py-3">OS</td><td className="py-3">macOS, Windows, or Linux</td></tr>
              <tr className="border-b border-border/50"><td className="py-3">AI client</td><td className="py-3">Claude Desktop, Cursor, Cline, or Windsurf (optional)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-2xl font-bold">Verify installation</h2>
        <p className="text-base text-foreground/90">Check that the CLI is working:</p>
        <CodeBlock code={'mcp-hub --version\n# or\nnpx mcp-hub --version'} label="Terminal" />
        <p className="text-base text-foreground/90">You should see the version number printed.</p>

        <h2 className="mt-8 text-2xl font-bold">Upgrade</h2>
        <p className="text-base text-foreground/90">If you installed globally, upgrade with:</p>
        <CodeBlock code="npm install -g mcp-hub@latest" label="Terminal" />
      </>
    ),
  },

  quickstart: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          Install your first MCP server in 60 seconds. This guide walks you through installing the GitHub MCP server into Claude Desktop.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Step 1: Install the CLI</h2>
        <p className="text-base text-foreground/90">
          You can use npx (no install) or install globally. For this guide, we&apos;ll use npx:
        </p>
        <CodeBlock code="npx mcp-hub --version" label="Verify the CLI works" />

        <h2 className="mt-8 text-2xl font-bold">Step 2: Check detected clients</h2>
        <p className="text-base text-foreground/90">
          See which AI clients MCP Hub detected on your machine:
        </p>
        <CodeBlock code="npx mcp-hub clients" label="Terminal" />
        <p className="text-base text-foreground/90">You&apos;ll see output like:</p>
        <CodeBlock code={`✓ Claude Desktop     detected
  ~/Library/Application Support/Claude/claude_desktop_config.json

✗ Cursor             not found
✗ Cline              not found
✗ Windsurf           not found`} label="Output" />

        <Callout type="info" title="No clients detected?">
          If no clients are detected, install Claude Desktop, Cursor, Cline, or Windsurf first. Or use <code className="rounded bg-muted px-1">--all-clients</code> to write configs anyway.
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Step 3: Install a server</h2>
        <p className="text-base text-foreground/90">Install the GitHub MCP server:</p>
        <CodeBlock code="npx mcp-hub install github" label="Terminal" />
        <p className="text-base text-foreground/90">The CLI will:</p>
        <ol className="ml-6 list-decimal space-y-1 text-base text-foreground/90">
          <li>Find the GitHub server in the registry</li>
          <li>Detect your AI clients</li>
          <li>Back up the existing config file</li>
          <li>Write the GitHub MCP server config</li>
          <li>Print a summary of what it did</li>
        </ol>

        <h2 className="mt-8 text-2xl font-bold">Step 4: Add your GitHub token</h2>
        <p className="text-base text-foreground/90">
          The GitHub MCP server needs a personal access token. Create one at{' '}
          <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-primary hover:underline">github.com/settings/tokens</a>{' '}
          then edit the config:
        </p>
        <CodeBlock code="npx mcp-hub config edit claude" label="Open config in $EDITOR" />
        <p className="text-base text-foreground/90">Replace <code className="rounded bg-muted px-1">ghp_YOUR_TOKEN</code> with your actual token.</p>

        <Callout type="warning" title="Never commit your token">
          Add your config file to <code className="rounded bg-muted px-1">.gitignore</code> if it&apos;s in a repo. Never share your token publicly.
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Step 5: Verify with doctor</h2>
        <p className="text-base text-foreground/90">Run the doctor command to verify your config is valid:</p>
        <CodeBlock code="npx mcp-hub doctor" label="Terminal" />
        <p className="text-base text-foreground/90">If everything looks good, you&apos;ll see:</p>
        <CodeBlock code={`✓ github        OK`} label="Output" />

        <h2 className="mt-8 text-2xl font-bold">Step 6: Restart your AI client</h2>
        <p className="text-base text-foreground/90">
          Quit Claude Desktop completely and reopen it. The GitHub MCP server is now available — ask Claude to &quot;list my GitHub repos&quot; and watch it work.
        </p>

        <Callout type="tip" title="What&apos;s next?">
          <ul className="space-y-1">
            <li>• <a href="/docs/first-server" className="text-primary hover:underline">Install Your First Server</a> — detailed walkthrough</li>
            <li>• <a href="/docs/share-setup" className="text-primary hover:underline">Share Your Setup</a> — export configs for teammates</li>
            <li>• <a href="/docs/doctor" className="text-primary hover:underline">mcp-hub doctor</a> — diagnose any issues</li>
          </ul>
        </Callout>
      </>
    ),
  },

  'how-it-works': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          Understanding how MCP Hub works under the hood helps you debug issues and contribute to the project.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Architecture</h2>
        <CodeBlock code={`┌──────────────────────────────────────────────────┐
│                mcp-hub install github             │
└──────────────────────┬───────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │  Load bundled registry  │
          │  (34 servers, offline)  │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │  Detect AI clients on   │
          │  macOS/Windows/Linux    │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │  Backup existing config │
          │  (.backup file created) │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │  Write MCP server config│
          │  to each client's file  │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │  Print results + tell   │
          │  user to restart client │
          └─────────────────────────┘`} label="Install flow" />

        <h2 className="mt-8 text-2xl font-bold">The registry</h2>
        <p className="text-base text-foreground/90">
          The registry (<code className="rounded bg-muted px-1">public/servers.json</code>) is the single source of truth. It&apos;s:
        </p>
        <ul className="ml-6 list-disc space-y-1 text-base text-foreground/90">
          <li><strong>Bundled in the CLI</strong> — works offline, no internet required</li>
          <li><strong>Served by the website</strong> — used by the directory browser</li>
          <li><strong>Auto-updated weekly</strong> — star sync + auto-discovery GitHub Actions</li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">Client detection</h2>
        <p className="text-base text-foreground/90">
          MCP Hub knows where each AI client stores its config on macOS, Windows, and Linux:
        </p>
        <CodeTabs
          tabs={[
            { label: 'Claude Desktop', code: `# macOS
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows
%APPDATA%\\Claude\\claude_desktop_config.json

# Linux
~/.config/Claude/claude_desktop_config.json` },
            { label: 'Cursor', code: `# All platforms
~/.cursor/mcp.json` },
            { label: 'Cline', code: `# macOS
~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

# Windows
%APPDATA%\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\settings\\cline_mcp_settings.json` },
            { label: 'Windsurf', code: `# All platforms
~/.codeium/windsurf/mcp_config.json` },
          ]}
        />

        <h2 className="mt-8 text-2xl font-bold">Safe writes</h2>
        <p className="text-base text-foreground/90">
          Every config write is safe:
        </p>
        <ol className="ml-6 list-decimal space-y-1 text-base text-foreground/90">
          <li>Reads the existing config file</li>
          <li>Creates a <code className="rounded bg-muted px-1">.backup</code> copy</li>
          <li>Parses the JSON (fails safely if invalid)</li>
          <li>Adds the new server to <code className="rounded bg-muted px-1">mcpServers</code></li>
          <li>Writes back with 2-space indentation</li>
        </ol>
        <Callout type="info" title="Backups">
          The <code className="rounded bg-muted px-1">.backup</code> file is created next to the original. Use <code className="rounded bg-muted px-1">mcp-hub restore</code> to roll back.
        </Callout>
      </>
    ),
  },

  install: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">install</code> command installs an MCP server into your AI client(s). It&apos;s the most-used command in MCP Hub.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Usage</h2>
        <CodeBlock code="mcp-hub install <name> [options]" label="Syntax" />

        <h2 className="mt-8 text-2xl font-bold">Options</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Flag</th>
                <th className="py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">-c, --client &lt;client&gt;</td><td className="py-3">Install only to a specific client</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">--all-clients</td><td className="py-3">Install to all known clients, even if not detected</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-2xl font-bold">Examples</h2>
        <h3 className="mt-6 text-xl font-semibold">Install into all detected clients</h3>
        <CodeBlock code="mcp-hub install github" label="Terminal" />

        <h3 className="mt-6 text-xl font-semibold">Install into a specific client only</h3>
        <CodeBlock code="mcp-hub install github --client cursor" label="Terminal" />
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">--client</code> flag accepts partial matches: <code className="rounded bg-muted px-1">claude</code>, <code className="rounded bg-muted px-1">cursor</code>, <code className="rounded bg-muted px-1">cline</code>, <code className="rounded bg-muted px-1">windsurf</code>.
        </p>

        <h3 className="mt-6 text-xl font-semibold">Force install even if no client detected</h3>
        <CodeBlock code="mcp-hub install github --all-clients" label="Terminal" />
        <Callout type="warning" title="Use with caution">
          <code className="rounded bg-muted px-1">--all-clients</code> writes config files even if the AI client isn&apos;t installed. Useful for setting up a new machine before installing the client.
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">What happens</h2>
        <ol className="ml-6 list-decimal space-y-1 text-base text-foreground/90">
          <li>Looks up the server in the bundled registry</li>
          <li>Detects which AI clients are installed</li>
          <li>For each detected client:
            <ul className="ml-6 list-disc mt-1">
              <li>Reads the existing config file</li>
              <li>Creates a <code className="rounded bg-muted px-1">.backup</code></li>
              <li>Adds the server to <code className="rounded bg-muted px-1">mcpServers</code></li>
              <li>Writes the updated config</li>
            </ul>
          </li>
          <li>Prints a summary of what was installed where</li>
        </ol>

        <Callout type="tip" title="Already installed?">
          If the server is already in the config, MCP Hub skips it (status: <code className="rounded bg-muted px-1">already-exists</code>). Use <code className="rounded bg-muted px-1">mcp-hub update &lt;name&gt;</code> to refresh the config.
        </Callout>
      </>
    ),
  },

  list: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">list</code> command shows all MCP servers in the registry.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Usage</h2>
        <CodeBlock code="mcp-hub list [options]" label="Syntax" />

        <h2 className="mt-8 text-2xl font-bold">Options</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Flag</th>
                <th className="py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">-c, --category &lt;cat&gt;</td><td className="py-3">Filter by category</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">--featured</td><td className="py-3">Show only featured servers</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-2xl font-bold">Examples</h2>
        <CodeBlock code="mcp-hub list" label="List all servers" />
        <CodeBlock code="mcp-hub list --category database" label="Filter by category" />
        <CodeBlock code="mcp-hub list --featured" label="Show only featured servers" />

        <h2 className="mt-8 text-2xl font-bold">Output</h2>
        <CodeBlock code={`Name            Category      Stars  Description
────────────────────────────────────────────────────────
★ GitHub        devtools      6.8k   Manage repos, issues, PRs
★ Filesystem    filesystem    5.4k   Read, write, and manage files
★ PostgreSQL    database      4.2k   Query PostgreSQL databases
...`} label="Sample output" />
        <p className="text-base text-foreground/90">
          Servers marked with <code className="rounded bg-muted px-1">★</code> are featured.
        </p>
      </>
    ),
  },

  search: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">search</code> command searches the registry by name, description, tag, or author.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Usage</h2>
        <CodeBlock code={'mcp-hub search "<query>"'} label="Syntax" />

        <h2 className="mt-8 text-2xl font-bold">Examples</h2>
        <CodeBlock code={'mcp-hub search "postgres"'} label="Search by name" />
        <CodeBlock code={'mcp-hub search "database"'} label="Search by category/tag" />
        <CodeBlock code={'mcp-hub search "@modelcontextprotocol"'} label="Search by author" />

        <h2 className="mt-8 text-2xl font-bold">Output</h2>
        <CodeBlock code={`Search: "postgres" → 2 results

Name         Category   Stars  Description
─────────────────────────────────────────────
PostgreSQL   database   4.2k   Query and manage PostgreSQL
SQLite       database   2.1k   Lightweight SQLite access`} label="Sample output" />

        <Callout type="tip" title="Search is fuzzy">
          The search matches across name, description, tags, and author. Try keywords like &quot;payments&quot;, &quot;github&quot;, &quot;search&quot;, &quot;ai&quot;.
        </Callout>
      </>
    ),
  },

  doctor: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">doctor</code> command diagnoses issues with your MCP server configurations. It&apos;s the first thing to run when something isn&apos;t working.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Usage</h2>
        <CodeBlock code="mcp-hub doctor" label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">What it checks</h2>
        <ol className="ml-6 list-decimal space-y-1 text-base text-foreground/90">
          <li><strong>JSON validity</strong> — Is the config file valid JSON?</li>
          <li><strong>mcpServers key</strong> — Does it have a <code className="rounded bg-muted px-1">mcpServers</code> object?</li>
          <li><strong>Command field</strong> — Does each server have a <code className="rounded bg-muted px-1">command</code>?</li>
          <li><strong>Args field</strong> — Are <code className="rounded bg-muted px-1">args</code> present and an array?</li>
          <li><strong>Env vars</strong> — Are there placeholder values like <code className="rounded bg-muted px-1">YOUR_TOKEN</code>?</li>
        </ol>

        <h2 className="mt-8 text-2xl font-bold">Sample output</h2>
        <CodeBlock code={`◆ MCP Hub Doctor — diagnosing configs

  Cursor
  ~/.cursor/mcp.json
    ✓ filesystem           OK
    ✗ github               1 issue(s)
      ⚠ Missing env var: GITHUB_PERSONAL_ACCESS_TOKEN (placeholder value)

  ────────────────────────────────────────
  Scanned 2 server(s) across 1 client(s)
  ✗ 1 issue(s) found
  Fix placeholder env vars with your real API tokens.`} label="Output" />

        <Callout type="warning" title="Common issues">
          <ul className="space-y-1">
            <li>• <strong>Placeholder env vars</strong> — Replace <code className="rounded bg-muted px-1">YOUR_TOKEN</code> with real values</li>
            <li>• <strong>Missing command</strong> — The server config is malformed</li>
            <li>• <strong>Invalid JSON</strong> — A syntax error in the config file</li>
          </ul>
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Fixing issues</h2>
        <p className="text-base text-foreground/90">To fix a placeholder env var:</p>
        <CodeBlock code={'mcp-hub config edit cursor\n# Replace YOUR_TOKEN with your actual token'} label="Fix env vars" />
      </>
    ),
  },

  backup: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">backup</code> and <code className="rounded bg-muted px-1">restore</code> commands let you save and restore your AI client configs.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Create a backup</h2>
        <CodeBlock code="mcp-hub backup" label="Terminal" />
        <p className="text-base text-foreground/90">Or with a label for easy identification:</p>
        <CodeBlock code={'mcp-hub backup --label "pre-cleanup"'} label="Labeled backup" />

        <h2 className="mt-8 text-2xl font-bold">List backups</h2>
        <CodeBlock code="mcp-hub backup --list" label="Terminal" />
        <CodeBlock code={`◆ Available backups
  Location: ~/.mcp-hub/backups

  • 2026-10-01T09-30-00-pre-cleanup (pre-cleanup)
    10/1/2026, 9:30:00 AM · 2 client(s)
  • 2026-09-28T14-22-01
    9/28/2026, 2:22:01 PM · 1 client(s)`} label="Output" />

        <h2 className="mt-8 text-2xl font-bold">Restore a backup</h2>
        <CodeBlock code="mcp-hub restore 2026-10-01T09-30-00-pre-cleanup" label="Terminal" />
        <Callout type="info" title="Automatic pre-restore backup">
          Before restoring, MCP Hub automatically creates a backup of your current configs. You can always roll back.
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Delete a backup</h2>
        <CodeBlock code={'mcp-hub backup --delete 2026-10-01T09-30-00-pre-cleanup'} label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">Where backups are stored</h2>
        <CodeBlock code={'~/.mcp-hub/backups/\n  └── <timestamp>-<label>/\n      ├── manifest.json\n      ├── claude-desktop.json\n      └── cursor.json'} label="Backup structure" />
      </>
    ),
  },

  bundle: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">bundle</code> command lets you export your installed servers as a portable JSON file and install them on another machine.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Export your setup</h2>
        <CodeBlock code={'mcp-hub bundle export my-setup.json --name "My Dev Setup" --description "Daily driver"'} label="Terminal" />
        <p className="text-base text-foreground/90">This creates a JSON file like:</p>
        <CodeBlock code={`{
  "version": "1.0.0",
  "name": "My Dev Setup",
  "description": "Daily driver",
  "servers": [
    "github",
    "filesystem",
    "postgres"
  ]
}`} label="my-setup.json" />

        <h2 className="mt-8 text-2xl font-bold">Install from a bundle</h2>
        <p className="text-base text-foreground/90">On another machine, install all servers from the bundle:</p>
        <CodeBlock code="mcp-hub bundle install my-setup.json" label="Terminal" />
        <p className="text-base text-foreground/90">MCP Hub will install all servers from the bundle into all detected AI clients.</p>

        <Callout type="tip" title="Use cases">
          <ul className="space-y-1">
            <li>• <strong>Team setups</strong> — Share your MCP config with teammates</li>
            <li>• <strong>New machines</strong> — Set up a new laptop in one command</li>
            <li>• <strong>Dotfiles</strong> — Commit your bundle to your dotfiles repo</li>
          </ul>
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Bundle format</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Field</th>
                <th className="py-3 text-left font-semibold">Type</th>
                <th className="py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">version</td><td className="py-3">string</td><td className="py-3">Bundle format version</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">name</td><td className="py-3">string</td><td className="py-3">Human-readable name</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">description</td><td className="py-3">string?</td><td className="py-3">Optional description</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">servers</td><td className="py-3">string[]</td><td className="py-3">Array of server slugs</td></tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },

  init: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">init</code> command scaffolds a new MCP server with TypeScript, build config, and a sample tool.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Usage</h2>
        <CodeBlock code="mcp-hub init <name> [options]" label="Syntax" />

        <h2 className="mt-8 text-2xl font-bold">Options</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Flag</th>
                <th className="py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">-p, --path &lt;path&gt;</td><td className="py-3">Parent directory (defaults to current)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-2xl font-bold">Example</h2>
        <CodeBlock code="mcp-hub init my-awesome-server" label="Terminal" />
        <p className="text-base text-foreground/90">This creates:</p>
        <CodeBlock code={`my-awesome-server/
├── package.json          # with @modelcontextprotocol/sdk
├── tsconfig.json
├── tsup.config.ts
├── .gitignore
├── README.md
└── src/
    └── index.ts          # sample "hello" tool`} label="Generated structure" />

        <h2 className="mt-8 text-2xl font-bold">Next steps</h2>
        <CodeBlock code={`cd my-awesome-server
npm install
npm run build
node dist/index.js  # test it locally`} label="Build and test" />

        <Callout type="tip" title="Publish your server">
          Once your server is ready, submit it to the MCP Hub directory — see <a href="/docs/add-server" className="text-primary hover:underline">Add a Server</a>.
        </Callout>
      </>
    ),
  },

  update: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">update</code> command refreshes installed server configs to the latest registry version.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Three modes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Command</th>
                <th className="py-3 text-left font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">mcp-hub update</td><td className="py-3">Fetch the latest registry from GitHub</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">mcp-hub update &lt;name&gt;</td><td className="py-3">Refresh one server&apos;s config</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">mcp-hub update --all</td><td className="py-3">Refresh all installed servers</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-2xl font-bold">Examples</h2>
        <CodeBlock code="mcp-hub update github" label="Update one server" />
        <CodeBlock code="mcp-hub update --all" label="Update everything" />
        <CodeBlock code="mcp-hub update github --client cursor" label="Update in one client only" />

        <h2 className="mt-8 text-2xl font-bold">How it works</h2>
        <p className="text-base text-foreground/90">
          Update removes the existing server entry and re-installs it with the latest registry config. This ensures any changes to the install command or config JSON propagate.
        </p>
        <Callout type="info" title="When to use">
          Run <code className="rounded bg-muted px-1">update --all</code> after upgrading MCP Hub to pick up new registry entries and config changes.
        </Callout>
      </>
    ),
  },

  'first-server': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          A detailed walkthrough of installing the GitHub MCP server into Claude Desktop — from zero to a working AI assistant that can manage your repos.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Prerequisites</h2>
        <ul className="ml-6 list-disc space-y-1 text-base text-foreground/90">
          <li>Node.js 18+ installed</li>
          <li>Claude Desktop installed</li>
          <li>A GitHub account</li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">Step 1: Create a GitHub token</h2>
        <p className="text-base text-foreground/90">
          Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-primary hover:underline">github.com/settings/tokens</a> and create a fine-grained token with:
        </p>
        <ul className="ml-6 list-disc space-y-1 text-base text-foreground/90">
          <li>Repository access: All repositories (or specific ones)</li>
          <li>Permissions: Contents (read), Issues (read/write), Pull requests (read/write)</li>
        </ul>
        <Callout type="warning" title="Token security">
          Never commit your token to git or share it publicly. Treat it like a password.
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Step 2: Install the GitHub MCP server</h2>
        <CodeBlock code="npx mcp-hub install github" label="Terminal" />
        <p className="text-base text-foreground/90">You&apos;ll see output like:</p>
        <CodeBlock code={`◆ Installing GitHub
  Author:     @modelcontextprotocol
  Category:   devtools
  Stars:      ★ 6.8k

◆ Results
  ✓ Claude Desktop: Added "GitHub" to Claude Desktop
    ~/Library/Application Support/Claude/claude_desktop_config.json

✓ Done! Restart your AI client to activate the new server.`} label="Output" />

        <h2 className="mt-8 text-2xl font-bold">Step 3: Add your token</h2>
        <p className="text-base text-foreground/90">Open the config in your editor:</p>
        <CodeBlock code="npx mcp-hub config edit claude" label="Terminal" />
        <p className="text-base text-foreground/90">Replace <code className="rounded bg-muted px-1">ghp_YOUR_TOKEN</code> with your actual token. Save and close.</p>

        <h2 className="mt-8 text-2xl font-bold">Step 4: Verify with doctor</h2>
        <CodeBlock code="npx mcp-hub doctor" label="Terminal" />
        <p className="text-base text-foreground/90">You should see:</p>
        <CodeBlock code={`✓ github        OK`} label="Output" />

        <h2 className="mt-8 text-2xl font-bold">Step 5: Restart Claude Desktop</h2>
        <p className="text-base text-foreground/90">
          Quit Claude Desktop completely (Cmd+Q on macOS) and reopen it. The GitHub MCP server is now available.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Step 6: Test it</h2>
        <p className="text-base text-foreground/90">In Claude Desktop, try these prompts:</p>
        <CodeBlock code={`"List my GitHub repositories"
"Show me the latest issues in my mcp-hub repo"
"Create a new issue titled 'Test issue' in my mcp-hub repo"`} label="Try these prompts" />

        <Callout type="tip" title="Success!">
          Claude should now be able to read your repos, create issues, and manage PRs — all through the MCP server you just installed.
        </Callout>
      </>
    ),
  },

  'share-setup': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          Share your MCP server setup with teammates or across your own machines using bundles.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Export your setup</h2>
        <p className="text-base text-foreground/90">After installing all the servers you use, export them:</p>
        <CodeBlock code={'mcp-hub bundle export my-setup.json --name "Team Dev Setup" --description "Our standard MCP config"'} label="Terminal" />
        <p className="text-base text-foreground/90">This creates <code className="rounded bg-muted px-1">my-setup.json</code> with all your installed servers.</p>

        <h2 className="mt-8 text-2xl font-bold">Share the file</h2>
        <p className="text-base text-foreground/90">You can share the bundle file by:</p>
        <ul className="ml-6 list-disc space-y-1 text-base text-foreground/90">
          <li>Committing it to a shared repo</li>
          <li>Adding it to your dotfiles</li>
          <li>Sending it via Slack/Discord</li>
          <li>Hosting it on a URL</li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">Install on another machine</h2>
        <p className="text-base text-foreground/90">On a new machine, install all servers from the bundle:</p>
        <CodeBlock code="mcp-hub bundle install my-setup.json" label="Terminal" />
        <p className="text-base text-foreground/90">MCP Hub installs all servers from the bundle into all detected AI clients.</p>

        <Callout type="info" title="Env vars not included">
          Bundles contain server slugs, not your API tokens. Each machine needs its own tokens — use <code className="rounded bg-muted px-1">mcp-hub doctor</code> to find placeholders.
        </Callout>

        <h2 className="mt-8 text-2xl font-bold">Example: Dotfiles workflow</h2>
        <CodeBlock code={`# In your dotfiles repo
my-setup.json

# On a new machine:
git clone https://github.com/you/dotfiles.git ~/dotfiles
npx mcp-hub bundle install ~/dotfiles/my-setup.json`} label="Dotfile setup" />
      </>
    ),
  },

  'build-server': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          Build your own MCP server from scratch and publish it to the MCP Hub directory.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Step 1: Scaffold the server</h2>
        <CodeBlock code="npx mcp-hub init my-awesome-server" label="Terminal" />
        <p className="text-base text-foreground/90">This creates a TypeScript project with a sample tool.</p>

        <h2 className="mt-8 text-2xl font-bold">Step 2: Define your tools</h2>
        <p className="text-base text-foreground/90">Edit <code className="rounded bg-muted px-1">src/index.ts</code> and add your tools:</p>
        <CodeBlock code={`server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_weather',
      description: 'Get the weather for a city',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name' },
        },
        required: ['city'],
      },
    },
  ],
}))`} language="typescript" label="src/index.ts" />

        <h2 className="mt-8 text-2xl font-bold">Step 3: Handle tool calls</h2>
        <CodeBlock code={`server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'get_weather': {
      const city = (args as any)?.city
      // Call your weather API here
      const temp = '72°F'
      return {
        content: [{ type: 'text', text: \`Weather in \${city}: \${temp}\` }],
      }
    }
    default:
      return { content: [{ type: 'text', text: \`Unknown tool: \${name}\` }] }
  }
})`} language="typescript" label="src/index.ts" />

        <h2 className="mt-8 text-2xl font-bold">Step 4: Build and test</h2>
        <CodeBlock code={`cd my-awesome-server
npm install
npm run build
node dist/index.js  # test it runs`} label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">Step 5: Publish to npm</h2>
        <CodeBlock code={`npm login
npm publish`} label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">Step 6: Submit to MCP Hub</h2>
        <p className="text-base text-foreground/90">See <a href="/docs/add-server" className="text-primary hover:underline">Add a Server</a> for instructions on submitting your server to the directory.</p>

        <Callout type="tip" title="Resources">
          <ul className="space-y-1">
            <li>• <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="text-primary hover:underline">MCP Documentation</a></li>
            <li>• <a href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noreferrer" className="text-primary hover:underline">Official MCP servers</a> — great examples</li>
          </ul>
        </Callout>
      </>
    ),
  },

  'diagnose-issues': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          When an MCP server isn&apos;t working, the <code className="rounded bg-muted px-1">doctor</code> command helps you find the problem.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Common issues</h2>

        <h3 className="mt-6 text-xl font-semibold">1. Placeholder env vars</h3>
        <p className="text-base text-foreground/90">
          The most common issue — you installed a server but didn&apos;t replace <code className="rounded bg-muted px-1">YOUR_TOKEN</code> with a real API key.
        </p>
        <CodeBlock code={`✗ github               1 issue(s)
  ⚠ Missing env var: GITHUB_PERSONAL_ACCESS_TOKEN (placeholder value)`} label="Doctor output" />
        <p className="text-base text-foreground/90"><strong>Fix:</strong> Run <code className="rounded bg-muted px-1">mcp-hub config edit</code> and replace the placeholder.</p>

        <h3 className="mt-6 text-xl font-semibold">2. Invalid JSON</h3>
        <p className="text-base text-foreground/90">
          If the config file has a syntax error, the doctor reports it:
        </p>
        <CodeBlock code={`✗ Claude Desktop     Invalid config: Unexpected token } at line 5`} label="Doctor output" />
        <p className="text-base text-foreground/90"><strong>Fix:</strong> Open the config and fix the JSON syntax. Or restore from backup: <code className="rounded bg-muted px-1">mcp-hub restore &lt;name&gt;</code>.</p>

        <h3 className="mt-6 text-xl font-semibold">3. Missing command or args</h3>
        <p className="text-base text-foreground/90">
          If a server entry is malformed (missing <code className="rounded bg-muted px-1">command</code> or <code className="rounded bg-muted px-1">args</code>):
        </p>
        <CodeBlock code={`✗ my-server           2 issue(s)
  ⚠ Missing "command" field
  ⚠ Missing or invalid "args" field`} label="Doctor output" />
        <p className="text-base text-foreground/90"><strong>Fix:</strong> Remove the broken entry and reinstall: <code className="rounded bg-muted px-1">mcp-hub remove my-server &amp;&amp; mcp-hub install my-server</code>.</p>

        <h2 className="mt-8 text-2xl font-bold">Workflow</h2>
        <CodeBlock code={`# 1. Run doctor to find issues
mcp-hub doctor

# 2. Fix issues (edit config or reinstall)
mcp-hub config edit cursor

# 3. Re-run doctor to verify
mcp-hub doctor

# 4. If still broken, restore from backup
mcp-hub backup --list
mcp-hub restore <backup-name>`} label="Diagnostic workflow" />

        <Callout type="tip" title="Still stuck?">
          <a href="https://github.com/e2sy/mcp-hub/discussions" target="_blank" rel="noreferrer" className="text-primary hover:underline">Open a discussion on GitHub</a> — we help fast.
        </Callout>
      </>
    ),
  },

  'multiple-clients': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          MCP Hub supports Claude Desktop, Cursor, Cline, and Windsurf — all at once. Install the same server into all of them with one command.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Install into all detected clients</h2>
        <CodeBlock code="npx mcp-hub install github" label="Terminal" />
        <p className="text-base text-foreground/90">
          If you have Claude Desktop, Cursor, and Cline all installed, the server is added to all three config files.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Install into one specific client</h2>
        <CodeBlock code="npx mcp-hub install github --client cursor" label="Terminal" />
        <p className="text-base text-foreground/90">
          The <code className="rounded bg-muted px-1">--client</code> flag accepts partial matches:
        </p>
        <ul className="ml-6 list-disc space-y-1 text-base text-foreground/90">
          <li><code className="rounded bg-muted px-1">claude</code> → Claude Desktop</li>
          <li><code className="rounded bg-muted px-1">cursor</code> → Cursor</li>
          <li><code className="rounded bg-muted px-1">cline</code> → Cline</li>
          <li><code className="rounded bg-muted px-1">windsurf</code> → Windsurf</li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">See what&apos;s installed where</h2>
        <CodeBlock code="npx mcp-hub installed" label="Terminal" />
        <CodeBlock code={`◆ Installed MCP servers

  Claude Desktop (3)
    • github
    • filesystem
    • postgres

  Cursor (2)
    • github
    • puppeteer`} label="Output" />

        <h2 className="mt-8 text-2xl font-bold">Remove from one client</h2>
        <CodeBlock code="mcp-hub remove github --client cursor" label="Remove from Cursor only" />

        <Callout type="info" title="Different configs per client">
          MCP Hub writes the same server config to each client. If you need different env vars per client (e.g. different tokens), edit each config manually with <code className="rounded bg-muted px-1">mcp-hub config edit &lt;client&gt;</code>.
        </Callout>
      </>
    ),
  },

  'search-api': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The public Search API lets you search the MCP Hub directory programmatically.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Endpoint</h2>
        <CodeBlock code="GET /api/search" label="API endpoint" />

        <h2 className="mt-8 text-2xl font-bold">Parameters</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Param</th>
                <th className="py-3 text-left font-semibold">Type</th>
                <th className="py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">q</td><td className="py-3">string</td><td className="py-3">Search query (required)</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">limit</td><td className="py-3">number</td><td className="py-3">Max results (default: 20)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-2xl font-bold">Example request</h2>
        <CodeTabs
          tabs={[
            { label: 'curl', code: `curl "/api/search?q=postgres&limit=5"` },
            { label: 'JavaScript', code: `const res = await fetch(\n  '/api/search?q=postgres&limit=5'\n)\nconst data = await res.json()\nconsole.log(data.results)` },
            { label: 'Python', code: `import requests\n\nres = requests.get(\n  '/api/search',\n  params={'q': 'postgres', 'limit': 5}\n)\ndata = res.json()\nprint(data['results'])` },
          ]}
        />

        <h2 className="mt-8 text-2xl font-bold">Response</h2>
        <CodeBlock code={`{
  "query": "postgres",
  "results": [
    {
      "slug": "postgres",
      "name": "PostgreSQL",
      "description": "Query and manage your PostgreSQL databases",
      "category": "database",
      "tags": ["sql", "postgres", "database", "query"],
      "stars": 4200,
      "featured": true,
      "verified": true
    }
  ],
  "total": 1
}`} language="json" label="Response body" />
      </>
    ),
  },

  'recommend-api': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The Recommend API uses AI to suggest the best MCP servers for your use case.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Endpoint</h2>
        <CodeBlock code="POST /api/recommend" label="API endpoint" />

        <h2 className="mt-8 text-2xl font-bold">Request body</h2>
        <CodeBlock code={`{
  "query": "I want to build a SaaS that accepts payments"
}`} language="json" label="Request body" />

        <h2 className="mt-8 text-2xl font-bold">Example request</h2>
        <CodeTabs
          tabs={[
            { label: 'curl', code: `curl -X POST /api/recommend \\
  -H "Content-Type: application/json" \\
  -d '{"query": "I want to build a SaaS"}'` },
            { label: 'JavaScript', code: `const res = await fetch(\n  '/api/recommend',\n  {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ query: 'I want to build a SaaS' })\n  }\n)\nconst data = await res.json()` },
          ]}
        />

        <h2 className="mt-8 text-2xl font-bold">Response</h2>
        <CodeBlock code={`{
  "query": "I want to build a SaaS",
  "recommendations": [
    {
      "slug": "stripe",
      "name": "Stripe",
      "description": "Manage payments, customers, subscriptions",
      "reason": "Stripe is essential for accepting payments in a SaaS — handle subscriptions, charges, and customers.",
      "stars": 2480
    },
    {
      "slug": "github",
      "name": "GitHub",
      "reason": "For managing your SaaS source code, issues, and releases from your AI assistant."
    }
  ]
}`} language="json" label="Response body" />

        <Callout type="tip" title="Try it on the website">
          The <a href="/" className="text-primary hover:underline">homepage</a> has a UI for this API — try it without writing any code.
        </Callout>
      </>
    ),
  },

  'servers-api': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          The Servers API lists all MCP servers in the directory with filtering and pagination.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Endpoint</h2>
        <CodeBlock code="GET /api/servers" label="API endpoint" />

        <h2 className="mt-8 text-2xl font-bold">Parameters</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Param</th>
                <th className="py-3 text-left font-semibold">Type</th>
                <th className="py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">q</td><td className="py-3">string</td><td className="py-3">Search query (optional)</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">category</td><td className="py-3">string</td><td className="py-3">Filter by category slug</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">featured</td><td className="py-3">boolean</td><td className="py-3">Show only featured servers</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">limit</td><td className="py-3">number</td><td className="py-3">Max results (default: 50)</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">offset</td><td className="py-3">number</td><td className="py-3">Pagination offset (default: 0)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-2xl font-bold">Example</h2>
        <CodeBlock code={`curl "/api/servers?category=database&limit=10"`} label="curl" />

        <h2 className="mt-8 text-2xl font-bold">Categories</h2>
        <p className="text-base text-foreground/90">Valid category slugs:</p>
        <CodeBlock code={`database, search, filesystem, api, productivity,
devtools, cloud, communication, data, ai`} label="Categories" />
      </>
    ),
  },

  'add-server': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          Built an MCP server? Add it to the MCP Hub directory to get in front of thousands of developers.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Quick start</h2>
        <ol className="ml-6 list-decimal space-y-2 text-base text-foreground/90">
          <li>Fork the <a href="https://github.com/e2sy/mcp-hub" target="_blank" rel="noreferrer" className="text-primary hover:underline">repo</a></li>
          <li>Add your server entry to <code className="rounded bg-muted px-1">scripts/seed.ts</code></li>
          <li>Run <code className="rounded bg-muted px-1">bun run scripts/export-registry.ts</code></li>
          <li>Open a PR</li>
        </ol>

        <h2 className="mt-8 text-2xl font-bold">Server entry format</h2>
        <CodeBlock code={`{
  slug: 'your-server-name',           // kebab-case, unique
  name: 'Your Server Name',           // display name
  description: 'One-line description',
  longDescription: 'A longer paragraph...',
  author: '@your-github-handle',
  repoUrl: 'https://github.com/you/your-server',
  homepage: 'https://your-server.com',  // optional
  category: 'devtools',               // see categories
  tags: ['tag1', 'tag2', 'tag3'],
  installCmd: 'npx -y your-package-name',
  configJson: JSON.stringify({
    mcpServers: {
      'your-server-name': {
        command: 'npx',
        args: ['-y', 'your-package-name'],
        env: { API_KEY: 'YOUR_KEY' }
      }
    }
  }, null, 2),
  stars: 0,
  featured: false,
  verified: true
}`} language="typescript" label="scripts/seed.ts" />

        <h2 className="mt-8 text-2xl font-bold">Categories</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Slug</th>
                <th className="py-3 text-left font-semibold">Use for</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">database</td><td className="py-3">SQL, NoSQL, data stores</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">search</td><td className="py-3">Web search, retrieval</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">filesystem</td><td className="py-3">Local file access</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">api</td><td className="py-3">External API integrations</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">productivity</td><td className="py-3">Notion, Slack, work tools</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">devtools</td><td className="py-3">Git, GitHub, Docker</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">cloud</td><td className="py-3">AWS, GCP, Azure</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">communication</td><td className="py-3">Email, chat, messaging</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">data</td><td className="py-3">Analytics, metrics</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">ai</td><td className="py-3">AI models, ML workflows</td></tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title="Verification">
          Verified servers get a badge and may be featured on the homepage. To get verified, make sure your server has good docs, tests, and an active maintainer.
        </Callout>
      </>
    ),
  },

  'add-client': {
    body: (
      <>
        <p className="text-base text-foreground/90">
          Want to add support for a new AI client (e.g. Zed, Continue, Aider)? Here&apos;s how.
        </p>

        <h2 className="mt-8 text-2xl font-bold">Step 1: Add to clients.ts</h2>
        <p className="text-base text-foreground/90">Edit <code className="rounded bg-muted px-1">cli/src/lib/clients.ts</code>:</p>
        <CodeBlock code={`export const SUPPORTED_CLIENTS = [
  'Claude Desktop',
  'Cursor',
  'Cline',
  'Windsurf',
  'Zed',  // ← add here
] as const

export function getClientPaths(): Record<ClientName, string | null> {
  const home = homedir()
  const os = platform()

  const macPaths: Record<ClientName, string> = {
    // ... existing
    'Zed': join(home, '.zed', 'mcp.json'),  // ← add here
  }
  // ... repeat for Windows and Linux
}`} language="typescript" label="cli/src/lib/clients.ts" />

        <h2 className="mt-8 text-2xl font-bold">Step 2: Update website tabs</h2>
        <p className="text-base text-foreground/90">Edit <code className="rounded bg-muted px-1">src/components/server-config-tabs.tsx</code> and add the new client to the <code className="rounded bg-muted px-1">CLIENTS</code> array.</p>

        <h2 className="mt-8 text-2xl font-bold">Step 3: Test</h2>
        <CodeBlock code={`cd cli
bun run build
node dist/index.js clients  # should detect the new client`} label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">Step 4: Open a PR</h2>
        <p className="text-base text-foreground/90">
          Open a PR with your changes. Include the client name, config path on each OS, and any special handling notes.
        </p>

        <Callout type="info" title="Requirements">
          The client must support MCP (Model Context Protocol). Check the <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="text-primary hover:underline">official MCP docs</a> for the spec.
        </Callout>
      </>
    ),
  },

  development: {
    body: (
      <>
        <p className="text-base text-foreground/90">
          Run MCP Hub locally for development. The project has two parts: the website (Next.js) and the CLI (Node.js).
        </p>

        <h2 className="mt-8 text-2xl font-bold">Prerequisites</h2>
        <ul className="ml-6 list-disc space-y-1 text-base text-foreground/90">
          <li>Node.js 18+</li>
          <li><a href="https://bun.sh" target="_blank" rel="noreferrer" className="text-primary hover:underline">Bun</a> (for the website)</li>
          <li>Git</li>
        </ul>

        <h2 className="mt-8 text-2xl font-bold">Setup</h2>
        <CodeBlock code={`# Clone the repo
git clone https://github.com/e2sy/mcp-hub.git
cd mcp-hub

# Install website dependencies
bun install

# Set up the database
bun run db:push
bun run scripts/seed.ts

# Export the registry (used by website + CLI)
bun run scripts/export-registry.ts

# Start the website
bun run dev`} label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">Work on the CLI</h2>
        <p className="text-base text-foreground/90">In a separate terminal:</p>
        <CodeBlock code={`cd cli
bun install
bun run build
node dist/index.js list  # test it`} label="Terminal" />

        <h2 className="mt-8 text-2xl font-bold">Project structure</h2>
        <CodeBlock code={`mcp-hub/
├── cli/                    # The mcp-hub CLI (separate npm package)
│   ├── src/
│   │   ├── index.ts        # CLI entry point
│   │   ├── lib/            # clients, registry, config-writer, etc.
│   │   └── registry.json   # Bundled server data
│   └── package.json
├── src/                    # The Next.js website
│   ├── app/
│   │   ├── docs/           # This documentation
│   │   ├── servers/        # Directory + server pages
│   │   └── api/            # API routes
│   └── components/
├── scripts/                # seed.ts, export-registry.ts, sync-stars.ts
├── prisma/schema.prisma
└── public/servers.json     # Single source of truth`} label="Structure" />

        <h2 className="mt-8 text-2xl font-bold">Useful scripts</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 text-left font-semibold">Command</th>
                <th className="py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">bun run lint</td><td className="py-3">Lint the website</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">bun run db:push</td><td className="py-3">Push schema to SQLite</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">bun run scripts/seed.ts</td><td className="py-3">Seed the database</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">bun run scripts/export-registry.ts</td><td className="py-3">Export DB → servers.json</td></tr>
              <tr className="border-b border-border/50"><td className="py-3 font-mono">cd cli &amp;&amp; bun run build</td><td className="py-3">Build the CLI</td></tr>
            </tbody>
          </table>
        </div>

        <Callout type="tip" title="Questions?">
          <a href="https://github.com/e2sy/mcp-hub/discussions" target="_blank" rel="noreferrer" className="text-primary hover:underline">Open a discussion</a> — we&apos;re happy to help.
        </Callout>
      </>
    ),
  },
}
