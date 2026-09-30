/**
 * Syncs GitHub star counts for all MCP servers in the database.
 * Runs as a weekly GitHub Action — keeps the directory feeling alive.
 *
 * Run locally: bun run scripts/sync-stars.ts
 * Requires: GITHUB_TOKEN env var (for higher API rate limits)
 */
import { db } from '@/lib/db'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_API = 'https://api.github.com'

interface GitHubRepo {
  stargazers_count: number
  full_name: string
}

/**
 * Extracts owner/repo from a GitHub URL.
 * Handles: https://github.com/owner/repo/...
 */
function extractRepoInfo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

async function fetchStars(owner: string, repo: string): Promise<number | null> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'mcp-hub-star-sync',
  }
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(url, { headers })
    if (!res.ok) {
      console.error(`  ✗ ${owner}/${repo}: ${res.status}`)
      return null
    }
    const data = (await res.json()) as GitHubRepo
    return data.stargazers_count
  } catch (e) {
    console.error(`  ✗ ${owner}/${repo}: ${e instanceof Error ? e.message : 'fetch error'}`)
    return null
  }
}

async function main() {
  console.log('⭐ Syncing GitHub stars for all MCP servers...\n')

  const servers = await db.mcpServer.findMany()
  let updated = 0
  let unchanged = 0
  let failed = 0

  for (const server of servers) {
    const repoInfo = extractRepoInfo(server.repoUrl)
    if (!repoInfo) {
      console.log(`  ⊘ ${server.name} — not a GitHub repo, skipping`)
      failed++
      continue
    }

    const stars = await fetchStars(repoInfo.owner, repoInfo.repo)
    if (stars === null) {
      failed++
      continue
    }

    if (stars !== server.stars) {
      const delta = stars - server.stars
      const deltaStr = delta > 0 ? `+${delta}` : `${delta}`
      console.log(`  ★ ${server.name.padEnd(20)} ${server.stars} → ${stars} (${deltaStr})`)
      await db.mcpServer.update({
        where: { id: server.id },
        data: { stars },
      })
      updated++
    } else {
      unchanged++
    }

    // Small delay to respect rate limits
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`\n✅ Done!`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Unchanged: ${unchanged}`)
  console.log(`   Failed/Skipped: ${failed}`)

  // Re-export the registry if any stars changed
  if (updated > 0) {
    console.log('\n📦 Re-exporting registry...')
    // Note: requires running export-registry.ts separately
    console.log('   Run: bun run scripts/export-registry.ts')
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
