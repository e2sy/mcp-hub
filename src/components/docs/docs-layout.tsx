'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocsSidebar } from '@/components/docs/sidebar'
import { DocsSearch } from '@/components/docs/search'
import { getAdjacentPages } from '@/lib/docs-config'
import { GITHUB_REPO } from '@/lib/constants'

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const slug = pathname.split('/').pop() || ''
  const { prev, next } = getAdjacentPages(slug)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex gap-8 lg:gap-12">
        {/* Left sidebar — desktop */}
        <aside className="hidden lg:block lg:w-60 xl:w-64 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-12">
            <DocsSearch />
            <div className="mt-4">
              <DocsSidebar />
            </div>
          </div>
        </aside>

        {/* Mobile sidebar toggle */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            size="sm"
            className="fixed left-4 top-20 z-40 gap-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
            Menu
          </Button>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-80 overflow-y-auto bg-background p-4">
                <div className="mb-4 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DocsSearch />
                <div className="mt-4">
                  <DocsSidebar onNavigate={() => setMobileOpen(false)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1 py-8 lg:py-12">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">Docs</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}</span>
          </nav>

          {/* Content */}
          <div className="docs-content max-w-3xl">
            {children}
          </div>

          {/* Prev / Next navigation */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-border pt-6">
            {prev ? (
              <Link
                href={`/docs/${prev.slug}`}
                className="group rounded-lg border border-border p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </div>
                <div className="mt-1 font-medium group-hover:text-primary">{prev.title}</div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/docs/${next.slug}`}
                className="group rounded-lg border border-border p-4 text-right transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                  Next
                  <ChevronRight className="h-3 w-3" />
                </div>
                <div className="mt-1 font-medium group-hover:text-primary">{next.title}</div>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Edit on GitHub */}
          <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
            <a
              href={`${GITHUB_REPO}/blob/main/src/app/docs/[slug]/page.tsx`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit this page on GitHub
            </a>
            <span>Last updated: {new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </main>
      </div>
    </div>
  )
}
