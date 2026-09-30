import { existsSync, readFileSync, writeFileSync } from 'fs'
import { detectClients } from './clients.js'
import { installServer, removeServer } from './config-writer.js'
import { getBundledRegistry, findServer } from './registry.js'
import { colors, symbols, header } from './ui.js'
import type { ServerEntry } from '../types.js'

interface BundleFile {
  version: string
  name: string
  description?: string
  servers: string[] // server slugs
}

/**
 * Exports currently installed servers (or a specified list) to a bundle file.
 */
export function exportBundle(filePath: string, options: { name?: string; description?: string }): void {
  console.log(header('Exporting bundle'))

  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))
  const registry = getBundledRegistry()

  // Collect all installed server slugs across clients
  const installedSlugs = new Set<string>()
  for (const client of detected) {
    try {
      const config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
      const servers = config.mcpServers || {}
      for (const slug of Object.keys(servers)) {
        installedSlugs.add(slug)
      }
    } catch {
      // ignore
    }
  }

  // Filter to only known registry servers
  const knownSlugs = [...installedSlugs].filter((slug) => findServer(registry, slug))

  if (knownSlugs.length === 0) {
    console.log(`  ${symbols.cross} No known MCP Hub servers found installed.`)
    console.log(`  ${colors.gray('Install servers with `mcp-hub install <name>` first.')}\n`)
    return
  }

  const bundle: BundleFile = {
    version: '1.0.0',
    name: options.name || 'My MCP Setup',
    description: options.description,
    servers: knownSlugs,
  }

  writeFileSync(filePath, JSON.stringify(bundle, null, 2) + '\n', 'utf-8')

  console.log(`  ${symbols.check} Exported ${colors.bold(String(knownSlugs.length))} servers to:`)
  console.log(`  ${colors.gray(filePath)}\n`)
  console.log(`  ${colors.gray('Servers:')}`)
  for (const slug of knownSlugs) {
    const server = findServer(registry, slug)
    console.log(`    ${symbols.bullet} ${server?.name || slug}`)
  }
  console.log(`\n  ${colors.gray('Share this file and others can install with:')}`)
  console.log(`  ${colors.cyan(`mcp-hub bundle install ${filePath}`)}\n`)
}

/**
 * Installs servers from a bundle file.
 */
export function importBundle(filePath: string): void {
  console.log(header('Installing from bundle'))

  if (!existsSync(filePath)) {
    console.log(`  ${symbols.cross} File not found: ${colors.red(filePath)}\n`)
    return
  }

  let bundle: BundleFile
  try {
    bundle = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (e) {
    console.log(`  ${symbols.cross} Invalid JSON: ${e instanceof Error ? e.message : 'parse error'}\n`)
    return
  }

  if (!bundle.servers || !Array.isArray(bundle.servers)) {
    console.log(`  ${symbols.cross} Invalid bundle file — missing "servers" array\n`)
    return
  }

  console.log(`  ${colors.gray('Bundle:')} ${bundle.name || 'unnamed'}`)
  if (bundle.description) {
    console.log(`  ${colors.gray('Description:')} ${bundle.description}`)
  }
  console.log(`  ${colors.gray('Servers:')} ${bundle.servers.length}\n`)

  const registry = getBundledRegistry()
  let installed = 0
  let skipped = 0

  for (const slug of bundle.servers) {
    const server = findServer(registry, slug)
    if (!server) {
      console.log(`  ${symbols.cross} ${slug} — not found in registry`)
      skipped++
      continue
    }
    const results = installServer(server)
    const success = results.some((r) => r.status === 'installed')
    const already = results.every((r) => r.status === 'already-exists' || r.status === 'skipped')
    if (success) {
      console.log(`  ${symbols.check} ${server.name} — installed`)
      installed++
    } else if (already) {
      console.log(`  ${colors.gray('○')} ${server.name} — already installed`)
    } else {
      console.log(`  ${symbols.cross} ${server.name} — failed`)
    }
  }

  console.log(`\n  ${symbols.check} ${colors.green('Done!')} Installed ${installed}, skipped ${skipped}`)
  console.log(`  ${colors.gray('Restart your AI clients to apply changes.')}\n`)
}
