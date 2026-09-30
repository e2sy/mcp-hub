import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Missing "query" field' }, { status: 400 })
    }

    // Fetch all servers as context
    const servers = await db.mcpServer.findMany({
      select: {
        slug: true,
        name: true,
        description: true,
        category: true,
        tags: true,
      },
    })

    const serverList = servers
      .map((s) => `- ${s.slug} (${s.category}): ${s.description} [tags: ${s.tags}]`)
      .join('\n')

    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an MCP server recommendation engine. The user describes what they want to build or do. You recommend the 3-5 most relevant MCP servers from this list. Return ONLY a JSON object with this exact format, no other text:

{"recommendations": [{"slug": "server-slug", "reason": "one sentence why"}]}

Available servers:
${serverList}`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content || ''

    // Parse the JSON from the response
    let parsed: { recommendations: { slug: string; reason: string }[] }
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      return NextResponse.json({
        recommendations: [],
        raw: content,
        error: 'Failed to parse AI response',
      })
    }

    // Enrich with full server data
    const enriched = await Promise.all(
      (parsed.recommendations || []).map(async (rec) => {
        const server = await db.mcpServer.findUnique({
          where: { slug: rec.slug },
        })
        if (!server) return null
        return {
          ...server,
          tags: JSON.parse(server.tags),
          reason: rec.reason,
        }
      })
    )

    return NextResponse.json({
      query,
      recommendations: enriched.filter(Boolean),
    })
  } catch (error) {
    console.error('Recommend error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
