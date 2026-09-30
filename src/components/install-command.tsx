'use client'

import * as React from 'react'
import { Check, Copy, Terminal } from 'lucide-react'
import { toast } from 'sonner'

interface InstallCommandProps {
  command: string
  label?: string
  variant?: 'inline' | 'block'
}

export function InstallCommand({ command, label, variant = 'block' }: InstallCommandProps) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={copy}
        className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted"
      >
        <span className="text-muted-foreground">$</span>
        <span className="truncate">{command}</span>
        {copied ? (
          <Check className="h-3 w-3 text-primary" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
        )}
      </button>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-zinc-950 dark:bg-zinc-950/80">
      {label && (
        <div className="flex items-center gap-2 border-b border-border/50 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400">
          <Terminal className="h-3.5 w-3.5" />
          {label}
        </div>
      )}
      <div className="flex items-center justify-between gap-3 p-4">
        <code className="flex-1 overflow-x-auto font-mono text-sm text-zinc-100">
          <span className="select-none text-zinc-500">$ </span>
          {command}
        </code>
        <button
          onClick={copy}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Copy command"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
