'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Rocket, Terminal, Book, Code, Users, ChevronRight, type LucideIcon } from 'lucide-react'
import { DOC_CATEGORIES, getPagesByCategory } from '@/lib/docs-config'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  Rocket,
  Terminal,
  Book,
  Code,
  Users,
}

export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-6">
      {DOC_CATEGORIES.map((category) => {
        const pages = getPagesByCategory(category.id)
        const Icon = ICONS[category.icon] || Terminal
        return (
          <div key={category.id}>
            <div className="flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {category.title}
            </div>
            <ul className="mt-2 space-y-0.5">
              {pages.map((page) => {
                const href = `/docs/${page.slug}`
                const active = pathname === href
                return (
                  <li key={page.slug}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-start gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          'mt-0.5 h-3 w-3 shrink-0 transition-transform',
                          active ? 'rotate-90 text-primary' : 'text-muted-foreground/50'
                        )}
                      />
                      <span className="flex-1">{page.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
