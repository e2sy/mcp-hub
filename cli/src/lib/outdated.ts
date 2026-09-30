import { existsSync, readFileSync } from 'fs'
import { spawn, spawnSync } from 'child_process'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { detectClients } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { colors, symbols, header, printTable } from './ui.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PACKAGE_JSON_URL = 'https://registry.npmjs.org/mcp-hub/latest'

function getCurrentVersion(): string {
  try {
    const pkgPath = join(__dirname, '..', 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      return pkg.version || '1.4.0'
    }
  } catch {
    // ignore
  }
  return '1.4.0'
}

interface OutdatedEntry {
  name: string
  current: string
  latest: string
  type: 'cli' | 'server'
}

/**
 * Checks if the mcp-hub CLI itself has an update available.
 */
async function checkCliVersion(): Promise<OutdatedEntry | null> {
  const current = getCurrentVersion()

  try {
    const res = await fetch(PACKAGE_JSON_URL, {
      headers: { 'User-Agent': 'mcp-hub' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { version?: string }
    const latest = data.version
    if (latest && latest !== current) {
      return { name: 'mcp-hub (CLI)', current, latest, type: 'cli' }
    }
  } catch {
    // offline or timeout
  }
  return null
}

/**
 * Checks each installed server's npm package for a newer version.
 */
function checkServerVersions(): OutdatedEntry[] {
  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))
  const registry = getBundledRegistry()
  const outdated: OutdatedEntry[] = []
  const checked = new Set<string>()

  for (const client of detected) {
    try {
      const config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
      const servers = config.mcpServers || {}

      for (const [slug, serverConfig] of Object.entries<any>(servers)) {
        if (checked.has(slug)) continue
        checked.add(slug)

        // Extract package name from args
        const args: string[] = serverConfig.args || []
        const yIdx = args.indexOf('-y')
        const pkgName = yIdx !== -1 ? args[yIdx + 1] : args.find((a) => !a.startsWith('-') && !a.startsWith('http'))

        if (!pkgName || serverConfig.command !== 'npx') continue

        // Get installed version (from npm cache — this is best-effort)
        const result = spawnSync('npm', ['list', '-g', pkgName, '--depth=0', '--json'], {
          stdio: 'pipe',
          timeout: 5000,
          shell: true,
        })

        // Get latest version from npm
        const latestResult = spawnSync('npm', ['view', pkgName, 'version'], {
          stdio: 'pipe',
          timeout: 10000,
          shell: true,
        })

        if (latestResult.status !== 0) continue
        const latest = latestResult.stdout.toString().trim()

        // Try to get current version
        let current = 'unknown'
        try {
          const listData = JSON.parse(result.stdout.toString())
          const deps = listData.dependencies || {}
          if (deps[pkgName]) {
            current = deps[pkgName].version || 'unknown'
          }
        } catch {
          // not installed globally, version unknown
        }

        if (current !== 'unknown' && current !== latest) {
          outdated.push({
            name: `${slug} (${pkgName})`,
            current,
            latest,
            type: 'server',
          })
        } else if (current === 'unknown') {
          // Check if registry has a different install command
          const registryServer = findServer(registry, slug)
          if (registryServer && registryServer.installCmd !== `npx -y ${pkgName}`) {
            outdated.push({
              name: `${slug}`,
              current: 'registry change',
              latest: 'updated config',
              type: 'server',
            })
          }
        }
      }
    } catch {
      // skip invalid configs
    }
  }

  return outdated
}

/**
 * Main outdated command — shows what's out of date.
 */
export async function showOutdated(): Promise<void> {
  console.log(header('Checking for updates'))

  const [cliOutdated, serverOutdated] = await Promise.all([
    checkCliVersion(),
    Promise.resolve(checkServerVersions()),
  ])

  const all = [...(cliOutdated ? [cliOutdated] : []), ...serverOutdated]

  if (all.length === 0) {
    console.log(`  ${symbols.check} ${colors.green('Everything is up to date!')}\n`)
    return
  }

  console.log(`  ${colors.bold(`${all.length} update(s) available`)}\n`)

  const rows = all.map((e) => [
    e.name,
    colors.gray(e.current),
    colors.green(e.latest),
    colors.gray(e.type),
  ])
  printTable(rows, { headers: ['Package', 'Current', 'Latest', 'Type'] })

  console.log(`\n  ${colors.gray('Update with:')}`)
  if (cliOutdated) {
    console.log(`  ${colors.cyan('npm install -g mcp-hub@latest')}`)
  }
  if (serverOutdated.length > 0) {
    console.log(`  ${colors.cyan('mcp-hub update --all')}  ${colors.gray('# refresh server configs')}`)
  }
  console.log()
}

/**
 * Upgrades the mcp-hub CLI to the latest version.
 */
export function upgradeCli(): void {
  console.log(header('Upgrading mcp-hub CLI'))
  console.log(`  ${colors.gray('Running:')} npm install -g mcp-hub@latest\n`)

  const result = spawnSync('npm', ['install', '-g', 'mcp-hub@latest'], {
    stdio: 'inherit',
    shell: true,
  })

  if (result.status === 0) {
    console.log(`\n  ${symbols.check} ${colors.green('Upgraded mcp-hub to the latest version!')}`)
    console.log(`  ${colors.gray('Run `mcp-hub --version` to verify.')}\n`)
  } else {
    console.log(`\n  ${symbols.cross} ${colors.red('Upgrade failed.')}`)
    console.log(`  ${colors.gray('Try manually: npm install -g mcp-hub@latest')}\n`)
    process.exit(1)
  }
}

/**
 * Upgrades everything — CLI + refreshes all server configs.
 */
export async function upgradeAll(): Promise<void> {
  // First upgrade the CLI
  upgradeCli()

  // Then refresh all server configs
  console.log(header('Refreshing server configs'))
  const { updateAll } = await import('./update.js')
  updateAll()
}
