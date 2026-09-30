import { existsSync, readFileSync, statSync, readdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { detectClients, SUPPORTED_CLIENTS, getClientPaths } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { listInstalled } from './config-writer.js'
import { loadAliases } from './alias.js'
import { colors, symbols, header, formatStars } from './ui.js'

interface ClientStatus {
  name: string
  detected: boolean
  configPath: string | null
  configExists: boolean
  configModified: string | null
  serverCount: number
  servers: { name: string; known: boolean; hasPlaceholderEnv: boolean }[]
}

/**
 * Shows a complete dashboard of the user's MCP setup — like `git status` for MCP.
 */
export function showStatus(): void {
  console.log(header('MCP Hub Status'))

  const registry = getBundledRegistry()
  const detected = detectClients()
  const backupsDir = join(homedir(), '.mcp-hub', 'backups')
  const aliases = loadAliases()

  // ─── Clients section ────────────────────────────────────
  console.log(`  ${colors.bold('AI Clients')}\n`)

  let totalInstalled = 0
  let totalIssues = 0

  for (const client of detected) {
    const configExists = client.configPath ? existsSync(client.configPath) : false
    let serverCount = 0
    let servers: { name: string; known: boolean; hasPlaceholderEnv: boolean }[] = []
    let configModified: string | null = null

    if (configExists && client.configPath) {
      try {
        const stats = statSync(client.configPath)
        configModified = stats.mtime.toLocaleDateString('en', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      } catch {
        // ignore
      }

      try {
        const config = JSON.parse(readFileSync(client.configPath, 'utf-8'))
        const mcpServers = config.mcpServers || {}
        const slugs = Object.keys(mcpServers)
        serverCount = slugs.length
        servers = slugs.map((slug) => {
          const known = !!findServer(registry, slug)
          const serverConfig = mcpServers[slug]
          const env = serverConfig.env || {}
          const hasPlaceholder = Object.values(env).some((v: any) =>
            String(v).includes('YOUR_') || String(v).includes('your-') || String(v) === ''
          )
          return { name: slug, known, hasPlaceholderEnv: hasPlaceholder }
        })
        totalInstalled += serverCount
      } catch {
        // invalid JSON
      }
    }

    const icon = client.detected ? symbols.check : symbols.cross
    const status = client.detected ? colors.green('detected') : colors.gray('not found')
    const modStr = configModified ? colors.gray(` · modified ${configModified}`) : ''

    console.log(`  ${icon} ${colors.bold(client.name.padEnd(18))} ${status}${modStr}`)
    if (client.configPath) {
      console.log(`    ${colors.gray(client.configPath)}`)
    }

    if (serverCount > 0) {
      console.log(`    ${colors.gray(`${serverCount} server(s) installed:`)}`)
      for (const s of servers) {
        let issues: string[] = []
        if (!s.known) issues.push('not in registry')
        if (s.hasPlaceholderEnv) issues.push('placeholder env')
        const issueStr = issues.length > 0 ? ` ${colors.red(`(${issues.join(', ')})`)}` : ''
        console.log(`      ${symbols.bullet} ${s.name}${issueStr}`)
        if (issues.length > 0) totalIssues++
      }
    } else if (client.detected) {
      console.log(`    ${colors.gray('No servers installed')}`)
    }
    console.log()
  }

  // ─── Summary section ────────────────────────────────────
  console.log(`  ${colors.gray('─'.repeat(48))}`)
  console.log(`  ${colors.bold('Summary')}\n`)
  console.log(`  ${symbols.bullet} Clients detected:   ${detected.filter((c) => c.detected).length}/${SUPPORTED_CLIENTS.length}`)
  console.log(`  ${symbols.bullet} Servers installed:   ${totalInstalled}`)
  console.log(`  ${symbols.bullet} Registry servers:    ${registry.servers.length}`)
  console.log(`  ${symbols.bullet} Aliases configured:  ${Object.keys(aliases).length}`)
  console.log(`  ${symbols.bullet} Backups available:   ${existsSync(backupsDir) ? countBackups(backupsDir) : 0}`)

  if (totalIssues > 0) {
    console.log(`  ${symbols.cross} ${colors.red(`Issues found:       ${totalIssues}`)}`)
    console.log(`    ${colors.gray('Run `mcp-hub doctor` for details')}`)
  } else if (totalInstalled > 0) {
    console.log(`  ${symbols.check} ${colors.green('All configs look healthy')}`)
  }

  console.log()

  // ─── Quick actions ──────────────────────────────────────
  console.log(`  ${colors.bold('Quick actions')}\n`)
  console.log(`  ${colors.cyan('mcp-hub install')}          ${colors.gray('# interactive installer')}`)
  console.log(`  ${colors.cyan('mcp-hub doctor')}          ${colors.gray('# diagnose config issues')}`)
  console.log(`  ${colors.cyan('mcp-hub backup')}          ${colors.gray('# back up your configs')}`)
  console.log(`  ${colors.cyan('mcp-hub update --all')}   ${colors.gray('# refresh all servers')}`)
  console.log()
}

function countBackups(dir: string): number {
  try {
    return readdirSync(dir).filter((e) =>
      statSync(join(dir, e)).isDirectory()
    ).length
  } catch {
    return 0
  }
}
