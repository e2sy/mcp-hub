import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/verify
 *
 * Receives verification reports from the mcp-hub-verify GitHub Action.
 * Server authors add the Action to their repo, and it reports whether
 * the server passes `mcp-hub test` on every commit.
 *
 * Body:
 * {
 *   "serverSlug": "github",
 *   "repoUrl": "https://github.com/modelcontextprotocol/servers",
 *   "status": "passed" | "failed",
 *   "commitSha": "abc123",
 *   "branch": "main",
 *   "runUrl": "https://github.com/..."
 * }
 *
 * Updates the server's verification status in the database.
 * In production, this would require authentication (MCP_HUB_TOKEN).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { serverSlug, repoUrl, status, commitSha, branch, runUrl } = body

    if (!serverSlug || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: serverSlug, status' },
        { status: 400 }
      )
    }

    if (status !== 'passed' && status !== 'failed') {
      return NextResponse.json(
        { error: 'Status must be "passed" or "failed"' },
        { status: 400 }
      )
    }

    // Find the server by slug
    const server = await db.mcpServer.findUnique({
      where: { slug: serverSlug.toLowerCase() },
    })

    if (!server) {
      return NextResponse.json(
        { error: `Server "${serverSlug}" not found in registry` },
        { status: 404 }
      )
    }

    // In a real implementation, we'd store verification history in a separate table.
    // For now, we update the server's verified status based on the report.
    const verified = status === 'passed'

    await db.mcpServer.update({
      where: { id: server.id },
      data: {
        verified,
      },
    })

    return NextResponse.json({
      ok: true,
      serverSlug,
      status,
      verified,
      updatedAt: new Date().toISOString(),
      message: verified
        ? 'Server marked as verified ✅'
        : 'Server marked as unverified (test failed) ⚠️',
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/verify?slug=github
 * Returns the verification status for a server.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  const server = await db.mcpServer.findUnique({
    where: { slug: slug.toLowerCase() },
    select: {
      slug: true,
      name: true,
      verified: true,
      repoUrl: true,
      updatedAt: true,
    },
  })

  if (!server) {
    return NextResponse.json({ error: 'Server not found' }, { status: 404 })
  }

  return NextResponse.json({
    slug: server.slug,
    name: server.name,
    verified: server.verified,
    repoUrl: server.repoUrl,
    lastChecked: server.updatedAt,
  })
}
