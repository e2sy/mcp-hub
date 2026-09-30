'use client'

import * as React from 'react'
import { Star, ShieldCheck, ExternalLink, Github, CheckCircle2, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InstallCommand } from '@/components/install-command'
import { formatStars, categoryColors } from '@/lib/constants'
import type { McpServerData } from '@/lib/types'

interface ServerDialogProps {
  server: McpServerData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CLIENT_INSTRUCTIONS: { id: string; name: string; instructions: string }[] = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    instructions: 'Open Claude Desktop Settings → Developer → Edit Config, then merge this into claude_desktop_config.json and restart Claude.',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    instructions: 'In Cursor: Settings → MCP → Add new MCP Server. Paste the JSON below, save, and reload the window.',
  },
  {
    id: 'cline',
    name: 'Cline',
    instructions: 'Open Cline → MCP Servers → Edit Global Settings, paste the config, save, and restart the extension.',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    instructions: 'Open Windsurf Settings → MCP Servers → Add Server, paste the JSON, and reload.',
  },
]

export function ServerDialog({ server, open, onOpenChange }: ServerDialogProps) {
  if (!server) return null
  const colors = categoryColors(server.category)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text} text-lg font-bold uppercase ring-1 ${colors.ring}`}
              >
                {server.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {server.name}
                  {server.verified && (
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  )}
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  by <span className="text-foreground/80">{server.author}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{formatStars(server.stars)}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Description */}
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {server.longDescription || server.description}
            </p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${colors.bg} ${colors.text} hover:${colors.bg}`}>
              {server.category}
            </Badge>
            {server.featured && (
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3 text-primary" />
                Featured
              </Badge>
            )}
            {server.verified && (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                Verified
              </Badge>
            )}
            {server.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={server.repoUrl} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" />
                Repository
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
            {server.homepage && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={server.homepage} target="_blank" rel="noreferrer">
                  Homepage
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
          </div>

          {/* Install */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Install</h4>

            <InstallCommand command={server.installCmd} label="One-line install" />

            <Tabs defaultValue="claude" className="mt-3">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                {CLIENT_INSTRUCTIONS.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="text-xs">
                    {c.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {CLIENT_INSTRUCTIONS.map((c) => (
                <TabsContent key={c.id} value={c.id} className="mt-3 space-y-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {c.instructions}
                  </p>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-100">
                    <code>{server.configJson}</code>
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
