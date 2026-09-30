import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import * as readline from 'readline'
import { dirname } from 'path'
import { detectClients } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { installServer, removeServer } from './config-writer.js'
import { colors, symbols, header } from './ui.js'

interface Issue {
  client: string
  configPath: string
  server: string
  type: 'placeholder-env' | 'invalid-json' | 'missing-command' | 'missing-args' | 'not-in-registry'
  details: string
  envVar?: string
}

/**
 * Scans all detected clients for issues.
 */
function scanIssues(): Issue[] {
  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))
  const registry = getBundledRegistry()
  const issues: Issue[] = []

  for (const client of detected) {
    let config: any
    try {
      config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
    } catch (e) {
      issues.push({
        client: client.name,
        configPath: client.configPath!,
        server: '(config file)',
        type: 'invalid-json',
        details: e instanceof Error ? e.message : 'Invalid JSON',
      })
      continue
    }

    const servers = config.mcpServers || {}
    for (const [slug, serverConfig] of Object.entries<any>(servers)) {
      // Check if in registry
      if (!findServer(registry, slug)) {
        issues.push({
          client: client.name,
          configPath: client.configPath!,
          server: slug,
          type: 'not-in-registry',
          details: 'Server not found in MCP Hub registry',
        })
      }

      // Check command
      if (!serverConfig.command) {
        issues.push({
          client: client.name,
          configPath: client.configPath!,
          server: slug,
          type: 'missing-command',
          details: 'Missing "command" field',
        })
      }

      // Check args
      if (!serverConfig.args || !Array.isArray(serverConfig.args)) {
        issues.push({
          client: client.name,
          configPath: client.configPath!,
          server: slug,
          type: 'missing-args',
          details: 'Missing or invalid "args" field',
        })
      }

      // Check env vars for placeholders
      const env = serverConfig.env || {}
      for (const [key, value] of Object.entries(env)) {
        const v = String(value)
        if (v === 'YOUR_TOKEN' || v === 'YOUR_API_KEY' || v === 'YOUR_KEY' ||
            v.includes('your-') || v.includes('YOUR_') || v === 'xxx' || v === '') {
          issues.push({
            client: client.name,
            configPath: client.configPath!,
            server: slug,
            type: 'placeholder-env',
            details: `Missing env var: ${key} (placeholder value)`,
            envVar: key,
          })
        }
      }
    }
  }

  return issues
}

/**
 * Prompts the user for input.
 */
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

/**
 * Fixes placeholder env vars by prompting the user for real values.
 */
async function fixPlaceholderEnv(issue: Issue): Promise<boolean> {
  console.log(`\n  ${colors.yellow('⚠')} ${issue.details}`)
  const value = await prompt(`  Enter value for ${colors.bold(issue.envVar!)} (or press Enter to skip): `)

  if (!value) {
    console.log(`  ${colors.gray('Skipped.')}`)
    return false
  }

  // Read config, update env var, write back
  try {
    const config = JSON.parse(readFileSync(issue.configPath, 'utf-8'))
    // Backup
    copyFileSync(issue.configPath, issue.configPath + '.backup')
    // Update
    config.mcpServers[issue.server].env[issue.envVar!] = value
    writeFileSync(issue.configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
    console.log(`  ${symbols.check} ${colors.green('Fixed!')} Saved to ${issue.configPath}`)
    return true
  } catch (e) {
    console.log(`  ${symbols.cross} ${colors.red('Failed to fix:')} ${e instanceof Error ? e.message : 'unknown error'}`)
    return false
  }
}

/**
 * Fixes a broken server by removing and reinstalling from registry.
 */
async function fixBrokenServer(issue: Issue): Promise<boolean> {
  console.log(`\n  ${colors.yellow('⚠')} ${issue.server}: ${issue.details}`)
  const answer = await prompt(`  Remove and reinstall "${issue.server}"? (Y/n): `)

  if (answer.toLowerCase() === 'n') {
    console.log(`  ${colors.gray('Skipped.')}`)
    return false
  }

  const registry = getBundledRegistry()
  const server = findServer(registry, issue.server)

  if (!server) {
    console.log(`  ${symbols.cross} Server not in registry — cannot reinstall.`)
    console.log(`  ${colors.gray('Remove manually: mcp-hub remove ' + issue.server)}`)
    return false
  }

  // Remove + reinstall
  removeServer(issue.server, [issue.client])
  const results = installServer(server, [issue.client])
  const fixed = results.some((r) => r.status === 'installed')

  if (fixed) {
    console.log(`  ${symbols.check} ${colors.green('Reinstalled!')} Restart your AI client.`)
  } else {
    console.log(`  ${symbols.cross} Reinstall failed.`)
  }
  return fixed
}

/**
 * Fixes invalid JSON by offering to restore from backup.
 */
async function fixInvalidJson(issue: Issue): Promise<boolean> {
  console.log(`\n  ${colors.yellow('⚠')} ${issue.client}: ${issue.details}`)

  // Check for backup
  const backupPath = issue.configPath + '.backup'
  if (existsSync(backupPath)) {
    const answer = await prompt(`  Restore from backup? (Y/n): `)
    if (answer.toLowerCase() !== 'n') {
      try {
        copyFileSync(backupPath, issue.configPath)
        console.log(`  ${symbols.check} ${colors.green('Restored!')} Restart your AI client.`)
        return true
      } catch (e) {
        console.log(`  ${symbols.cross} Restore failed: ${e instanceof Error ? e.message : 'unknown'}`)
        return false
      }
    }
  }

  console.log(`  ${colors.gray('No backup available. Fix the JSON manually:')}`)
  console.log(`  ${colors.cyan(`mcp-hub config edit ${issue.client.toLowerCase().split(' ')[0]}`)}`)
  return false
}

/**
 * Runs the doctor with interactive fix mode.
 */
export async function runDoctorFix(): Promise<void> {
  console.log(header('MCP Hub Doctor — interactive fix mode'))

  const issues = scanIssues()

  if (issues.length === 0) {
    console.log(`  ${symbols.check} ${colors.green('No issues found!')} All configs look healthy.\n`)
    return
  }

  console.log(`  Found ${colors.bold(String(issues.length))} issue(s). Let's fix them.\n`)

  let fixed = 0
  let skipped = 0

  for (const issue of issues) {
    console.log(`\n  ${colors.gray('─'.repeat(46))}`)
    console.log(`  ${colors.bold(issue.client)} → ${colors.bold(issue.server)}`)

    let wasFixed = false
    switch (issue.type) {
      case 'placeholder-env':
        wasFixed = await fixPlaceholderEnv(issue)
        break
      case 'missing-command':
      case 'missing-args':
      case 'not-in-registry':
        wasFixed = await fixBrokenServer(issue)
        break
      case 'invalid-json':
        wasFixed = await fixInvalidJson(issue)
        break
    }

    if (wasFixed) fixed++
    else skipped++
  }

  console.log(`\n  ${colors.gray('═'.repeat(46))}`)
  console.log(`  ${symbols.check} ${colors.green('Done!')} Fixed ${fixed}, skipped ${skipped}`)
  if (fixed > 0) {
    console.log(`  ${colors.gray('Restart your AI clients to apply changes.')}`)
  }
  console.log()
}
