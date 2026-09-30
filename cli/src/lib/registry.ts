import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Registry, ServerEntry } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Try to load the bundled registry.json first, fall back to fetching from GitHub
let cachedRegistry: Registry | null = null

export function getBundledRegistry(): Registry {
  if (cachedRegistry) return cachedRegistry

  try {
    // When built, registry.json is copied to dist/
    const paths = [
      resolve(__dirname, 'registry.json'),
      resolve(__dirname, '..', 'src', 'registry.json'),
      resolve(process.cwd(), 'public', 'servers.json'),
    ]

    for (const p of paths) {
      try {
        const raw = readFileSync(p, 'utf-8')
        cachedRegistry = JSON.parse(raw) as Registry
        return cachedRegistry!
      } catch {
        // try next path
      }
    }
  } catch {
    // ignore
  }

  // Return empty registry as last resort
  return { version: '0.0.0', generatedAt: '', categories: [], servers: [] }
}

const REGISTRY_URL =
  'https://raw.githubusercontent.com/e2sy/mcp-hub/main/public/servers.json'

export async function fetchRemoteRegistry(): Promise<Registry> {
  const res = await fetch(REGISTRY_URL, {
    headers: { 'User-Agent': 'mcp-hub-cli' },
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch registry: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as Registry
}

export function findServer(registry: Registry, name: string): ServerEntry | undefined {
  const lower = name.toLowerCase()
  return registry.servers.find(
    (s) => s.slug === lower || s.name.toLowerCase() === lower
  )
}

export function searchServers(registry: Registry, query: string): ServerEntry[] {
  const q = query.toLowerCase()
  return registry.servers.filter((s) => {
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.author.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    )
  })
}
