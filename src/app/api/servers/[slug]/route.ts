import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const server = await db.mcpServer.findUnique({ where: { slug } })
  if (!server) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({
    ...server,
    tags: JSON.parse(server.tags),
  })
}
