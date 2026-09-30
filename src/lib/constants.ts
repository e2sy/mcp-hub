export const GITHUB_REPO = 'https://github.com/e2sy/mcp-hub'
export const GITHUB_USER = 'e2sy'

export function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return n.toString()
}

export function categoryColors(category: string): { bg: string; text: string; ring: string } {
  const map: Record<string, { bg: string; text: string; ring: string }> = {
    database:      { bg: 'bg-emerald-500/10',  text: 'text-emerald-500',     ring: 'ring-emerald-500/20' },
    search:        { bg: 'bg-orange-500/10',   text: 'text-orange-500',      ring: 'ring-orange-500/20' },
    filesystem:    { bg: 'bg-amber-500/10',    text: 'text-amber-500',       ring: 'ring-amber-500/20' },
    api:           { bg: 'bg-violet-500/10',   text: 'text-violet-500',      ring: 'ring-violet-500/20' },
    productivity:  { bg: 'bg-pink-500/10',     text: 'text-pink-500',        ring: 'ring-pink-500/20' },
    devtools:      { bg: 'bg-cyan-500/10',     text: 'text-cyan-500',        ring: 'ring-cyan-500/20' },
    cloud:         { bg: 'bg-sky-500/10',      text: 'text-sky-500',         ring: 'ring-sky-500/20' },
    communication: { bg: 'bg-rose-500/10',     text: 'text-rose-500',        ring: 'ring-rose-500/20' },
    data:          { bg: 'bg-teal-500/10',     text: 'text-teal-500',        ring: 'ring-teal-500/20' },
    ai:            { bg: 'bg-fuchsia-500/10',  text: 'text-fuchsia-500',     ring: 'ring-fuchsia-500/20' },
  }
  return map[category] || { bg: 'bg-zinc-500/10', text: 'text-zinc-500', ring: 'ring-zinc-500/20' }
}
