'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CLIENTS = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    path: '~/Library/Application Support/Claude/claude_desktop_config.json',
    instructions: 'Open Claude Desktop → Settings → Developer → Edit Config. Paste the JSON below into the file and restart Claude Desktop.',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    path: '~/.cursor/mcp.json',
    instructions: 'In Cursor: Settings → MCP → Add new MCP Server. Or create/edit ~/.cursor/mcp.json with the JSON below and reload the window.',
  },
  {
    id: 'cline',
    name: 'Cline',
    path: '~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
    instructions: 'Open Cline → MCP Servers → Edit Global Settings. Paste the JSON below, save, and restart the extension.',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    path: '~/.codeium/windsurf/mcp_config.json',
    instructions: 'Open Windsurf Settings → MCP Servers → Add Server. Or edit ~/.codeium/windsurf/mcp_config.json directly and reload.',
  },
]

export function ServerConfigTabs({ configJson }: { configJson: string }) {
  return (
    <Tabs defaultValue="claude">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        {CLIENTS.map((c) => (
          <TabsTrigger key={c.id} value={c.id} className="text-xs">
            {c.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {CLIENTS.map((c) => (
        <TabsContent key={c.id} value={c.id} className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {c.instructions}
          </p>
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Config path:</span>{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/80">{c.path}</code>
          </div>
          <pre className="overflow-x-auto rounded-lg border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-100">
            <code>{configJson}</code>
          </pre>
        </TabsContent>
      ))}
    </Tabs>
  )
}
