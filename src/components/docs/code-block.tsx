'use client'

import * as React from 'react'
import { Check, Copy, Terminal } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language = 'bash', label, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-border bg-zinc-950">
      {label && (
        <div className="flex items-center gap-2 border-b border-border/50 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400">
          <Terminal className="h-3.5 w-3.5" />
          {label}
        </div>
      )}
      <div className="relative">
        <pre className="flex-1 overflow-x-auto p-4 text-sm">
          <code className="font-mono text-zinc-100">
            {showLineNumbers ? (
              lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-4 inline-block w-8 shrink-0 select-none text-right text-zinc-600">
                    {i + 1}
                  </span>
                  <span className="flex-1">{line || ' '}</span>
                </div>
              ))
            ) : (
              code
            )}
          </code>
        </pre>
        <button
          onClick={copy}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 opacity-0 transition-all hover:bg-zinc-800 hover:text-zinc-100 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

interface CodeTabsProps {
  tabs: { label: string; language?: string; code: string }[]
  label?: string
}

export function CodeTabs({ tabs, label }: CodeTabsProps) {
  const [active, setActive] = React.useState(0)

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-zinc-950">
      {label && (
        <div className="border-b border-border/50 bg-zinc-900/50 px-4 py-2 text-xs text-zinc-400">
          {label}
        </div>
      )}
      <div className="flex border-b border-border/50 bg-zinc-900/30">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              active === i
                ? 'border-b-2 border-primary text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock code={tabs[active].code} language={tabs[active].language} />
    </div>
  )
}
