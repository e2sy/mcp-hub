'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InstallCommand } from '@/components/install-command'
import { Check } from 'lucide-react'

const FEATURES = [
  'List, search, and install any MCP server in one command',
  'Auto-configures Claude Desktop, Cursor, Cline, and Windsurf',
  'Detects your installed clients automatically',
  'Diagnose broken configs with `mcp-hub doctor`',
  'Back up and restore configs with `mcp-hub backup` / `restore`',
  'Share your setup with `mcp-hub bundle export`',
  'Scaffold new servers with `mcp-hub init`',
  'No account, no telemetry, fully open source',
]

const COMMANDS: { tab: string; cmd: string; label: string }[] = [
  {
    tab: 'install',
    cmd: 'npx mcp-hub install github',
    label: 'Install a server (auto-configures your AI client)',
  },
  {
    tab: 'doctor',
    cmd: 'npx mcp-hub doctor',
    label: 'Diagnose config issues — find broken servers and missing env vars',
  },
  {
    tab: 'backup',
    cmd: 'npx mcp-hub backup --label "my-setup"',
    label: 'Back up all your AI client config files',
  },
  {
    tab: 'bundle',
    cmd: 'npx mcp-hub bundle export my-setup.json',
    label: 'Export your installed servers as a portable bundle',
  },
  {
    tab: 'init',
    cmd: 'npx mcp-hub init my-awesome-server',
    label: 'Scaffold a new MCP server with TypeScript + tests',
  },
  {
    tab: 'search',
    cmd: 'npx mcp-hub search "postgres"',
    label: 'Search by name, tag, or category',
  },
  {
    tab: 'remove',
    cmd: 'npx mcp-hub remove slack',
    label: 'Remove a server and clean up its config',
  },
]

export function CliSection() {
  return (
    <section id="cli" className="border-y border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              The CLI
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              One tool to install{' '}
              <span className="text-foreground">every MCP server</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Think of it as <span className="font-mono text-foreground">brew</span> for MCP servers.
              One Node-powered binary that knows where Claude Desktop, Cursor, Cline, and Windsurf
              keep their config — and writes to the right file automatically.
            </p>

            <ul className="mt-6 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <InstallCommand
                command="npm install -g mcp-hub"
                label="Install the CLI globally (optional — npx also works)"
              />
            </div>
          </div>

          {/* Right: commands */}
          <div className="rounded-2xl border border-border bg-background/60 p-6 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <span className="ml-2 font-mono text-xs text-muted-foreground">~ mcp-hub</span>
            </div>

            <Tabs defaultValue="install">
              <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
                {COMMANDS.map((c) => (
                  <TabsTrigger
                    key={c.tab}
                    value={c.tab}
                    className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {c.tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {COMMANDS.map((c) => (
                <TabsContent key={c.tab} value={c.tab} className="mt-4 space-y-3">
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <InstallCommand command={c.cmd} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  )
}
