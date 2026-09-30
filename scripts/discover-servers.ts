/**
 * Auto-discovers new MCP servers on GitHub by searching for repositories
 * that match MCP server patterns. Outputs candidate servers as a JSON file
 * for manual review.
 *
 * Run: bun run scripts/discover-servers.ts
 */
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_API = 'https://api.github.com'

interface GitHubSearchResult {
  total_count: number
  items: GitHubRepo[]
}

interface GitHubRepo {
  id: number
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
  topics: string[]
  homepage: string | null
  owner: { login: string }
}

interface CandidateServer {
  slug: string
  name: string
  description: string
  author: string
  repoUrl: string
  homepage: string | null
  stars: number
  language: string | null
  topics: string[]
  reason: string
}

async function searchGitHub(query: string, perPage = 30): Promise<GitHubRepo[]> {
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'mcp-hub-discovery',
  }
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`
  }

  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`GitHub search failed: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as GitHubSearchResult
  return data.items
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-mcp-?server/g, '')
    .replace(/-server$/, '')
    || 'unnamed'
}

async function main() {
  console.log('🔍 Searching GitHub for new MCP servers...\n')

  // Multiple search queries to catch different naming patterns
  const queries = [
    'mcp-server in:name',
    'model-context-protocol in:topics',
    'mcp server in:description',
    'mcp-server in:name language:typescript',
    'mcp-server in:name language:python',
  ]

  const allRepos = new Map<number, GitHubRepo>()

  for (const q of queries) {
    console.log(`  Searching: ${q}`)
    try {
      const repos = await searchGitHub(q, 30)
      for (const repo of repos) {
        allRepos.set(repo.id, repo)
      }
      console.log(`    Found ${repos.length} repos`)
    } catch (e) {
      console.error(`    Error: ${e instanceof Error ? e.message : 'unknown'}`)
    }
    // Delay to respect rate limits
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log(`\n📦 Found ${allRepos.size} unique repositories across all searches`)

  // Filter to likely MCP servers
  const candidates: CandidateServer[] = []

  for (const repo of allRepos.values()) {
    // Must have MCP-related keywords
    const nameLower = repo.full_name.toLowerCase()
    const descLower = (repo.description || '').toLowerCase()
    const topics = repo.topics || []

    const isMcp =
      nameLower.includes('mcp') ||
      descLower.includes('model context protocol') ||
      descLower.includes('mcp server') ||
      topics.includes('mcp') ||
      topics.includes('model-context-protocol')

    if (!isMcp) continue

    // Skip very low stars (likely personal experiments)
    if (repo.stargazers_count < 10) continue

    // Skip forks
    if ('fork' in repo && (repo as any).fork) continue

    // Skip archived
    if ('archived' in repo && (repo as any).archived) continue

    const repoName = repo.full_name.split('/')[1]
    const slug = toSlug(repoName)

    candidates.push({
      slug,
      name: repoName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: repo.description || 'No description available',
      author: `@${repo.owner.login}`,
      repoUrl: repo.html_url,
      homepage: repo.homepage || null,
      stars: repo.stargazers_count,
      language: repo.language,
      topics,
      reason: `Found via GitHub search — ${repo.stargazers_count} stars`,
    })
  }

  // Sort by stars descending
  candidates.sort((a, b) => b.stars - a.stars)

  console.log(`\n✅ Found ${candidates.length} candidate MCP servers:`)
  for (const c of candidates.slice(0, 20)) {
    console.log(`  ★ ${c.name.padEnd(25)} ${c.stars} stars  ${c.author}`)
  }
  if (candidates.length > 20) {
    console.log(`  ... and ${candidates.length - 20} more`)
  }

  // Write candidates to a file for review
  const outputPath = resolve(process.cwd(), 'scripts', 'discovered-servers.json')
  writeFileSync(
    outputPath,
    JSON.stringify({ discoveredAt: new Date().toISOString(), candidates }, null, 2) + '\n',
    'utf-8'
  )
  console.log(`\n📝 Written to: ${outputPath}`)
  console.log(`\n${candidates.length} candidates ready for review.`)
  console.log(`Review and add the best ones to scripts/seed.ts, then run export-registry.ts.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
