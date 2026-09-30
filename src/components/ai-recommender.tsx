'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, ArrowRight, Star, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/animations'
import Link from 'next/link'
import { categoryColors, formatStars } from '@/lib/constants'

interface Recommendation {
  slug: string
  name: string
  description: string
  category: string
  tags: string[]
  stars: number
  reason: string
}

const EXAMPLES = [
  'I want to build a SaaS landing page',
  'Help me analyze my Postgres database',
  'I need to manage GitHub issues from my AI',
  'I want to scrape websites for data',
  'Help me search the web from Claude',
]

export function AiRecommender() {
  const [query, setQuery] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<Recommendation[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [hasSearched, setHasSearched] = React.useState(false)

  const recommend = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setHasSearched(true)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      if (!res.ok) throw new Error('Failed to get recommendations')
      const data = await res.json()
      setResults(data.recommendations || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal variant="fadeUp">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI-powered
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Tell me what you want to build.
            <br />
            <span className="text-foreground">I&apos;ll pick the right MCP servers.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Describe your project or workflow in plain English. Our AI analyzes the directory and
            recommends the best MCP servers for your use case.
          </p>
        </div>
      </Reveal>

      {/* Search bar */}
      <Reveal variant="fadeUp" delay={0.1}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Wand2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && recommend(query)}
              placeholder="e.g. I want to build a SaaS that accepts payments and sends emails"
              className="h-12 pl-10 text-base"
            />
          </div>
          <Button
            size="lg"
            onClick={() => recommend(query)}
            disabled={loading || !query.trim()}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Thinking...' : 'Recommend'}
          </Button>
        </div>
      </Reveal>

      {/* Examples */}
      {!hasSearched && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex)
                recommend(ex)
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-3"
          >
            <p className="text-sm text-muted-foreground">
              {results.length} recommended server{results.length !== 1 ? 's' : ''} for your use case:
            </p>
            {results.map((r, idx) => {
              const colors = categoryColors(r.category)
              return (
                <motion.div
                  key={r.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <Card className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text} font-bold uppercase`}
                        >
                          {r.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/servers/${r.slug}`} className="font-semibold hover:text-primary">
                            {r.name}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Badge variant="secondary" className={`text-[10px] ${colors.bg} ${colors.text}`}>
                              {r.category}
                            </Badge>
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {formatStars(r.stars)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1">
                        <Link href={`/servers/${r.slug}`}>
                          View
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3 text-sm">
                      <span className="font-medium text-primary">Why: </span>
                      <span className="text-foreground/90">{r.reason}</span>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results */}
      {hasSearched && !loading && results.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          No recommendations. Try rephrasing your query.
        </motion.div>
      )}
    </section>
  )
}
