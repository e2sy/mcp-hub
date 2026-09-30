'use client'

import * as React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Github, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GITHUB_REPO } from '@/lib/constants'

const FAQS = [
  {
    q: 'What is MCP (Model Context Protocol)?',
    a: 'MCP is an open standard introduced by Anthropic that lets AI assistants like Claude, Cursor, and Cline talk to external tools, databases, and APIs in a uniform way. Think of it like USB-C for AI — one protocol, many integrations.',
  },
  {
    q: 'Is MCP Hub free?',
    a: 'Yes — 100% free and open source under the MIT license. The CLI runs locally, the directory is community-maintained, and there are no accounts, no paid tiers, and no telemetry.',
  },
  {
    q: 'Which AI clients are supported?',
    a: 'The auto-installer currently supports Claude Desktop, Cursor, Cline, and Windsurf. We add new clients as they ship MCP support — open an issue on GitHub to request one.',
  },
  {
    q: 'How do I add my own MCP server to the directory?',
    a: 'Submit a PR to the GitHub repo adding your server to servers.json. We review submissions within 48 hours. Verified servers get a badge and are eligible to be featured.',
  },
  {
    q: 'Does it work on Windows / macOS / Linux?',
    a: 'Yes — the CLI is a Node.js package and runs on any OS with Node 18+. Auto-detection of client config paths works on all three platforms.',
  },
  {
    q: 'Can I use MCP Hub without installing anything?',
    a: 'Yes — every server page on this site shows the manual JSON config you can paste into your AI client. The CLI is just for convenience.',
  },
  {
    q: 'How is this different from the official MCP servers list?',
    a: 'The official list is a README. MCP Hub is a searchable, filterable directory with one-command install, multi-client auto-configuration, and community submissions. We also catalog third-party servers from Stripe, Supabase, Cloudflare, and others — not just the official Anthropic ones.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Everything you need to know about MCP Hub and the Model Context Protocol.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-6 text-center sm:flex-row sm:gap-6 sm:text-left">
          <div>
            <p className="text-sm font-semibold">Still have questions?</p>
            <p className="text-xs text-muted-foreground">
              Open a discussion or issue on GitHub — we reply fast.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={GITHUB_REPO + '/discussions'} target="_blank" rel="noreferrer">
                <FileText className="h-3.5 w-3.5" />
                Discussions
              </a>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" />
                Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
