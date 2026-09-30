'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ServerCard } from '@/components/server-card'
import { ServerDialog } from '@/components/server-dialog'
import { Reveal } from '@/components/animations'
import type { McpServerData, CategoryData } from '@/lib/types'
import { categoryColors } from '@/lib/constants'

interface DirectoryBrowserProps {
  initialServers: McpServerData[]
  categories: CategoryData[]
}

export function DirectoryBrowser({ initialServers, categories }: DirectoryBrowserProps) {
  const [query, setQuery] = React.useState('')
  const [category, setCategory] = React.useState('all')
  const [sortBy, setSortBy] = React.useState<'stars' | 'name' | 'newest'>('stars')
  const [selected, setSelected] = React.useState<McpServerData | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [servers, setServers] = React.useState(initialServers)

  // Debounced search
  React.useEffect(() => {
    const q = query.trim()
    setLoading(true)
    const t = setTimeout(async () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (category && category !== 'all') params.set('category', category)
      params.set('limit', '100')
      try {
        const res = await fetch(`/api/servers?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setServers(data.servers)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [query, category])

  const sorted = React.useMemo(() => {
    const copy = [...servers]
    if (sortBy === 'stars') copy.sort((a, b) => b.stars - a.stars)
    else if (sortBy === 'name') copy.sort((a, b) => a.name.localeCompare(b.name))
    else copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return copy
  }, [servers, sortBy])

  const onView = (s: McpServerData) => {
    setSelected(s)
    setDialogOpen(true)
  }

  return (
    <section id="servers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Browse the directory
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {servers.length} verified MCP servers across {categories.length} categories. One command to install any of them.
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search servers, tags, authors…"
            className="h-10 pl-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 sm:w-[200px]">
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name} ({c.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="h-10 sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stars">Most stars</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            category === 'all'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map((c) => {
          const colors = categoryColors(c.slug)
          const active = category === c.slug
          return (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : `border-border ${colors.text} hover:bg-muted`
              }`}
            >
              {c.name}
              <span className="ml-1 opacity-60">{c.count}</span>
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium">No servers found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different search or category.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              setQuery('')
              setCategory('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <motion.div
          layout
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {sorted.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ServerCard server={s} onView={onView} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <ServerDialog server={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </section>
  )
}
