import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CliSection } from '@/components/cli-section'
import { GITHUB_REPO } from '@/lib/constants'
import { Terminal, Copy, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'MCP Hub CLI — Install any MCP server from your terminal',
  description: 'The homebrew for MCP servers. One Node.js CLI that auto-configures Claude Desktop, Cursor, Cline, and Windsurf. Install, search, update, and remove MCP servers in one command.',
  alternates: { canonical: '/cli' },
}

const COMMANDS = [
  {
    cmd: 'npx mcp-hub install <name>',
    desc: 'Install a server into all detected AI clients. Auto-detects Claude Desktop, Cursor, Cline, and Windsurf.',
    example: 'npx mcp-hub install github',
  },
  {
    cmd: 'npx mcp-hub list',
    desc: 'List all available MCP servers in the registry. Use --category or --featured to filter.',
    example: 'npx mcp-hub list --category database',
  },
  {
    cmd: 'npx mcp-hub search <query>',
    desc: 'Search servers by name, description, tag, or author. Returns a ranked table.',
    example: 'npx mcp-hub search "postgres"',
  },
  {
    cmd: 'npx mcp-hub info <name>',
    desc: 'Show detailed info about a server: description, config JSON, install command, and repo link.',
    example: 'npx mcp-hub info stripe',
  },
  {
    cmd: 'npx mcp-hub remove <name>',
    desc: 'Remove a server from all (or one specific) AI client config. Creates a .backup file first.',
    example: 'npx mcp-hub remove slack',
  },
  {
    cmd: 'npx mcp-hub doctor',
    desc: 'Diagnose config issues — validate JSON, check for placeholder env vars, find broken servers. 🆕',
    example: 'npx mcp-hub doctor',
  },
  {
    cmd: 'npx mcp-hub backup [--label <name>]',
    desc: 'Back up all your AI client config files to ~/.mcp-hub/backups/. Use --list to browse, --delete to remove. 🆕',
    example: 'npx mcp-hub backup --label "pre-cleanup"',
  },
  {
    cmd: 'npx mcp-hub restore <name>',
    desc: 'Restore configs from a named backup. Auto-creates a pre-restore backup first. 🆕',
    example: 'npx mcp-hub restore 2026-10-01T09-30-00-pre-cleanup',
  },
  {
    cmd: 'npx mcp-hub bundle export <file>',
    desc: 'Export your installed servers as a portable JSON bundle. Share with teammates. 🆕',
    example: 'npx mcp-hub bundle export my-setup.json',
  },
  {
    cmd: 'npx mcp-hub bundle install <file>',
    desc: 'Install all servers from a bundle file. Sets up a new machine in one command. 🆕',
    example: 'npx mcp-hub bundle install my-setup.json',
  },
  {
    cmd: 'npx mcp-hub init <name>',
    desc: 'Scaffold a new MCP server with TypeScript, tests, and config. Ships in seconds. 🆕',
    example: 'npx mcp-hub init my-awesome-server',
  },
  {
    cmd: 'npx mcp-hub config edit [client]',
    desc: 'Open a client config file in $EDITOR. Use "path" to just print the path. 🆕',
    example: 'npx mcp-hub config edit cursor',
  },
  {
    cmd: 'npx mcp-hub clients',
    desc: 'Show which AI clients are detected on your machine and where their config files live.',
    example: 'npx mcp-hub clients',
  },
  {
    cmd: 'npx mcp-hub installed',
    desc: 'List all MCP servers currently installed across all your detected AI clients.',
    example: 'npx mcp-hub installed',
  },
  {
    cmd: 'npx mcp-hub categories',
    desc: 'List all server categories with descriptions and server counts.',
    example: 'npx mcp-hub categories',
  },
  {
    cmd: 'npx mcp-hub update',
    desc: 'Fetch the latest server registry from GitHub to see what\'s new.',
    example: 'npx mcp-hub update',
  },
  {
    cmd: 'npx mcp-hub add <github-url>',
    desc: 'Get instructions for adding a custom MCP server from any GitHub repo.',
    example: 'npx mcp-hub add https://github.com/me/my-mcp',
  },
]

const FEATURES = [
  {
    title: 'Zero config',
    description: 'No setup wizard, no API keys, no account. Run one command and the CLI does the rest.',
  },
  {
    title: 'Auto-detects clients',
    description: 'Finds Claude Desktop, Cursor, Cline, and Windsurf config files on macOS, Windows, and Linux automatically.',
  },
  {
    title: 'Safe writes',
    description: 'Creates a .backup of your config before every write. Never destroys existing servers.',
  },
  {
    title: 'Works offline',
    description: 'The full server registry is bundled with the CLI. No internet required to install or search.',
  },
  {
    title: 'No telemetry',
    description: 'Zero analytics, zero tracking, zero phone-home. Your data never leaves your machine.',
  },
  {
    title: 'MIT licensed',
    description: 'Fully open source. Read every line, fork it, ship your own version. No strings attached.',
  },
]

export default function CliPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          
          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Terminal className="h-3 w-3 text-primary" />
              The CLI
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-foreground">mcp-hub</span> — the homebrew for MCP servers
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              A single Node.js CLI that installs any MCP server into Claude Desktop, Cursor, Cline,
              and Windsurf. No more copy-pasting JSON snippets into hidden config files.
            </p>
            <div className="mt-8 space-y-3">
              <CodeBlock code="npx mcp-hub install github" label="Try it now — no install required" />
              <p className="text-xs text-muted-foreground">
                Or install globally: <code className="rounded bg-muted px-1.5 py-0.5 font-mono">npm install -g mcp-hub</code>
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">Why mcp-hub?</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Commands reference */}
        <section className="border-y border-border bg-card/30">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight">Command reference</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every command the CLI supports. All commands work with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npx</code> — no global install required.
            </p>

            <div className="mt-8 space-y-6">
              {COMMANDS.map((c) => (
                <div key={c.cmd} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <code className="font-mono text-sm font-semibold text-primary">{c.cmd}</code>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                  <div className="mt-3">
                    <span className="text-xs font-medium text-muted-foreground">Example:</span>
                    <pre className="mt-1 overflow-x-auto rounded-md border border-border bg-zinc-950 p-3 font-mono text-xs text-zinc-100">
                      <code>$ {c.example}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Detection table */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">Supported AI clients</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The CLI auto-detects these clients on macOS, Windows, and Linux.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-left font-semibold">Client</th>
                  <th className="py-3 text-left font-semibold">macOS</th>
                  <th className="py-3 text-left font-semibold">Windows</th>
                  <th className="py-3 text-left font-semibold">Linux</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Claude Desktop', mac: '✓', win: '✓', lin: '✓' },
                  { name: 'Cursor', mac: '✓', win: '✓', lin: '✓' },
                  { name: 'Cline', mac: '✓', win: '✓', lin: '✓' },
                  { name: 'Windsurf', mac: '✓', win: '✓', lin: '✓' },
                ].map((c) => (
                  <tr key={c.name} className="border-b border-border/50">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3 text-primary">{c.mac}</td>
                    <td className="py-3 text-primary">{c.win}</td>
                    <td className="py-3 text-primary">{c.lin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold">Ready to install?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run one command. Get any MCP server configured in seconds.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <CodeBlock code="npx mcp-hub install github" />
            </div>
            <div className="mt-4">
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Star the repo on GitHub →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-zinc-950">
      {label && (
        <div className="border-b border-border/50 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400">
          {label}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 p-4">
        <code className="flex-1 font-mono text-sm text-zinc-100">
          <span className="select-none text-zinc-500">$ </span>
          {code}
        </code>
      </div>
    </div>
  )
}
