import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Search, Terminal, Book, Code, Users } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DocsSearch } from '@/components/docs/search'
import { DOC_CATEGORIES, getPagesByCategory } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Docs — MCP Hub',
  description: 'Complete documentation for MCP Hub — getting started, CLI reference, guides, API, and contributing.',
  alternates: { canonical: '/docs' },
}

const ICONS: Record<string, any> = {
  Rocket: Search,
  Terminal: Terminal,
  Book: Book,
  Code: Code,
  Users: Users,
}

export default function DocsIndexPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              MCP Hub <span className="text-foreground">Docs</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Everything you need to install, configure, and contribute to MCP Hub — the homebrew for MCP servers.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-xl">
            <DocsSearch />
          </div>

          {/* Category cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DOC_CATEGORIES.map((category) => {
              const Icon = ICONS[category.icon] || Terminal
              const pages = getPagesByCategory(category.id)
              return (
                <div
                  key={category.id}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">{category.title}</h2>
                  <ul className="mt-3 space-y-1.5">
                    {pages.slice(0, 5).map((page) => (
                      <li key={page.slug}>
                        <Link
                          href={`/docs/${page.slug}`}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          <ArrowRight className="h-3 w-3 opacity-0 transition-opacity" />
                          {page.title}
                        </Link>
                      </li>
                    ))}
                    {pages.length > 5 && (
                      <li className="text-xs text-muted-foreground">
                        +{pages.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
