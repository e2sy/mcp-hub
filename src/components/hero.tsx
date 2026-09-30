'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InstallCommand } from '@/components/install-command'
import { AnimatedCounter } from '@/components/animated-counter'
import { staggerContainer } from '@/components/animations'
import type { StatsData } from '@/lib/types'

interface HeroProps {
  stats: StatsData
}

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-24">
        <motion.div
          variants={staggerContainer(0.1, 0.05)}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariant}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              The homebrew for MCP servers
              <span className="ml-1 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                v1.3
              </span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariant}
            className="mt-8 text-center text-4xl font-bold tracking-tight sm:text-6xl"
          >
            Install any MCP server
            <br />
            <span className="text-muted-foreground">in one command.</span>
          </motion.h1>

          <motion.p
            variants={itemVariant}
            className="mx-auto mt-6 max-w-xl text-center text-base text-muted-foreground sm:text-lg"
          >
            The open directory and auto-installer for Model Context Protocol servers.
            Browse {stats.totalServers}+ verified servers, install them for Claude Desktop, Cursor,
            Cline, and Windsurf — without ever touching a JSON file.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={itemVariant}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="gap-2">
              <Link href="/servers">
                Browse the directory
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cli">View the CLI</Link>
            </Button>
          </motion.div>

          {/* Install command */}
          <motion.div variants={itemVariant} className="mx-auto mt-8 max-w-md">
            <InstallCommand
              command="npx mcp-hub install github"
              label="Try it now — no install required"
            />
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4"
          variants={staggerContainer(0.08, 0.3)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            { label: 'MCP servers', value: stats.totalServers, format: (n: number) => Math.round(n).toString() },
            { label: 'Categories', value: stats.totalCategories, format: (n: number) => Math.round(n).toString() },
            { label: 'Featured', value: stats.featuredServers, format: (n: number) => Math.round(n).toString() },
            {
              label: 'Total stars',
              value: stats.totalStars,
              format: (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : Math.round(n).toString()),
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariant}
              className="bg-background p-4 text-center"
            >
              <div className="text-2xl font-bold tabular-nums sm:text-3xl">
                <AnimatedCounter value={stat.value} format={stat.format} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
