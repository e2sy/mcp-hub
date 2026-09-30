import { existsSync, readFileSync } from 'fs'
import { detectClients } from './clients.js'
import { colors, symbols, header } from './ui.js'

/**
 * Pretty-prints the config for a specific client (or all clients).
 * Unlike `config edit`, this just shows the config without opening an editor.
 */
export function showConfig(clientName?: string): void {
  const detected = detectClients()

  // If a specific client is requested
  if (clientName) {
    const lower = clientName.toLowerCase()
    const client = detected.find((c) => c.name.toLowerCase().includes(lower))

    if (!client) {
      console.log(`  ${symbols.cross} Client "${colors.red(clientName)}" not detected.`)
      console.log(`  ${colors.gray('Available:')} ${detected.filter((c) => c.detected).map((c) => c.name).join(', ')}\n`)
      return
    }

    if (!client.configPath || !existsSync(client.configPath)) {
      console.log(`  ${symbols.cross} No config file found for ${client.name}.`)
      console.log(`  ${colors.gray('Install a server first: mcp-hub install <name>')}\n`)
      return
    }

    console.log(header(`${client.name} config`))
    console.log(`  ${colors.gray('Path:')} ${client.configPath}\n`)

    try {
      const raw = readFileSync(client.configPath, 'utf-8')
      const config = JSON.parse(raw)
      const pretty = JSON.stringify(config, null, 2)
      console.log(colors.gray(pretty))
    } catch (e) {
      console.log(`  ${symbols.cross} ${colors.red('Invalid JSON:')}`)
      console.log(`  ${colors.gray(e instanceof Error ? e.message : 'parse error')}\n`)
    }
    console.log()
    return
  }

  // Show all detected clients
  const withConfigs = detected.filter((c) => c.detected && c.configPath && existsSync(c.configPath))

  if (withConfigs.length === 0) {
    console.log(header('No configs found'))
    console.log(`  ${symbols.cross} No AI client config files detected.`)
    console.log(`  ${colors.gray('Install a server first: mcp-hub install <name>')}\n`)
    return
  }

  console.log(header('All client configs'))

  for (const client of withConfigs) {
    console.log(`\n  ${colors.bold(client.name)}`)
    console.log(`  ${colors.gray(client.configPath || '(no path)')}`)

    try {
      const raw = readFileSync(client.configPath!, 'utf-8')
      const config = JSON.parse(raw)
      const servers = config.mcpServers || {}
      const slugs = Object.keys(servers)

      if (slugs.length === 0) {
        console.log(`  ${colors.gray('  (no servers installed)')}`)
      } else {
        for (const slug of slugs) {
          const s = servers[slug]
          const cmd = s.command || '(missing command)'
          const argsCount = s.args?.length || 0
          const envCount = s.env ? Object.keys(s.env).length : 0
          console.log(`    ${symbols.bullet} ${colors.bold(slug)} ${colors.gray(`→ ${cmd} (${argsCount} args, ${envCount} env vars)`)}`)
        }
      }
    } catch {
      console.log(`  ${symbols.cross} ${colors.red('Invalid JSON')}`)
    }
  }
  console.log()
}
