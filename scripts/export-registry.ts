/**
 * Extracts all MCP servers from the database and writes them to /public/servers.json
 * This file is the single source of truth — the CLI bundles it, and the website
 * can serve it at /servers.json for the CLI's update command.
 *
 * Run: bun run scripts/export-registry.ts
 */
import { db } from '@/lib/db'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

async function main() {
  const [servers, categories] = await Promise.all([
    db.mcpServer.findMany({
      orderBy: [{ featured: 'desc' }, { stars: 'desc' }],
    }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const registry = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    categories: categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      description: c.description,
    })),
    servers: servers.map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description,
      longDescription: s.longDescription,
      author: s.author,
      repoUrl: s.repoUrl,
      homepage: s.homepage,
      category: s.category,
      tags: JSON.parse(s.tags),
      installCmd: s.installCmd,
      configJson: s.configJson,
      stars: s.stars,
      featured: s.featured,
      verified: s.verified,
    })),
  }

  const outPath = resolve(process.cwd(), 'public', 'servers.json')
  writeFileSync(outPath, JSON.stringify(registry, null, 2) + '\n', 'utf-8')

  // Also write to the CLI's src directory so it gets bundled
  const cliPath = resolve(process.cwd(), 'cli', 'src', 'registry.json')
  writeFileSync(cliPath, JSON.stringify(registry, null, 2) + '\n', 'utf-8')

  console.log(`✅ Exported ${servers.length} servers to:`)
  console.log(`   ${outPath}`)
  console.log(`   ${cliPath}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
