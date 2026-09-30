import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const category = searchParams.get('category')?.trim() || ''
  const featuredOnly = searchParams.get('featured') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
      { author: { contains: q } },
    ]
  }
  if (category && category !== 'all') {
    where.category = category
  }
  if (featuredOnly) {
    where.featured = true
  }

  const [servers, total] = await Promise.all([
    db.mcpServer.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { stars: 'desc' }],
      take: limit,
      skip: offset,
    }),
    db.mcpServer.count({ where }),
  ])

  return NextResponse.json({
    servers: servers.map((s) => ({
      ...s,
      tags: JSON.parse(s.tags),
    })),
    total,
    limit,
    offset,
  })
}
