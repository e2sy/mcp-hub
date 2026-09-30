'use client'

import { motion } from 'framer-motion'
import { Search, Download, Zap } from 'lucide-react'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/animations'

const STEPS = [
  {
    icon: Search,
    title: 'Find a server',
    description: 'Browse the directory or run `mcp-hub search "github"`. Every server is verified and tagged with the integrations it supports.',
  },
  {
    icon: Download,
    title: 'Install with one command',
    description: '`npx mcp-hub install github` pulls the package, writes the config to your AI client, and validates the JSON. No manual file editing.',
  },
  {
    icon: Zap,
    title: 'Use it in your AI',
    description: 'Restart Claude Desktop or Cursor — the new tools are available instantly. Ask in natural language and your AI does the rest.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal variant="fadeUp">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            How it works
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            From zero to MCP-powered in <span className="text-foreground">60 seconds</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            No more copy-pasting JSON snippets into hidden config files. MCP Hub handles discovery,
            installation, and configuration end-to-end.
          </p>
        </div>
      </Reveal>

      <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3" stagger={0.15}>
        {STEPS.map((step, i) => (
          <StaggerItem key={step.title} variant="fadeUp">
            <motion.div
              className="relative rounded-2xl border border-border bg-card p-6"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute right-5 top-5 font-mono text-5xl font-bold text-muted-foreground/10">
                0{i + 1}
              </div>
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <step.icon className="h-5 w-5" />
              </motion.div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}
