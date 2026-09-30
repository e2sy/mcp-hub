'use client'

import { motion } from 'framer-motion'
import { GitBranch, GitPullRequest, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/animations'
import { GITHUB_REPO } from '@/lib/constants'

const STEPS = [
  {
    icon: GitBranch,
    title: 'Fork the repo',
    description: 'Click fork on GitHub. The repo includes a template you can copy for your server entry.',
  },
  {
    icon: GitPullRequest,
    title: 'Add your server',
    description: 'Edit servers.json with your server metadata, install command, and config snippet. Commit and open a PR.',
  },
  {
    icon: Star,
    title: 'Get verified',
    description: 'We review within 48 hours. Verified servers get a badge and a featured slot if popular.',
  },
  {
    icon: Users,
    title: 'Get stars & users',
    description: 'Your server appears in the directory, the CLI search results, and our weekly featured list.',
  },
]

export function AddServerSection() {
  return (
    <section id="add" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal variant="scaleIn">
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              For MCP server authors
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              List your MCP server.{' '}
              <span className="text-foreground">Get users overnight.</span>
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              The MCP ecosystem is exploding. Listing your server on MCP Hub puts it in front of
              thousands of developers searching for the exact integration you built — every week.
            </p>
          </div>

          <StaggerGroup className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title} variant="fadeUp">
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">Step {i + 1}</div>
                  <h3 className="mt-1 font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal variant="fadeUp" delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button asChild size="lg" className="gap-2">
                  <a href={GITHUB_REPO + '/blob/main/CONTRIBUTING.md'} target="_blank" rel="noreferrer">
                    <GitPullRequest className="h-4 w-4" />
                    Submit your server
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button asChild variant="outline" size="lg">
                  <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
                    Read the contributing guide
                  </a>
                </Button>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </Reveal>
    </section>
  )
}
