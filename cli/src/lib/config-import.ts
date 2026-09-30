import { existsSync, readFileSync } from 'fs'
import { detectClients } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { colors, symbols, header } from './ui.js'
import { logAction } from './history.js'

/**
 * Imports existing MCP server configs from AI clients into MCP Hub's
 * management. Useful for users who already have configs set up manually.
 *
 * Scans each client's config file for servers that aren't yet tracked
 * by MCP Hub (i.e. not in the registry) and reports them.
 *
 * For servers that ARE in the registry, it just acknowledges them.
 * For servers that AREN'T in the registry, it shows them so the user
 * can add them via `mcp-hub add <github-url>` or submit them.
 */
export function importConfigs(options: { from?: string }): void {
  const registry = getBundledRegistry()
  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))

  if (detected.length === 0) {
    console.log(header('Config import'))
    console.log(`  ${symbols.cross} No AI clients detected.`)
    console.log(`  ${colors.gray('Install Claude Desktop, Cursor, Cline, or Windsurf first.')}\n`)
    return
  }

  // Filter by --from if specified
  const targetClients = options.from
    ? detected.filter((c) => c.name.toLowerCase().includes(options.from!.toLowerCase()))
    : detected

  if (targetClients.length === 0) {
    console.log(header('Config import'))
    console.log(`  ${symbols.cross} No matching clients found for "--from ${options.from}"\n`)
    return
  }

  console.log(header('Importing configs'))

  let totalKnown = 0
  let totalUnknown = 0
  const unknownServers: { client: string; slug: string; command: string }[] = []

  for (const client of targetClients) {
    console.log(`\n  ${colors.bold(client.name)}`)

    let config: any
    try {
      config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
    } catch {
      console.log(`    ${symbols.cross} ${colors.red('Invalid JSON — skipping')}`)
      continue
    }

    const servers = config.mcpServers || {}
    const slugs = Object.keys(servers)

    if (slugs.length === 0) {
      console.log(`    ${colors.gray('No servers configured')}`)
      continue
    }

    console.log(`    ${colors.gray(`${slugs.length} server(s) found:`)}`)

    for (const slug of slugs) {
      const known = !!findServer(registry, slug)
      const serverConfig = servers[slug]
      const command = serverConfig.command || '(no command)'

      if (known) {
        console.log(`      ${symbols.check} ${slug.padEnd(20)} ${colors.green('in registry')}`)
        totalKnown++
      } else {
        console.log(`      ${colors.yellow('⚠')} ${slug.padEnd(20)} ${colors.gray('not in registry')}`)
        unknownServers.push({ client: client.name, slug, command })
        totalUnknown++
      }
    }
  }

  // Summary
  console.log(`\n  ${colors.gray('═'.repeat(46))}`)
  console.log(`  ${colors.bold('Summary')}\n`)
  console.log(`  ${symbols.bullet} Known servers (in registry):  ${totalKnown}`)
  console.log(`  ${symbols.bullet} Unknown servers:              ${totalUnknown}`)

  if (unknownServers.length > 0) {
    console.log(`\n  ${colors.bold('Unknown servers found:')}`)
    console.log(`  ${colors.gray('These are installed but not in the MCP Hub registry.')}`)
    console.log(`  ${colors.gray('You can submit them to the directory:')}\n`)
    for (const s of unknownServers) {
      console.log(`    ${symbols.bullet} ${s.slug} ${colors.gray(`(${s.command}, in ${s.client})`)}`)
    }
    console.log(`\n  ${colors.gray('Submit with:')} mcp-hub publish`)
    console.log(`  ${colors.gray('Or add manually:')} mcp-hub add <github-url>`)
  }

  if (totalKnown > 0) {
    console.log(`\n  ${colors.gray('Known servers are already managed by MCP Hub.')}`)
    console.log(`  ${colors.gray('Use `mcp-hub status` to see your full setup.')}`)
  }

  // Log the import action
  logAction('import', `${targetClients.length} clients`, `${totalKnown} known, ${totalUnknown} unknown`)

  console.log()
}
