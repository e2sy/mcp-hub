import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { DocsLayout } from '@/components/docs/docs-layout'
import { CodeBlock, CodeTabs } from '@/components/docs/code-block'
import { Callout } from '@/components/docs/callout'
import { DOC_PAGES, getPage } from '@/lib/docs-config'
import { docContent } from '@/lib/doc-content'

export function generateStaticParams() {
  return DOC_PAGES.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(slug)
  if (!page) return { title: 'Not found — MCP Hub Docs' }
  return {
    title: `${page.title} — MCP Hub Docs`,
    description: page.description,
    alternates: { canonical: `/docs/${slug}` },
  }
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = getPage(slug)
  if (!page) notFound()

  const content = docContent[slug] || { intro: 'Documentation coming soon.' }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <DocsLayout>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{page.description}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            <code className="rounded bg-muted px-1.5 py-0.5">{`/docs/${slug}`}</code>
          </div>
          <div className="mt-8 space-y-6">
            {content.body}
          </div>
        </DocsLayout>
      </main>
      <Footer />
    </div>
  )
}
