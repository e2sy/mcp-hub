import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const [totalServers, totalCategories, featuredServers, totalStars] =
    await Promise.all([
      db.mcpServer.count(),
      db.category.count(),
      db.mcpServer.count({ where: { featured: true } }),
      db.mcpServer.aggregate({ _sum: { stars: true } }),
    ])

  return NextResponse.json({
    totalServers,
    totalCategories,
    featuredServers,
    totalStars: totalStars._sum.stars || 0,
  })
}
