import { spawn } from 'child_process'
import { getBundledRegistry, findServer } from './registry.js'
import { colors, symbols, header } from './ui.js'

/**
 * Verifies a server by running mcp-hub test and optionally reporting to the hub.
 * Used by:
 * 1. Server authors locally — mcp-hub verify <name>
 * 2. GitHub Action — mcp-hub test <name> --ci (which calls this under the hood)
 */
export async function verifyServer(name: string, options: { ci?: boolean; report?: boolean }): Promise<void> {
  const registry = getBundledRegistry()
  const server = findServer(registry, name)

  if (!server) {
    console.log(`\n  ${symbols.cross} Server "${colors.red(name)}" not found in registry.\n`)
    return
  }

  console.log(header(`Verifying ${server.name}`))
  console.log(`  ${colors.gray('Author:')}     ${server.author}`)
  console.log(`  ${colors.gray('Repo:')}       ${server.repoUrl}`)
  console.log(`  ${colors.gray('Install:')}   ${server.installCmd}\n`)

  // Step 1: Parse config
  let config: any
  try {
    config = JSON.parse(server.configJson)
    const serverConfig = config.mcpServers?.[server.slug]
    if (!serverConfig) {
      console.log(`  ${symbols.cross} Could not parse server config\n`)
      if (options.ci) process.exit(1)
      return
    }
  } catch {
    console.log(`  ${symbols.cross} Invalid config JSON\n`)
    if (options.ci) process.exit(1)
    return
  }

  const serverConfig = config.mcpServers[server.slug]
  const { command, args, env } = serverConfig

  // Step 2: Check for placeholder env vars
  const envVars = env || {}
  const placeholders = Object.entries(envVars).filter(([, v]) =>
    String(v).includes('YOUR_') || String(v).includes('your-') || String(v) === ''
  )

  if (placeholders.length > 0 && !options.ci) {
    console.log(`  ${symbols.cross} ${colors.red('Cannot verify — placeholder env vars:')}`)
    for (const [key] of placeholders) {
      console.log(`    ${colors.yellow('⚠')} ${key}`)
    }
    console.log(`\n  ${colors.gray('Set real values or use --ci to skip env check')}\n`)
    return
  }

  // Step 3: Spawn and test
  console.log(`  ${colors.gray('Starting verification...')}\n`)

  const child = spawn(command, args || [], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...envVars },
  })

  let stdout = ''
  let stderr = ''
  let initialized = false
  let toolsList: string[] = []

  const timeout = setTimeout(() => {
    if (!initialized) {
      console.log(`\n  ${symbols.cross} ${colors.red('FAILED — server did not respond in 15 seconds')}`)
      if (stderr) {
        console.log(`\n  ${colors.gray('stderr:')}\n  ${colors.gray(stderr.slice(0, 500))}`)
      }
      child.kill()
      reportResult(false, 'Timeout: server did not respond in 15s')
      if (options.ci) process.exit(1)
    }
  }, 15000)

  child.stdout.on('data', (data) => {
    stdout += data.toString()
    // Check for initialize response
    if (stdout.includes('"result"') && stdout.includes('"serverInfo"')) {
      initialized = true
      clearTimeout(timeout)

      // Try to extract tools list
      try {
        const lines = stdout.split('\n').filter((l) => l.trim().startsWith('{'))
        for (const line of lines) {
          const parsed = JSON.parse(line)
          if (parsed.result?.serverInfo) {
            console.log(`  ${symbols.check} Server name:    ${parsed.result.serverInfo.name}`)
            console.log(`  ${symbols.check} Server version: ${parsed.result.serverInfo.version}`)
          }
        }
      } catch {
        // ignore
      }

      // Request tools/list
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }

      setTimeout(() => {
        child.stdin.write(JSON.stringify(toolsRequest) + '\n')
      }, 300)
    }

    // Check for tools list response
    if (stdout.includes('"tools"') && stdout.includes('"name"')) {
      try {
        const lines = stdout.split('\n').filter((l) => l.trim().startsWith('{'))
        for (const line of lines) {
          const parsed = JSON.parse(line)
          if (parsed.result?.tools && Array.isArray(parsed.result.tools)) {
            toolsList = parsed.result.tools.map((t: any) => t.name)
            break
          }
        }
      } catch {
        // ignore
      }
    }
  })

  child.stderr.on('data', (data) => {
    stderr += data.toString()
  })

  child.on('error', (err) => {
    clearTimeout(timeout)
    console.log(`\n  ${symbols.cross} ${colors.red('Failed to start server:')}`)
    console.log(`  ${colors.gray(err.message)}\n`)
    reportResult(false, err.message)
    if (options.ci) process.exit(1)
  })

  child.on('exit', (code) => {
    clearTimeout(timeout)
    if (initialized) {
      console.log(`\n  ${symbols.check} ${colors.green('VERIFICATION PASSED')}`)
      if (toolsList.length > 0) {
        console.log(`\n  ${colors.bold('Tools available')} (${toolsList.length}):`)
        for (const tool of toolsList.slice(0, 20)) {
          console.log(`    ${symbols.bullet} ${tool}`)
        }
        if (toolsList.length > 20) {
          console.log(`    ${colors.gray(`... and ${toolsList.length - 20} more`)}`)
        }
      }
      console.log(`\n  ${colors.gray('Verification result: PASSED')}`)
      reportResult(true, `Verified with ${toolsList.length} tools`)
    } else {
      console.log(`\n  ${symbols.cross} ${colors.red('VERIFICATION FAILED')}`)
      if (stderr) {
        console.log(`\n  ${colors.gray('stderr:')}\n  ${colors.gray(stderr.slice(0, 500))}`)
      }
      reportResult(false, `Server exited with code ${code}`)
      if (options.ci) process.exit(1)
    }
    console.log()
  })

  // Send initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'mcp-hub-verify', version: '1.0.0' },
    },
  }

  setTimeout(() => {
    child.stdin.write(JSON.stringify(initRequest) + '\n')
  }, 500)

  async function reportResult(passed: boolean, details: string) {
    if (!options.report && !options.ci) return

    const status = passed ? 'passed' : 'failed'
    console.log(`\n  ${colors.gray('Reporting to MCP Hub...')}`)

    try {
      const res = await fetch('https://mcp-hub.vercel.app/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MCP_HUB_TOKEN || 'local'}`,
        },
        body: JSON.stringify({
          serverSlug: server!.slug,
          repoUrl: server!.repoUrl,
          status,
          details,
          commitSha: process.env.GITHUB_SHA || 'local',
          branch: process.env.GITHUB_REF_NAME || 'local',
          runUrl: process.env.GITHUB_SERVER_URL || 'local',
        }),
        signal: AbortSignal.timeout(5000),
      })

      if (res.ok) {
        console.log(`  ${symbols.check} ${colors.gray('Reported to MCP Hub')}`)
      } else {
        console.log(`  ${colors.gray('Could not report (non-200 response)')}`)
      }
    } catch {
      console.log(`  ${colors.gray('Could not report (offline or no token)')}`)
    }
  }
}
