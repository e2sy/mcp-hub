import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Star, ShieldCheck, ExternalLink, Github, CheckCircle2, Zap, ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InstallCommand } from '@/components/install-command'
import { ServerConfigTabs } from '@/components/server-config-tabs'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { formatStars, categoryColors, GITHUB_REPO } from '@/lib/constants'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const servers = await db.mcpServer.findMany({ select: { slug: true } })
  return servers.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const server = await db.mcpServer.findUnique({ where: { slug } })
  if (!server) return { title: 'Server not found — MCP Hub' }

  const title = `${server.name} MCP Server — Install & Config | MCP Hub`
  const description = server.description

  return {
    title,
    description,
    alternates: { canonical: `/servers/${slug}` },
    openGraph: {
      title,
      description,
      url: `/servers/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ServerPage({ params }: PageProps) {
  const { slug } = await params
  const server = await db.mcpServer.findUnique({ where: { slug } })
  if (!server) notFound()

  const tags: string[] = JSON.parse(server.tags)
  const colors = categoryColors(server.category)
  const related = await db.mcpServer.findMany({
    where: { category: server.category, slug: { not: slug } },
    take: 3,
    orderBy: { stars: 'desc' },
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: server.name,
    description: server.description,
    author: { '@type': 'Organization', name: server.author },
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
    url: server.repoUrl,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/servers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All servers
          </Link>

          {/* Header */}
          <div className="mt-6 flex items-start gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${colors.bg} ${colors.text} text-2xl font-bold uppercase ring-1 ${colors.ring}`}
            >
              {server.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{server.name}</h1>
                {server.verified && (
                  <ShieldCheck className="h-5 w-5 text-primary" />
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                by <span className="font-medium text-foreground/80">{server.author}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs font-medium">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {formatStars(server.stars)} stars
                </span>
                <Badge className={`${colors.bg} ${colors.text} hover:${colors.bg}`}>
                  {server.category}
                </Badge>
                {server.featured && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3 text-primary" />
                    Featured
                  </Badge>
                )}
                {server.verified && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 prose prose-sm dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed text-foreground/90">
              {server.longDescription || server.description}
            </p>
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={server.repoUrl} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" />
                View repository
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </Button>
            {server.homepage && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={server.homepage} target="_blank" rel="noreferrer">
                  Homepage
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
          </div>

          {/* Install */}
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold">Installation</h2>
            <p className="text-sm text-muted-foreground">
              Install {server.name} with one command using the MCP Hub CLI, or configure it manually below.
            </p>
            <InstallCommand command={server.installCmd} label="One-line install with MCP Hub CLI" />
          </div>

          {/* Manual config */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Manual configuration</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick your AI client below and paste the JSON into its config file.
            </p>
            <div className="mt-4">
              <ServerConfigTabs configJson={server.configJson} />
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="text-xl font-semibold">Related servers</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Other {server.category} servers you might find useful.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {related.map((r) => {
                  const rc = categoryColors(r.category)
                  return (
                    <Link
                      key={r.id}
                      href={`/servers/${r.slug}`}
                      className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${rc.bg} ${rc.text} text-sm font-bold uppercase`}>
                          {r.name.charAt(0)}
                        </div>
                        <span className="font-medium group-hover:text-primary">{r.name}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {formatStars(r.stars)}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
            <h3 className="text-lg font-semibold">Want to install this without the CLI?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get the MCP Hub CLI for one-command installs across all your AI clients.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/cli">
                  Get the CLI
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={GITHUB_REPO} target="_blank" rel="noreferrer">Star on GitHub</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
