import { existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { detectClients, SUPPORTED_CLIENTS } from './clients.js'
import { getBundledRegistry } from './registry.js'
import { loadAliases } from './alias.js'
import { colors, symbols, header } from './ui.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getCliVersion(): string {
  try {
    // Try to read from package.json (works in dev)
    const pkgPath = join(__dirname, '..', 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      return pkg.version || 'unknown'
    }
  } catch {
    // ignore
  }
  return '1.4.0' // fallback
}

/**
 * Shows information about the user's environment — like `whoami` but for MCP.
 * Detects AI clients, shows versions, config paths, and environment details.
 */
export function showWhoami(): void {
  console.log(header('MCP Hub Environment'))

  // ─── System info ────────────────────────────────────────
  const platform = process.platform
  const arch = process.arch
  const nodeVersion = process.version
  const home = homedir()

  const platformName = platform === 'darwin' ? 'macOS' : platform === 'win32' ? 'Windows' : 'Linux'

  console.log(`  ${colors.bold('System')}\n`)
  console.log(`  ${symbols.bullet} OS:          ${platformName} (${arch})`)
  console.log(`  ${symbols.bullet} Node.js:     ${nodeVersion}`)
  console.log(`  ${symbols.bullet} Home:        ${colors.gray(home)}`)
  console.log(`  ${symbols.bullet} Shell:       ${colors.gray(process.env.SHELL || process.env.ComSpec || 'unknown')}`)

  // ─── MCP Hub info ───────────────────────────────────────
  const registry = getBundledRegistry()
  console.log(`\n  ${colors.bold('MCP Hub')}\n`)
  console.log(`  ${symbols.bullet} Version:     ${getCliVersion()}`)
  console.log(`  ${symbols.bullet} Registry:    ${registry.servers.length} servers`)
  console.log(`  ${symbols.bullet} Data dir:    ${colors.gray(join(home, '.mcp-hub'))}`)

  const aliases = loadAliases()
  console.log(`  ${symbols.bullet} Aliases:     ${Object.keys(aliases).length}`)

  // ─── AI Clients ─────────────────────────────────────────
  console.log(`\n  ${colors.bold('AI Clients')}\n`)
  const detected = detectClients()
  for (const client of detected) {
    const icon = client.detected ? symbols.check : symbols.cross
    const status = client.detected ? colors.green('detected') : colors.gray('not found')
    console.log(`  ${icon} ${client.name.padEnd(18)} ${status}`)

    if (client.detected && client.configPath) {
      // Count installed servers
      let serverCount = 0
      if (existsSync(client.configPath)) {
        try {
          const config = JSON.parse(readFileSync(client.configPath, 'utf-8'))
          serverCount = Object.keys(config.mcpServers || {}).length
        } catch {
          // invalid JSON
        }
      }
      console.log(`    ${colors.gray(client.configPath)}`)
      console.log(`    ${colors.gray(`${serverCount} server(s) installed`)}`)
    }
  }

  // ─── Environment variables ──────────────────────────────
  console.log(`\n  ${colors.bold('Environment')}\n`)
  const envVars = ['EDITOR', 'VISUAL', 'SHELL', 'TERM']
  for (const v of envVars) {
    const value = process.env[v]
    if (value) {
      console.log(`  ${symbols.bullet} ${v.padEnd(12)} ${colors.gray(value)}`)
    }
  }

  // ─── npm global path ────────────────────────────────────
  try {
    const npmRoot = execSync('npm root -g', { encoding: 'utf-8', timeout: 5000 }).trim()
    console.log(`  ${symbols.bullet} npm global:  ${colors.gray(npmRoot)}`)
  } catch {
    // npm not available
  }

  console.log()
}
