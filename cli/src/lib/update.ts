import { existsSync, readFileSync } from 'fs'
import { detectClients, SUPPORTED_CLIENTS } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { installServer, removeServer } from './config-writer.js'
import { colors, symbols, header } from './ui.js'
import type { ServerEntry } from '../types.js'

/**
 * Resolves a user-provided client name (e.g. "cursor", "claude") to the
 * canonical client name (e.g. "Cursor", "Claude Desktop").
 */
function resolveClientName(input: string): string | null {
  const lower = input.toLowerCase()
  const match = SUPPORTED_CLIENTS.find((c) => c.toLowerCase().includes(lower))
  return match || null
}

/**
 * Updates a single installed server by re-applying its registry config.
 * Useful when the registry install command or config JSON has changed.
 */
export function updateServer(name: string, options: { client?: string }): void {
  const registry = getBundledRegistry()
  const server = findServer(registry, name)

  if (!server) {
    console.log(`  ${symbols.cross} Server "${colors.red(name)}" not found in registry.`)
    console.log(`  ${colors.gray('Try:')} mcp-hub search "${name}"\n`)
    return
  }

  console.log(`  ${colors.gray('Updating:')} ${server.name}`)
  console.log(`  ${colors.gray('Author:')}   ${server.author}`)
  console.log(`  ${colors.gray('Stars:')}    ${symbols.star} ${server.stars}\n`)

  // Remove then re-install to refresh the config
  let clientFilter: string[] | undefined
  if (options.client) {
    const resolved = resolveClientName(options.client)
    if (!resolved) {
      console.log(`  ${symbols.cross} Unknown client "${options.client}"\n`)
      return
    }
    clientFilter = [resolved]
  }
  const removed = removeServer(server.slug, clientFilter)
  const results = installServer(server, clientFilter)

  console.log(header('Results'))
  let updated = 0
  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    const wasRemoved = removed[i]?.status === 'installed'
    // If we removed it, then "installed" = updated. If "already-exists", we just refreshed.
    const icon = r.status === 'installed' || wasRemoved ? symbols.check : symbols.cross
    const msg = wasRemoved ? `Refreshed "${server.name}" config` : r.message
    console.log(`  ${icon} ${colors.bold(r.client)}: ${msg}`)
    if (wasRemoved || r.status === 'installed') updated++
  }

  if (updated > 0) {
    console.log(`\n  ${symbols.check} ${colors.green('Updated!')} Restart your AI client.\n`)
  } else {
    console.log(`\n  ${colors.gray('No changes needed.')}\n`)
  }
}

/**
 * Updates all installed servers across all detected clients.
 */
export function updateAll(): void {
  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))
  const registry = getBundledRegistry()

  console.log(header('Updating all installed servers'))

  if (detected.length === 0) {
    console.log(`  ${symbols.cross} No AI clients detected.\n`)
    return
  }

  let totalUpdated = 0
  let totalSkipped = 0

  for (const client of detected) {
    console.log(`\n  ${colors.bold(client.name)}`)

    let config: any
    try {
      config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
    } catch {
      console.log(`    ${symbols.cross} Could not read config`)
      continue
    }

    const installedSlugs = Object.keys(config.mcpServers || {})
    if (installedSlugs.length === 0) {
      console.log(`    ${colors.gray('No servers installed')}`)
      continue
    }

    for (const slug of installedSlugs) {
      const server = findServer(registry, slug)
      if (!server) {
        console.log(`    ${colors.gray('○')} ${slug} — not in registry, skipping`)
        totalSkipped++
        continue
      }

      // Remove + reinstall
      removeServer(server.slug, [client.name])
      const results = installServer(server, [client.name])
      const updated = results.some((r) => r.status === 'installed')

      if (updated) {
        console.log(`    ${symbols.check} ${server.name} — updated`)
        totalUpdated++
      } else {
        console.log(`    ${colors.gray('○')} ${server.name} — already current`)
      }
    }
  }

  console.log(`\n  ${colors.gray('─'.repeat(40))}`)
  console.log(`  ${symbols.check} ${colors.green('Done!')} Updated ${totalUpdated}, skipped ${totalSkipped}`)
  console.log(`  ${colors.gray('Restart your AI clients to apply changes.')}\n`)
}
