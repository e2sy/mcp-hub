import { existsSync, readFileSync } from 'fs'
import { spawnSync } from 'child_process'
import type { ClientDetection } from '../types.js'
import { detectClients } from './clients.js'
import { colors, symbols, header } from './ui.js'

interface DoctorResult {
  client: string
  configPath: string
  servers: { name: string; status: 'ok' | 'warning' | 'error'; issues: string[] }[]
}

/**
 * Validates the JSON config file for a client.
 */
function validateConfigJson(path: string): { valid: boolean; data: any; error?: string } {
  if (!existsSync(path)) {
    return { valid: false, data: null, error: 'Config file does not exist' }
  }
  try {
    const raw = readFileSync(path, 'utf-8')
    const data = JSON.parse(raw)
    if (!data.mcpServers || typeof data.mcpServers !== 'object') {
      return { valid: false, data, error: 'Missing "mcpServers" key or not an object' }
    }
    return { valid: true, data }
  } catch (e) {
    return { valid: false, data: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

/**
 * Checks if an npx package can be resolved.
 */
function checkPackage(packageName: string): boolean {
  try {
    const result = spawnSync('npm', ['view', packageName, 'version'], {
      stdio: 'pipe',
      timeout: 10000,
      shell: true,
    })
    return result.status === 0
  } catch {
    return false
  }
}

/**
 * Extracts package name from command+args.
 */
function getPackageName(command: string, args: string[]): string | null {
  if (command === 'npx' || command === 'npx-cli') {
    // Find the package arg (usually after -y)
    const yIdx = args.indexOf('-y')
    if (yIdx !== -1 && args[yIdx + 1]) return args[yIdx + 1]
    // Or the first arg that's not a flag
    const pkg = args.find((a) => !a.startsWith('-') && !a.startsWith('http'))
    return pkg || null
  }
  if (command === 'node' || command === 'python' || command === 'python3') {
    return null // local script, can't check
  }
  return command
}

/**
 * Checks env vars in a server config — reports missing ones without revealing values.
 */
function checkEnvVars(serverConfig: any): string[] {
  const issues: string[] = []
  const env = serverConfig.env || {}
  for (const [key, value] of Object.entries(env)) {
    const v = String(value)
    if (v === 'YOUR_TOKEN' || v === 'YOUR_API_KEY' || v === 'YOUR_KEY' ||
        v.includes('your-') || v.includes('YOUR_') || v === 'xxx' || v === '') {
      issues.push(`Missing env var: ${key} (placeholder value)`)
    }
  }
  return issues
}

export function runDoctor(): void {
  console.log(header('MCP Hub Doctor — diagnosing configs'))

  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))

  if (detected.length === 0) {
    console.log(`  ${symbols.cross} No AI client config files found.`)
    console.log(`  ${colors.gray('Install Claude Desktop, Cursor, Cline, or Windsurf first.')}\n`)
    return
  }

  let totalIssues = 0
  let totalServers = 0

  for (const client of detected) {
    console.log(`\n  ${colors.bold(client.name)}`)
    console.log(`  ${colors.gray(client.configPath!)}`)

    const result = validateConfigJson(client.configPath!)
    if (!result.valid) {
      console.log(`    ${symbols.cross} ${colors.red('Invalid config:')} ${result.error}`)
      totalIssues++
      continue
    }

    const servers = result.data.mcpServers
    const serverNames = Object.keys(servers)

    if (serverNames.length === 0) {
      console.log(`    ${colors.gray('No servers installed')}`)
      continue
    }

    for (const name of serverNames) {
      totalServers++
      const serverConfig = servers[name]
      const issues: string[] = []

      // Check command exists
      if (!serverConfig.command) {
        issues.push('Missing "command" field')
      }

      // Check args
      if (!serverConfig.args || !Array.isArray(serverConfig.args)) {
        issues.push('Missing or invalid "args" field')
      }

      // Check env vars
      issues.push(...checkEnvVars(serverConfig))

      // Check package resolvability (only for npx, skip if too slow)
      const pkg = serverConfig.command === 'npx'
        ? getPackageName('npx', serverConfig.args || [])
        : null

      if (issues.length === 0) {
        console.log(`    ${symbols.check} ${name.padEnd(20)} ${colors.green('OK')}`)
      } else {
        console.log(`    ${symbols.cross} ${name.padEnd(20)} ${colors.red(`${issues.length} issue(s)`)}`)
        for (const issue of issues) {
          console.log(`      ${colors.yellow('⚠')} ${issue}`)
        }
        totalIssues += issues.length
      }
    }
  }

  console.log(`\n  ${colors.gray('─'.repeat(40))}`)
  console.log(`  Scanned ${totalServers} server(s) across ${detected.length} client(s)`)
  if (totalIssues === 0) {
    console.log(`  ${symbols.check} ${colors.green('All configs look healthy!')}`)
  } else {
    console.log(`  ${symbols.cross} ${colors.red(`${totalIssues} issue(s) found`)}`)
    console.log(`  ${colors.gray('Fix placeholder env vars with your real API tokens.')}`)
  }
  console.log()
}
