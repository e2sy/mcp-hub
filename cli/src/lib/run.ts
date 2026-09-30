import { spawn, ChildProcess } from 'child_process'
import * as readline from 'readline'
import { existsSync, readFileSync } from 'fs'
import { detectClients } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { colors, symbols, header } from './ui.js'

/**
 * Interactive REPL for calling MCP server tools directly from the terminal.
 * Spawns the server, connects via stdio, and lets you call tools interactively.
 *
 * Usage: mcp-hub run github
 *
 * Commands in the REPL:
 *   tools              — list available tools
 *   <tool> [--args]    — call a tool
 *   help               — show this help
 *   exit / quit        — exit the REPL
 */
export function runServer(name: string): void {
  const registry = getBundledRegistry()
  const server = findServer(registry, name)

  if (!server) {
    console.log(`\n  ${symbols.cross} Server "${colors.red(name)}" not found.\n`)
    return
  }

  // Find config from any detected client
  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))
  let serverConfig: any = null
  let sourceClient = ''

  for (const client of detected) {
    try {
      const config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
      if (config.mcpServers?.[server.slug]) {
        serverConfig = config.mcpServers[server.slug]
        sourceClient = client.name
        break
      }
    } catch {
      // skip
    }
  }

  if (!serverConfig) {
    // Use registry config
    try {
      const registryConfig = JSON.parse(server.configJson)
      serverConfig = registryConfig.mcpServers?.[server.slug]
      sourceClient = 'registry (not installed)'
    } catch {
      console.log(`\n  ${symbols.cross} Could not find config for "${name}"\n`)
      return
    }
  }

  const { command, args, env } = serverConfig

  console.log(header(`Running ${server.name}`))
  console.log(`  ${colors.gray('Source:')}   ${sourceClient}`)
  console.log(`  ${colors.gray('Command:')}  ${command} ${(args || []).join(' ')}`)
  console.log(`  ${colors.gray('Type')} help ${colors.gray('for commands,')} exit ${colors.gray('to quit')}\n`)

  // Spawn the server
  const child = spawn(command, args || [], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ...env },
  })

  let requestId = 0
  let initialized = false
  let toolsList: { name: string; description?: string }[] = []
  let responseBuffer = ''
  const pendingRequests = new Map<number, (response: any) => void>()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.cyan('>')} `,
  })

  // Handle server output
  child.stdout.on('data', (data) => {
    responseBuffer += data.toString()
    // Try to parse JSON-RPC responses (one per line)
    const lines = responseBuffer.split('\n')
    responseBuffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim().startsWith('{')) continue
      try {
        const parsed = JSON.parse(line)
        if (parsed.id && pendingRequests.has(parsed.id)) {
          const resolve = pendingRequests.get(parsed.id)!
          pendingRequests.delete(parsed.id)
          resolve(parsed)
        }
      } catch {
        // not valid JSON
      }
    }
  })

  child.stderr.on('data', (data) => {
    const text = data.toString().trim()
    if (text) {
      console.log(`  ${colors.gray('[server]')} ${text}`)
    }
  })

  child.on('error', (err) => {
    console.log(`\n  ${symbols.cross} ${colors.red('Failed to start server:')} ${err.message}\n`)
    process.exit(1)
  })

  child.on('exit', (code) => {
    console.log(`\n  ${colors.gray(`Server exited with code ${code}`)}\n`)
    process.exit(0)
  })

  // Send JSON-RPC request helper
  function sendRequest(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++requestId
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      }
      pendingRequests.set(id, resolve)
      child.stdin.write(JSON.stringify(request) + '\n')

      // Timeout after 10 seconds
      setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id)
          reject(new Error('Request timed out'))
        }
      }, 10000)
    })
  }

  // Initialize connection
  async function initialize() {
    try {
      const response = await sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'mcp-hub-run', version: '1.0.0' },
      })

      if (response.result?.serverInfo) {
        console.log(`  ${symbols.check} ${colors.green('Connected!')} Server: ${response.result.serverInfo.name} v${response.result.serverInfo.version}`)
      }

      // Send initialized notification
      child.stdin.write(JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
        params: {},
      }) + '\n')

      // Fetch tools list
      const toolsResponse = await sendRequest('tools/list', {})
      toolsList = (toolsResponse.result?.tools || []).map((t: any) => ({
        name: t.name,
        description: t.description,
      }))

      console.log(`  ${symbols.check} ${toolsList.length} tool(s) available\n`)
      initialized = true
      rl.prompt()
    } catch (e) {
      console.log(`\n  ${symbols.cross} ${colors.red('Failed to initialize:')} ${e instanceof Error ? e.message : 'unknown'}\n`)
      process.exit(1)
    }
  }

  // Parse and execute user input
  async function handleInput(input: string) {
    const trimmed = input.trim()
    if (!trimmed) {
      rl.prompt()
      return
    }

    const [cmd, ...rest] = trimmed.split(/\s+/)

    if (cmd === 'exit' || cmd === 'quit') {
      console.log(`\n  ${colors.gray('Goodbye!')}\n`)
      child.kill()
      process.exit(0)
    }

    if (cmd === 'help') {
      console.log(`\n  ${colors.bold('Commands:')}`)
      console.log(`    ${colors.cyan('tools')}              — list available tools`)
      console.log(`    ${colors.cyan('<tool>')} <args>       — call a tool`)
      console.log(`    ${colors.cyan('help')}               — show this help`)
      console.log(`    ${colors.cyan('exit')}               — quit the REPL`)
      console.log(`\n  ${colors.gray('Tool args format: --key=value')}`)
      console.log(`  ${colors.gray('Example: list_repositories --user=e2sy')}\n`)
      rl.prompt()
      return
    }

    if (cmd === 'tools') {
      console.log(`\n  ${colors.bold(`Available tools (${toolsList.length}):`)}`)
      for (const tool of toolsList) {
        console.log(`    ${symbols.bullet} ${colors.cyan(tool.name)}`)
        if (tool.description) {
          console.log(`      ${colors.gray(tool.description.slice(0, 80))}`)
        }
      }
      console.log()
      rl.prompt()
      return
    }

    // Try to call a tool
    const tool = toolsList.find((t) => t.name === cmd)
    if (!tool) {
      console.log(`  ${symbols.cross} Unknown command/tool: "${colors.red(cmd)}"`)
      console.log(`  ${colors.gray('Type')} tools ${colors.gray('to see available tools, or')} help`)
      rl.prompt()
      return
    }

    // Parse args: --key=value
    const toolArgs: Record<string, string> = {}
    for (const arg of rest) {
      if (arg.startsWith('--')) {
        const [key, ...valueParts] = arg.slice(2).split('=')
        toolArgs[key] = valueParts.join('=')
      }
    }

    console.log(`  ${colors.gray(`Calling ${cmd}...`)}`)

    try {
      const response = await sendRequest('tools/call', {
        name: cmd,
        arguments: toolArgs,
      })

      if (response.error) {
        console.log(`  ${symbols.cross} ${colors.red('Error:')} ${response.error.message}`)
      } else if (response.result?.content) {
        for (const item of response.result.content) {
          if (item.type === 'text') {
            console.log(`\n${colors.green('✓ Result:')}`)
            console.log(item.text)
          } else {
            console.log(`\n${colors.green('✓ Result:')} ${JSON.stringify(item, null, 2)}`)
          }
        }
      } else {
        console.log(`  ${symbols.check} ${colors.green('Done (no output)')}`)
      }
    } catch (e) {
      console.log(`  ${symbols.cross} ${colors.red('Failed:')} ${e instanceof Error ? e.message : 'timeout'}`)
    }

    console.log()
    rl.prompt()
  }

  rl.on('line', handleInput)
  rl.on('SIGINT', () => {
    console.log(`\n  ${colors.gray('Goodbye!')}\n`)
    child.kill()
    process.exit(0)
  })

  // Start initialization
  initialize()
}
