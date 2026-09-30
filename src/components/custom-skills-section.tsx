'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Github, Plus, RefreshCw, Terminal, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/animations'

const STEPS = [
  {
    icon: Github,
    title: 'Find a skill on GitHub',
    description: 'Any markdown file or repo with skill instructions works. Security, coding, marketing — anything.',
  },
  {
    icon: Plus,
    title: 'Add it with one command',
    description: '`mcp-hub skill add https://github.com/user/skill-repo` — MCP Hub fetches, parses, and saves it.',
  },
  {
    icon: Terminal,
    title: 'Install to your AI client',
    description: '`mcp-hub skill install <slug>` — the skill is appended to your AI\'s rules file.',
  },
  {
    icon: RefreshCw,
    title: 'Update anytime',
    description: '`mcp-hub skill update <slug>` — re-fetches from GitHub to get the latest version.',
  },
]

const EXAMPLES = [
  {
    name: 'Hack Skills',
    url: 'https://github.com/yaklang/hack-skills',
    description: 'Hacker arsenal for AI agents',
    category: 'Security',
  },
  {
    name: 'Claude Skills',
    url: 'https://claudskills.com',
    description: 'Community-curated Claude skills',
    category: 'Various',
  },
  {
    name: 'Your own repo',
    url: 'https://github.com/you/my-skill',
    description: 'Any markdown file in any repo',
    category: 'Custom',
  },
]

export function CustomSkillsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal variant="fadeUp">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Github className="h-3 w-3" />
            Bring your own skills
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Add skills from any GitHub repo
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Found a skill pack on GitHub? Add it to MCP Hub with one command. Any markdown file
            in any public repo works — security skills, coding patterns, marketing playbooks,
            your own custom skills. The possibilities are endless.
          </p>
        </div>
      </Reveal>

      {/* Steps */}
      <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
        {STEPS.map((step, i) => (
          <StaggerItem key={step.title} variant="fadeUp">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </Card>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Terminal demo */}
      <Reveal variant="fadeUp" delay={0.2}>
        <div className="mt-12 overflow-hidden rounded-xl border border-border bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-border/50 bg-zinc-900/50 px-4 py-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
            </div>
            <span className="ml-2 font-mono text-xs text-zinc-400">~ mcp-hub</span>
          </div>
          <div className="p-6 font-mono text-sm text-zinc-100">
            <div className="text-zinc-500"># Add a skill from GitHub</div>
            <div className="mt-1">
              <span className="text-zinc-500">$ </span>
              <span className="text-emerald-400">mcp-hub</span> skill add https://github.com/yaklang/hack-skills
            </div>
            <div className="mt-3 text-zinc-400">
              <span className="text-emerald-400">✓</span> Skill added!
            </div>
            <div className="mt-1 text-zinc-500">
              Name: HACK.SKILLS — Hacker Arsenal for Agents
              <br />
              Category: security · 41,085 chars
            </div>
            <div className="mt-3 text-zinc-500"># Install it to your AI client</div>
            <div className="mt-1">
              <span className="text-zinc-500">$ </span>
              <span className="text-emerald-400">mcp-hub</span> skill install hack-skills
            </div>
            <div className="mt-3 text-zinc-400">
              <span className="text-emerald-400">✓</span> Cursor: Skill installed
              <br />
              <span className="text-emerald-400">✓</span> Done! Restart your AI client.
            </div>
          </div>
        </div>
      </Reveal>

      {/* Examples */}
      <Reveal variant="fadeUp" delay={0.3}>
        <div className="mt-12">
          <h3 className="text-center text-lg font-semibold">Works with any public GitHub repo</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div
                key={ex.name}
                className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ex.name}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                    {ex.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ex.description}</p>
                <code className="mt-2 block truncate text-xs text-muted-foreground">{ex.url}</code>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Commands reference */}
      <Reveal variant="fadeUp" delay={0.4}>
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold">Custom skill commands</h3>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { cmd: 'mcp-hub skill add <url>', desc: 'Add a skill from GitHub' },
              { cmd: 'mcp-hub skill list-custom', desc: 'List your custom skills' },
              { cmd: 'mcp-hub skill update <slug>', desc: 'Re-fetch from GitHub' },
              { cmd: 'mcp-hub skill install <slug>', desc: 'Install to AI clients' },
              { cmd: 'mcp-hub skill remove-custom <slug>', desc: 'Remove a custom skill' },
              { cmd: 'mcp-hub skill search <query>', desc: 'Search all skills' },
            ].map((item) => (
              <div key={item.cmd} className="flex items-center gap-3 rounded-md border border-border p-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />
                <code className="text-xs font-mono text-foreground">{item.cmd}</code>
                <span className="ml-auto text-xs text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal variant="fadeUp" delay={0.5}>
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            29 built-in skills + unlimited custom skills from GitHub = infinite possibilities
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button asChild size="lg" className="gap-2">
              <Link href="/cli">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com/e2sy/mcp-hub" target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Star on GitHub
              </a>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
