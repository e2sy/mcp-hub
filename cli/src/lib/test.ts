import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { detectClients } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { colors, symbols, header } from './ui.js'

/**
 * Tests if an MCP server can actually start and respond.
 * Spawns the server process, sends an initialize request, and waits for a response.
 */
export function testServer(name: string): void {
  const registry = getBundledRegistry()
  const server = findServer(registry, name)

  if (!server) {
    console.log(`  ${symbols.cross} Server "${colors.red(name)}" not found in registry.\n`)
    return
  }

  console.log(header(`Testing ${server.name}`))
  console.log(`  ${colors.gray('Author:')}     ${server.author}`)
  console.log(`  ${colors.gray('Install:')}   ${server.installCmd}\n`)

  // Parse the config to get command + args
  let config: any
  try {
    config = JSON.parse(server.configJson)
    const serverConfig = config.mcpServers?.[server.slug]
    if (!serverConfig) {
      console.log(`  ${symbols.cross} Could not parse server config\n`)
      return
    }

    const { command, args, env } = serverConfig

    // Check for placeholder env vars
    const envVars = env || {}
    const placeholders = Object.entries(envVars).filter(([, v]) =>
      String(v).includes('YOUR_') || String(v).includes('your-') || String(v) === ''
    )

    if (placeholders.length > 0) {
      console.log(`  ${symbols.cross} ${colors.red('Cannot test — placeholder env vars found:')}`)
      for (const [key] of placeholders) {
        console.log(`    ${colors.yellow('⚠')} ${key}`)
      }
      console.log(`\n  ${colors.gray('Set real values in your config first, or test with --skip-env-check')}\n`)
      return
    }

    console.log(`  ${colors.gray('Starting server process...')}`)
    console.log(`  ${colors.gray('Command:')} ${command} ${(args || []).join(' ')}\n`)

    // Spawn the server
    const child = spawn(command, args || [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...envVars },
    })

    let stdout = ''
    let stderr = ''
    let initialized = false

    const timeout = setTimeout(() => {
      if (!initialized) {
        console.log(`\n  ${symbols.cross} ${colors.red('TIMEOUT — server did not respond in 10 seconds')}`)
        if (stderr) {
          console.log(`\n  ${colors.gray('stderr:')}\n  ${colors.gray(stderr.slice(0, 500))}`)
        }
        child.kill()
        process.exit(1)
      }
    }, 10000)

    child.stdout.on('data', (data) => {
      stdout += data.toString()
      // Check for initialize response
      if (stdout.includes('"result"') && stdout.includes('"serverInfo"')) {
        initialized = true
        clearTimeout(timeout)
        console.log(`  ${symbols.check} ${colors.green('Server responded to initialize request!')}`)

        // Try to extract server info
        try {
          const lines = stdout.split('\n').filter((l) => l.trim().startsWith('{'))
          for (const line of lines) {
            const parsed = JSON.parse(line)
            if (parsed.result?.serverInfo) {
              console.log(`  ${colors.gray('Server name:')}    ${parsed.result.serverInfo.name}`)
              console.log(`  ${colors.gray('Server version:')} ${parsed.result.serverInfo.version}`)
              break
            }
          }
        } catch {
          // ignore parse errors
        }

        console.log(`\n  ${symbols.check} ${colors.green('Test passed!')} The server is working correctly.\n`)
        child.kill()
        process.exit(0)
      }
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('error', (err) => {
      clearTimeout(timeout)
      console.log(`\n  ${symbols.cross} ${colors.red('Failed to start server:')}`)
      console.log(`  ${colors.gray(err.message)}\n`)
      if (err.message.includes('ENOENT')) {
        console.log(`  ${colors.gray('The command was not found. Make sure it is installed.')}\n`)
      }
      process.exit(1)
    })

    child.on('exit', (code) => {
      clearTimeout(timeout)
      if (!initialized && code !== 0) {
        console.log(`\n  ${symbols.cross} ${colors.red(`Server exited with code ${code}`)}`)
        if (stderr) {
          console.log(`\n  ${colors.gray('stderr:')}\n  ${colors.gray(stderr.slice(0, 500))}\n`)
        }
        process.exit(1)
      }
    })

    // Send initialize request
    const initRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'mcp-hub-doctor', version: '1.0.0' },
      },
    }

    setTimeout(() => {
      child.stdin.write(JSON.stringify(initRequest) + '\n')
    }, 500)
  } catch (e) {
    console.log(`  ${symbols.cross} Failed to parse config: ${e instanceof Error ? e.message : 'unknown'}\n`)
  }
}
