import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DirectoryBrowser } from '@/components/directory-browser'
import type { McpServerData, CategoryData } from '@/lib/types'

export const metadata: Metadata = {
  title: 'MCP Server Directory — Browse 30+ verified servers | MCP Hub',
  description: 'Browse the complete directory of Model Context Protocol servers. Filter by category, search by name, and install any server in one command for Claude Desktop, Cursor, Cline, and Windsurf.',
  alternates: { canonical: '/servers' },
}

export const dynamic = 'force-dynamic'

export default async function ServersPage() {
  const [servers, categories] = await Promise.all([
    db.mcpServer.findMany({
      orderBy: [{ featured: 'desc' }, { stars: 'desc' }],
      take: 100,
    }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const parsedServers: McpServerData[] = servers.map((s) => ({
    ...s,
    tags: JSON.parse(s.tags),
  }))
  const cats = categories as CategoryData[]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Page header */}
        <section className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              MCP Server Directory
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              Browse {servers.length} verified Model Context Protocol servers across {categories.length} categories.
              Each server includes a one-command install and config snippets for every major AI client.
            </p>
          </div>
        </section>

        <DirectoryBrowser initialServers={parsedServers} categories={cats} />
      </main>
      <Footer />
    </div>
  )
}
