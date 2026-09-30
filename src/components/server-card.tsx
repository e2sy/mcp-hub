'use client'

import { motion } from 'framer-motion'
import { Star, CheckCircle2, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatStars, categoryColors } from '@/lib/constants'
import type { McpServerData } from '@/lib/types'

interface ServerCardProps {
  server: McpServerData
  onView: (server: McpServerData) => void
}

export function ServerCard({ server, onView }: ServerCardProps) {
  const colors = categoryColors(server.category)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        className="group relative flex h-full flex-col gap-3 overflow-hidden p-5 ring-1 ring-transparent transition-colors hover:ring-border"
        role="button"
        tabIndex={0}
        onClick={() => onView(server)}
        onKeyDown={(e) => e.key === 'Enter' && onView(server)}
      >
        {/* Top: identity */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text} font-bold uppercase ring-1 ${colors.ring}`}
            >
              {server.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-semibold">{server.name}</h3>
                {server.verified && (
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{server.author}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
            <span className="tabular-nums font-medium">{formatStars(server.stars)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="relative line-clamp-2 text-sm text-muted-foreground">
          {server.description}
        </p>

        {/* Tags */}
        <div className="relative flex flex-wrap gap-1.5">
          <Badge variant="secondary" className={`text-[10px] uppercase tracking-wide ${colors.bg} ${colors.text} hover:${colors.bg}`}>
            {server.category}
          </Badge>
          {server.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] font-normal text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="relative mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span>{server.featured ? 'Featured' : 'Verified'}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onView(server)
            }}
          >
            Install
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
