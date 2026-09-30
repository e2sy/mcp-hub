import { db } from '@/lib/db'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Hero } from '@/components/hero'
import { AiRecommender } from '@/components/ai-recommender'
import { DirectoryBrowser } from '@/components/directory-browser'
import { CliSection } from '@/components/cli-section'
import { HowItWorks } from '@/components/how-it-works'
import { AddServerSection } from '@/components/add-server-section'
import { CustomSkillsSection } from '@/components/custom-skills-section'
import { FaqSection } from '@/components/faq-section'
import { CtaBanner } from '@/components/cta-banner'
import { ScrollProgress } from '@/components/scroll-progress'
import type { McpServerData, CategoryData, StatsData } from '@/lib/types'

export const dynamic = 'force-dynamic'

async function getData() {
  const [allServers, categories, total, totalCats, featuredCount, starsAgg] =
    await Promise.all([
      db.mcpServer.findMany({
        orderBy: [{ featured: 'desc' }, { stars: 'desc' }],
        take: 60,
      }),
      db.category.findMany({ orderBy: { name: 'asc' } }),
      db.mcpServer.count(),
      db.category.count(),
      db.mcpServer.count({ where: { featured: true } }),
      db.mcpServer.aggregate({ _sum: { stars: true } }),
    ])

  const parse = (s: any): McpServerData => ({
    ...s,
    tags: JSON.parse(s.tags),
  })

  return {
    allServers: allServers.map(parse),
    categories: categories as CategoryData[],
    stats: {
      totalServers: total,
      totalCategories: totalCats,
      featuredServers: featuredCount,
      totalStars: starsAgg._sum.stars || 0,
    } as StatsData,
  }
}

export default async function HomePage() {
  const { allServers, categories, stats } = await getData()

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        <Hero stats={stats} />
        <AiRecommender />
        <CliSection />
        <DirectoryBrowser initialServers={allServers} categories={categories} />
        <HowItWorks />
        <CustomSkillsSection />
        <AddServerSection />
        <FaqSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
