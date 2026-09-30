import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  if (!q) {
    return NextResponse.json({
      query: '',
      results: [],
      total: 0,
    })
  }

  const where = {
    OR: [
      { name: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
      { author: { contains: q } },
    ],
  }

  const [servers, total] = await Promise.all([
    db.mcpServer.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { stars: 'desc' }],
      take: limit,
      select: {
        slug: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        stars: true,
        featured: true,
        verified: true,
      },
    }),
    db.mcpServer.count({ where }),
  ])

  return NextResponse.json({
    query: q,
    results: servers.map((s) => ({
      ...s,
      tags: JSON.parse(s.tags),
    })),
    total,
  })
}
