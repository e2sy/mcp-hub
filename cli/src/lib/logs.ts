import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { detectClients } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { colors, symbols, header } from './ui.js'

/**
 * Tails the logs from a running MCP server.
 * Spawns the server process and streams its stderr/stdout to the console.
 *
 * Press Ctrl+C to stop.
 */
export function viewLogs(name: string): void {
  const registry = getBundledRegistry()
  const server = findServer(registry, name)

  if (!server) {
    console.log(`\n  ${symbols.cross} Server "${colors.red(name)}" not found.\n`)
    return
  }

  // Find the server config from any detected client
  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))

  let serverConfig: any = null
  let sourceClient = ''

  for (const client of detected) {
    try {
      const config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
      const mcpServers = config.mcpServers || {}
      if (mcpServers[server.slug]) {
        serverConfig = mcpServers[server.slug]
        sourceClient = client.name
        break
      }
    } catch {
      // skip
    }
  }

  // Fall back to registry config
  if (!serverConfig) {
    try {
      const registryConfig = JSON.parse(server.configJson)
      serverConfig = registryConfig.mcpServers?.[server.slug]
      sourceClient = 'registry (not installed)'
    } catch {
      console.log(`\n  ${symbols.cross} Could not parse config for "${name}"\n`)
      return
    }
  }

  if (!serverConfig) {
    console.log(`\n  ${symbols.cross} No config found for "${name}"\n`)
    return
  }

  const { command, args, env } = serverConfig

  console.log(header(`Logs: ${server.name}`))
  console.log(`  ${colors.gray('Source:')}   ${sourceClient}`)
  console.log(`  ${colors.gray('Command:')}  ${command} ${(args || []).join(' ')}`)
  console.log(`  ${colors.gray('Press Ctrl+C to stop')}\n`)
  console.log(colors.gray('─'.repeat(50)) + '\n')

  // Spawn the server
  const child = spawn(command, args || [], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
  })

  let lineCount = 0
  const startTime = Date.now()

  const formatLine = (prefix: string, data: string) => {
    const timestamp = new Date().toLocaleTimeString('en', { hour12: false })
    const lines = data.toString().split('\n').filter((l) => l.trim())
    for (const line of lines) {
      const ts = colors.gray(`[${timestamp}]`)
      const prefixColored = prefix === 'ERR' ? colors.red(prefix) : colors.cyan(prefix)
      console.log(`${ts} ${prefixColored} ${line}`)
      lineCount++
    }
  }

  child.stdout.on('data', (data) => {
    formatLine('OUT', data)
  })

  child.stderr.on('data', (data) => {
    formatLine('ERR', data)
  })

  child.on('error', (err) => {
    console.log(`\n  ${symbols.cross} ${colors.red('Failed to start server:')}`)
    console.log(`  ${colors.gray(err.message)}\n`)
    if (err.message.includes('ENOENT')) {
      console.log(`  ${colors.gray('The command was not found. Make sure it is installed.')}\n`)
    }
    process.exit(1)
  })

  child.on('exit', (code) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n${colors.gray('─'.repeat(50))}`)
    console.log(`  ${colors.gray(`Server exited with code ${code} after ${duration}s (${lineCount} lines logged)`)}\n`)
  })

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log(`\n${colors.gray('─'.repeat(50))}`)
    console.log(`  ${colors.gray(`Stopping ${server.name}...`)}`)
    child.kill('SIGTERM')
    setTimeout(() => {
      process.exit(0)
    }, 500)
  })

  // Send a ping every 30 seconds to keep the connection alive
  // (some servers close if idle)
  setInterval(() => {
    try {
      child.stdin.write('\n')
    } catch {
      // ignore
    }
  }, 30000)
}
