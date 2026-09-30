import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'MCP Hub — Install any MCP server in one command'

export default async function OpengraphImage() {
  const [total, totalStars] = await Promise.all([
    db.mcpServer.count(),
    db.mcpServer.aggregate({ _sum: { stars: true } }),
  ])
  const stars = totalStars._sum.stars || 0
  const starsLabel = stars >= 1000 ? (stars / 1000).toFixed(1) + 'k' : String(stars)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f1a14 50%, #0a0a0a 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top row: logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'white',
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div style={{ display: 'flex', color: '#ffffff', fontSize: '28px', fontWeight: 700 }}>
            MCP Hub
          </div>
          <div
            style={{
              display: 'flex',
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid #10b981',
              color: '#10b981',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            OPEN SOURCE
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              color: '#ffffff',
              fontSize: '64px',
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            Install any MCP server in one command
          </div>
          <div style={{ display: 'flex', color: '#10b981', fontSize: '64px', fontWeight: 800 }}>
            powered by mcp-hub
          </div>
          <div style={{ display: 'flex', color: '#94a3b8', fontSize: '24px', marginTop: '8px' }}>
            The homebrew for Model Context Protocol servers.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '40px' }}>
          <Stat label="MCP SERVERS" value={String(total)} />
          <Stat label="TOTAL STARS" value={starsLabel} />
          <Stat label="AI CLIENTS" value="4+" />
          <Stat label="LICENSE" value="MIT" />
        </div>
      </div>
    ),
    { ...size }
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', color: '#10b981', fontSize: '36px', fontWeight: 800 }}>
        {value}
      </div>
      <div style={{ display: 'flex', color: '#94a3b8', fontSize: '12px', letterSpacing: '1px' }}>
        {label}
      </div>
    </div>
  )
}
