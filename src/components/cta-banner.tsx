'use client'

import { motion } from 'framer-motion'
import { Github, Star, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/animations'
import { GITHUB_REPO } from '@/lib/constants'

export function CtaBanner() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal variant="fadeUp">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Star the repo.
                <br />
                Follow the build.
              </h2>
              <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                MCP Hub is built in public by indie hackers. A star tells us you want more —
                new servers, new clients, new features. It also helps other devs discover it.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="gap-2"
                >
                  <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
                    <Star className="h-4 w-4" />
                    Star on GitHub
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="gap-2"
                >
                  <a href={GITHUB_REPO + '/watchers'} target="_blank" rel="noreferrer">
                    <Github className="h-4 w-4" />
                    Watch releases
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
