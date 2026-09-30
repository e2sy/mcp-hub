import { Command } from 'commander'
import { getBundledRegistry, fetchRemoteRegistry, findServer, searchServers } from './lib/registry.js'
import { detectClients, SUPPORTED_CLIENTS, getClientPaths } from './lib/clients.js'
import { installServer, removeServer, listInstalled } from './lib/config-writer.js'
import { createBackup, listBackups, deleteBackup, restoreBackup } from './lib/backup.js'
import { exportBundle, importBundle } from './lib/bundle.js'
import { initServer } from './lib/init.js'
import { runDoctor } from './lib/doctor.js'
import { logAction } from './lib/history.js'
import { colors, symbols, header, formatStars, printTable } from './lib/ui.js'
import { existsSync } from 'fs'
import { spawnSync } from 'child_process'
import type { Registry } from './types.js'

const program = new Command()

const BANNER = `${colors.cyan('╔══════════════════════════════════════════╗')}
${colors.cyan('║')}   ${colors.bold('MCP Hub')} ${colors.gray('—')} ${colors.dim('install any MCP server')}     ${colors.cyan('║')}
${colors.cyan('║')}   ${colors.gray('The homebrew for MCP servers')}            ${colors.cyan('║')}
${colors.cyan('╚══════════════════════════════════════════╝')}`

function getRegistry(options: { online?: boolean }): Registry {
  if (options.online) {
    // For online mode, we'd need async — but commander actions are sync by default
    // We handle this in each command with async handlers
    return getBundledRegistry()
  }
  return getBundledRegistry()
}

// ─── install ──────────────────────────────────────────────
program
  .name('mcp-hub')
  .description('The homebrew for MCP servers — install any MCP server in one command.')
  .version('1.4.0')
  .action(() => {
    console.log(BANNER)
    console.log(`\n${colors.bold('Quick start:')}`)
    console.log(`  ${colors.cyan('mcp-hub list')}              ${colors.gray('# browse all servers')}`)
    console.log(`  ${colors.cyan('mcp-hub install github')}    ${colors.gray('# install a server')}`)
    console.log(`  ${colors.cyan('mcp-hub search "postgres"')} ${colors.gray('# search the directory')}`)
    console.log(`  ${colors.cyan('mcp-hub doctor')}            ${colors.gray('# diagnose config issues')}`)
    console.log(`  ${colors.cyan('mcp-hub backup')}            ${colors.gray('# back up your configs')}`)
    console.log(`\n${colors.gray('Full docs:')} https://github.com/e2sy/mcp-hub`)
    console.log(`${colors.gray('Run with')} --help ${colors.gray('on any command for options.')}\n`)
  })

// ─── install ──────────────────────────────────────────────
program
  .command('install [name]')
  .description('Install an MCP server — interactive fuzzy finder if no name given')
  .option('-c, --client <client>', 'install only to a specific client (claude, cursor, cline, windsurf)')
  .option('--all-clients', 'install to all known clients, even if not detected')
  .action(async (name?: string, options?: { client?: string; allClients?: boolean }) => {
    // If no name, launch interactive fuzzy finder
    if (!name) {
      console.log(BANNER)
      const { interactiveInstall } = await import('./lib/interactive.js')
      interactiveInstall()
      return
    }

    console.log(BANNER)

    const registry = getBundledRegistry()
    const server = findServer(registry, name)

    if (!server) {
      console.log(`\n${symbols.cross} Server "${colors.red(name)}" not found.`)
      console.log(`\n${colors.gray('Try:')} mcp-hub search "${name}"`)
      console.log(`${colors.gray('Or:')} mcp-hub list\n`)
      process.exit(1)
    }

    console.log(header(`Installing ${server.name}`))
    console.log(`  ${colors.gray('Author:')}     ${server.author}`)
    console.log(`  ${colors.gray('Category:')}   ${server.category}`)
    console.log(`  ${colors.gray('Stars:')}      ${symbols.star} ${formatStars(server.stars)}`)
    console.log(`  ${colors.gray('Description:')} ${server.description}\n`)

    // Detect clients
    let detected = detectClients()
    if (options?.allClients) {
      // Force all clients
      const { getClientPaths } = await import('./lib/clients.js')
      const paths = getClientPaths()
      detected = SUPPORTED_CLIENTS.map((name) => ({
        name,
        detected: true,
        configPath: paths[name],
      }))
    }

    const installedClients = detected.filter((c) => c.detected)
    if (installedClients.length === 0) {
      console.log(`${symbols.cross} ${colors.yellow('No AI clients detected.')}`)
      console.log(`\n${colors.gray('Supported clients:')}`)
      SUPPORTED_CLIENTS.forEach((c) => console.log(`  ${symbols.bullet} ${c}`))
      console.log(`\n${colors.gray('Install one of these clients, or use --all-clients to write config anyway.')}\n`)
      process.exit(1)
    }

    // Filter by --client if specified
    let clientFilter: string[] | undefined
    if (options?.client) {
      const cl = options.client.toLowerCase()
      const match = SUPPORTED_CLIENTS.find((c) => c.toLowerCase().includes(cl))
      if (!match) {
        console.log(`${symbols.cross} Unknown client "${options.client}"`)
        console.log(`${colors.gray('Supported:')} ${SUPPORTED_CLIENTS.join(', ')}\n`)
        process.exit(1)
      }
      clientFilter = [match]
    }

    const results = installServer(server, clientFilter)

    console.log(header('Results'))
    for (const r of results) {
      const icon = r.status === 'installed' ? symbols.check : r.status === 'already-exists' ? symbols.arrow : r.status === 'error' ? symbols.cross : colors.gray('○')
      console.log(`  ${icon} ${colors.bold(r.client)}: ${r.message}`)
      if (r.configPath) {
        console.log(`    ${colors.gray(r.configPath)}`)
      }
    }

    const successCount = results.filter((r) => r.status === 'installed').length
    if (successCount > 0) {
      console.log(`\n${symbols.check} ${colors.green('Done!')} Restart your AI client to activate the new server.\n`)
      logAction('install', server.slug, `→ ${successCount} client(s)`)
    }
  })

// ─── list ─────────────────────────────────────────────────
program
  .command('list')
  .description('List all available MCP servers — use --interactive for fuzzy finder')
  .option('-c, --category <category>', 'filter by category')
  .option('--featured', 'show only featured servers')
  .option('--interactive', 'interactive fuzzy finder mode')
  .action(async (options: { category?: string; featured?: boolean; interactive?: boolean }) => {
    if (options.interactive) {
      console.log(BANNER)
      const { interactiveBrowse } = await import('./lib/interactive.js')
      interactiveBrowse()
      return
    }

    const registry = getBundledRegistry()
    let servers = registry.servers

    if (options.category) {
      servers = servers.filter((s) => s.category === options.category)
    }
    if (options.featured) {
      servers = servers.filter((s) => s.featured)
    }

    console.log(BANNER)
    console.log(header(`${servers.length} MCP servers`))

    if (servers.length === 0) {
      console.log(`  ${colors.gray('No servers found. Try removing filters.')}\n`)
      return
    }

    const rows = servers.map((s) => [
      s.featured ? `${symbols.star} ${s.name}` : `  ${s.name}`,
      s.category,
      formatStars(s.stars),
      s.description.length > 50 ? s.description.slice(0, 49) + '…' : s.description,
    ])

    printTable(rows, { headers: ['Name', 'Category', 'Stars', 'Description'] })
    console.log(`\n${colors.gray('Install with:')} mcp-hub install <name>\n`)
  })

// ─── search ───────────────────────────────────────────────
program
  .command('search <query>')
  .description('Search MCP servers by name, tag, or description')
  .action((query: string) => {
    const registry = getBundledRegistry()
    const results = searchServers(registry, query)

    console.log(BANNER)
    console.log(header(`Search: "${query}" → ${results.length} results`))

    if (results.length === 0) {
      console.log(`  ${colors.gray('No servers found. Try a different query.')}`)
      console.log(`  ${colors.gray('Browse all:')} mcp-hub list\n`)
      return
    }

    const rows = results.map((s) => [
      s.name,
      s.category,
      formatStars(s.stars),
      s.description.length > 50 ? s.description.slice(0, 49) + '…' : s.description,
    ])

    printTable(rows, { headers: ['Name', 'Category', 'Stars', 'Description'] })
    console.log(`\n${colors.gray('Install with:')} mcp-hub install <name>\n`)
  })

// ─── info ─────────────────────────────────────────────────
program
  .command('info <name>')
  .description('Show detailed information about an MCP server')
  .action((name: string) => {
    const registry = getBundledRegistry()
    const server = findServer(registry, name)

    if (!server) {
      console.log(`\n${symbols.cross} Server "${colors.red(name)}" not found.\n`)
      process.exit(1)
    }

    console.log(BANNER)
    console.log(header(server.name))
    console.log(`  ${colors.gray('Author:')}     ${server.author}`)
    console.log(`  ${colors.gray('Category:')}   ${server.category}`)
    console.log(`  ${colors.gray('Stars:')}      ${symbols.star} ${formatStars(server.stars)}`)
    console.log(`  ${colors.gray('Tags:')}       ${server.tags.join(', ')}`)
    console.log(`  ${colors.gray('Repo:')}       ${server.repoUrl}`)
    if (server.homepage) {
      console.log(`  ${colors.gray('Homepage:')}   ${server.homepage}`)
    }
    if (server.featured) console.log(`  ${colors.gray('Featured:')}   ${symbols.check} Yes`)
    if (server.verified) console.log(`  ${colors.gray('Verified:')}    ${symbols.check} Yes`)
    console.log(`\n  ${colors.bold('Description:')}`)
    console.log(`  ${server.longDescription || server.description}\n`)
    console.log(`  ${colors.bold('Install command:')}`)
    console.log(`  ${colors.cyan(server.installCmd)}\n`)
    console.log(`  ${colors.bold('Config JSON:')}`)
    console.log(colors.gray(server.configJson))
    console.log(`\n${colors.gray('Install with:')} mcp-hub install ${server.slug}\n`)
  })

// ─── remove ───────────────────────────────────────────────
program
  .command('remove <name>')
  .description('Remove an MCP server from your AI client(s)')
  .option('-c, --client <client>', 'remove from a specific client only')
  .action((name: string, options: { client?: string }) => {
    console.log(BANNER)
    console.log(header(`Removing ${name}`))

    let clientFilter: string[] | undefined
    if (options.client) {
      const cl = options.client.toLowerCase()
      const match = SUPPORTED_CLIENTS.find((c) => c.toLowerCase().includes(cl))
      if (!match) {
        console.log(`${symbols.cross} Unknown client "${options.client}"\n`)
        process.exit(1)
      }
      clientFilter = [match]
    }

    const results = removeServer(name, clientFilter)
    if (results.length === 0) {
      console.log(`  ${colors.gray('No AI clients detected with this server installed.')}\n`)
      return
    }

    for (const r of results) {
      const icon = r.status === 'installed' ? symbols.check : symbols.cross
      console.log(`  ${icon} ${colors.bold(r.client)}: ${r.message}`)
    }
    console.log(`\n${symbols.check} ${colors.green('Done!')} Restart your AI client.\n`)
    logAction('remove', name, results.map((r) => r.client).join(', '))
  })

// ─── clients ──────────────────────────────────────────────
program
  .command('clients')
  .description('Show detected AI clients and their config paths')
  .action(() => {
    console.log(BANNER)
    console.log(header('Detected AI clients'))

    const detected = detectClients()
    for (const c of detected) {
      const icon = c.detected ? symbols.check : symbols.cross
      const status = c.detected ? colors.green('detected') : colors.gray('not found')
      console.log(`  ${icon} ${colors.bold(c.name.padEnd(18))} ${status}`)
      if (c.configPath) {
        console.log(`    ${colors.gray(c.configPath)}`)
      }
    }
    console.log(`\n${colors.gray('Install a server with:')} mcp-hub install <name>\n`)
  })

// ─── installed ────────────────────────────────────────────
program
  .command('installed')
  .description('List MCP servers currently installed in your AI clients')
  .action(() => {
    console.log(BANNER)
    console.log(header('Installed MCP servers'))

    const installed = listInstalled()
    if (installed.length === 0) {
      console.log(`  ${colors.gray('No MCP servers installed in any detected client.')}`)
      console.log(`  ${colors.gray('Browse available:')} mcp-hub list\n`)
      return
    }

    for (const { client, servers } of installed) {
      console.log(`  ${colors.bold(client)} ${colors.gray(`(${servers.length})`)}`)
      for (const s of servers) {
        console.log(`    ${symbols.bullet} ${s}`)
      }
    }
    console.log()
  })

// ─── update ───────────────────────────────────────────────
program
  .command('update [name]')
  .description('Update a specific installed server, or all servers with --all, or fetch the latest registry with no args')
  .option('--all', 'update all installed servers to their latest registry config')
  .option('-c, --client <client>', 'update only in a specific client')
  .action(async (name?: string, options?: { all?: boolean; client?: string }) => {
    console.log(BANNER)

    // mcp-hub update --all  →  update all installed servers
    if (options?.all) {
      const { updateAll } = await import('./lib/update.js')
      updateAll()
      return
    }

    // mcp-hub update <name>  →  update a specific server
    if (name) {
      const { updateServer } = await import('./lib/update.js')
      updateServer(name, options || {})
      return
    }

    // mcp-hub update  →  fetch latest registry
    console.log(header('Fetching latest registry'))
    try {
      const remote = await fetchRemoteRegistry()
      console.log(`  ${symbols.check} Fetched ${colors.bold(String(remote.servers.length))} servers`)
      console.log(`  ${colors.gray('Registry version:')} ${remote.version}`)
      console.log(`  ${colors.gray('Generated at:')} ${remote.generatedAt}`)
      console.log(`\n  ${colors.yellow('Tip:')} Update installed servers with:`)
      console.log(`  ${colors.cyan('mcp-hub update --all')}    ${colors.gray('# update everything')}`)
      console.log(`  ${colors.cyan('mcp-hub update github')}  ${colors.gray('# update one server')}\n`)
    } catch (err) {
      console.log(`  ${symbols.cross} Failed to fetch registry`)
      console.log(`  ${colors.gray(err instanceof Error ? err.message : 'Unknown error')}\n`)
      process.exit(1)
    }
  })

// ─── add ──────────────────────────────────────────────────
program
  .command('add <github-url>')
  .description('Add a custom MCP server from a GitHub URL')
  .action((githubUrl: string) => {
    console.log(BANNER)
    console.log(header('Add custom server'))

    console.log(`  ${colors.gray('URL:')} ${githubUrl}`)
    console.log(`\n  ${colors.yellow('Manual configuration required:')}`)
    console.log(`  ${colors.gray('1. Clone or install the server package')}`)
    console.log(`  ${colors.gray('2. Determine the npx/npm command')}`)
    console.log(`  ${colors.gray('3. Add it to your client config manually:')}`)
    console.log(`\n  ${colors.cyan('{')}`)
    console.log(`  ${colors.cyan('  "mcpServers": {')}`)
    console.log(`  ${colors.cyan('    "my-server": {')}`)
    console.log(`  ${colors.cyan('      "command": "npx",')}`)
    console.log(`  ${colors.cyan('      "args": ["-y", "your-package"]')}`)
    console.log(`  ${colors.cyan('    }')}`)
    console.log(`  ${colors.cyan('  }')}`)
    console.log(`  ${colors.cyan('}')}`)

    const detected = detectClients()
    const found = detected.filter((c) => c.detected)
    if (found.length > 0) {
      console.log(`\n  ${colors.gray('Your client config files:')}`)
      for (const c of found) {
        console.log(`    ${symbols.bullet} ${c.name}: ${colors.gray(c.configPath || '')}`)
      }
    }
    console.log(`\n  ${colors.gray('Submit your server to the directory:')}`)
    console.log(`  ${colors.gray('https://github.com/e2sy/mcp-hub/blob/main/CONTRIBUTING.md')}\n`)
  })

// ─── categories ───────────────────────────────────────────
program
  .command('categories')
  .description('List all server categories')
  .action(() => {
    const registry = getBundledRegistry()
    console.log(BANNER)
    console.log(header('Categories'))

    const counts: Record<string, number> = {}
    for (const s of registry.servers) {
      counts[s.category] = (counts[s.category] || 0) + 1
    }

    for (const cat of registry.categories) {
      console.log(`  ${symbols.bullet} ${colors.bold(cat.name.padEnd(18))} ${colors.gray(String(counts[cat.slug] || 0))} servers`)
      console.log(`    ${colors.gray(cat.description)}`)
    }
    console.log()
  })

// ─── doctor ──────────────────────────────────────────────
program
  .command('doctor')
  .description('Diagnose config issues — use --fix for interactive repair')
  .option('--fix', 'interactively fix issues found')
  .action(async (options: { fix?: boolean }) => {
    console.log(BANNER)
    if (options.fix) {
      const { runDoctorFix } = await import('./lib/doctor-fix.js')
      await runDoctorFix()
    } else {
      runDoctor()
    }
  })

// ─── backup ──────────────────────────────────────────────
program
  .command('backup')
  .description('Back up all your AI client config files')
  .option('-l, --label <label>', 'label for this backup')
  .option('--list', 'list available backups instead of creating one')
  .option('--delete <name>', 'delete a named backup')
  .action((options: { label?: string; list?: boolean; delete?: string }) => {
    console.log(BANNER)
    if (options.list) {
      listBackups()
    } else if (options.delete) {
      deleteBackup(options.delete)
      logAction('backup', 'delete', options.delete)
    } else {
      createBackup(options.label)
      logAction('backup', options.label || 'unnamed', '')
    }
  })

// ─── restore ─────────────────────────────────────────────
program
  .command('restore <name>')
  .description('Restore configs from a named backup')
  .action((name: string) => {
    console.log(BANNER)
    restoreBackup(name)
    logAction('restore', name, '')
  })

// ─── bundle ──────────────────────────────────────────────
program
  .command('bundle <action> [file]')
  .description('Export/import server configs as a portable bundle')
  .option('-n, --name <name>', 'bundle name (for export)')
  .option('-d, --description <desc>', 'bundle description (for export)')
  .action((action: string, file?: string, options?: { name?: string; description?: string }) => {
    console.log(BANNER)

    if (action === 'export') {
      if (!file) {
        console.log(`  ${symbols.cross} Please specify an output file.`)
        console.log(`  ${colors.gray('Usage: mcp-hub bundle export my-setup.json')}\n`)
        return
      }
      exportBundle(file, options || {})
    } else if (action === 'import' || action === 'install') {
      if (!file) {
        console.log(`  ${symbols.cross} Please specify a bundle file.`)
        console.log(`  ${colors.gray('Usage: mcp-hub bundle install my-setup.json')}\n`)
        return
      }
      importBundle(file)
    } else {
      console.log(`  ${symbols.cross} Unknown action "${action}". Use "export" or "import".`)
      console.log(`  ${colors.gray('Examples:')}`)
      console.log(`    ${colors.gray('mcp-hub bundle export my-setup.json')}`)
      console.log(`    ${colors.gray('mcp-hub bundle install my-setup.json')}\n`)
    }
  })

// ─── init ────────────────────────────────────────────────
program
  .command('init <name>')
  .description('Scaffold a new MCP server with TypeScript + tests')
  .option('-p, --path <path>', 'parent directory (defaults to current)')
  .action((name: string, options: { path?: string }) => {
    console.log(BANNER)
    initServer(name, options)
  })

// ─── config ──────────────────────────────────────────────
program
  .command('config [action] [client]')
  .description('Show, edit, or print the path of AI client config files')
  .action(async (action: string, clientName: string) => {
    console.log(BANNER)

    // New: config show [client] — pretty-print config without opening editor
    if (action === 'show' || action === 'print') {
      const { showConfig } = await import('./lib/show-config.js')
      showConfig(clientName || undefined)
      return
    }

    const paths = getClientPaths()

    // Resolve client
    let target = clientName
    if (!target) {
      // Default to first detected
      const detected = detectClients().filter((c) => c.detected)
      if (detected.length === 0) {
        console.log(`  ${symbols.cross} No AI clients detected.`)
        console.log(`  ${colors.gray('Specify a client:')} mcp-hub config edit <client>`)
        console.log(`  ${colors.gray('Options:')} ${SUPPORTED_CLIENTS.join(', ')}\n`)
        return
      }
      target = detected[0].name
    }

    const cl = target.toLowerCase()
    const match = SUPPORTED_CLIENTS.find((c: string) => c.toLowerCase().includes(cl))
    if (!match) {
      console.log(`  ${symbols.cross} Unknown client "${target}"`)
      console.log(`  ${colors.gray('Options:')} ${SUPPORTED_CLIENTS.join(', ')}\n`)
      return
    }

    const configPath = paths[match] as string
    console.log(`  ${colors.gray('Client:')} ${match}`)
    console.log(`  ${colors.gray('Path:')}   ${configPath}`)

    if (action === 'path' || !action) {
      console.log(`\n  ${colors.gray('Open in editor with:')}`)
      console.log(`  ${colors.cyan(`$EDITOR ${configPath}`)}\n`)
      return
    }

    if (action === 'edit') {
      const editor = process.env.EDITOR || process.env.VISUAL || 'vi'
      console.log(`  ${colors.gray('Editor:')} ${editor}\n`)
      spawnSync(editor as string, [configPath], { stdio: 'inherit' })
      return
    }

    console.log(`  ${symbols.cross} Unknown action "${action}". Use "edit" or "path".\n`)
  })

// ─── test ────────────────────────────────────────────────
program
  .command('test <name>')
  .description('Test if an MCP server can start and respond to requests')
  .action(async (name: string) => {
    console.log(BANNER)
    const { testServer } = await import('./lib/test.js')
    testServer(name)
  })

// ─── alias ───────────────────────────────────────────────
program
  .command('alias [action] [alias] [server]')
  .description('Manage short aliases for server names')
  .action(async (action?: string, alias?: string, server?: string) => {
    console.log(BANNER)
    const { listAliases, addAlias, removeAlias } = await import('./lib/alias.js')

    if (!action || action === 'list') {
      listAliases()
    } else if (action === 'add') {
      if (!alias || !server) {
        console.log(`  ${symbols.cross} Usage: mcp-hub alias add <alias> <server-name>`)
        console.log(`  ${colors.gray('Example:')} mcp-hub alias add gh github\n`)
        return
      }
      addAlias(alias, server)
    } else if (action === 'remove' || action === 'rm') {
      if (!alias) {
        console.log(`  ${symbols.cross} Usage: mcp-hub alias remove <alias>\n`)
        return
      }
      removeAlias(alias)
    } else {
      console.log(`  ${symbols.cross} Unknown action "${action}". Use "list", "add", or "remove".\n`)
    }
  })

// ─── status ──────────────────────────────────────────────
program
  .command('status')
  .description('Show a complete dashboard of your MCP setup — like git status for MCP')
  .action(async () => {
    console.log(BANNER)
    const { showStatus } = await import('./lib/status.js')
    showStatus()
  })

// ─── completions ─────────────────────────────────────────
program
  .command('completions <shell>')
  .description('Generate shell completions (bash, zsh, fish)')
  .action(async (shell: string) => {
    const { printCompletions } = await import('./lib/completions.js')
    printCompletions(shell)
  })

// ─── outdated ────────────────────────────────────────────
program
  .command('outdated')
  .description('Check for updates — CLI version + installed server packages')
  .action(async () => {
    console.log(BANNER)
    const { showOutdated } = await import('./lib/outdated.js')
    await showOutdated()
  })

// ─── upgrade ─────────────────────────────────────────────
program
  .command('upgrade')
  .description('Upgrade mcp-hub CLI to the latest version (--all also refreshes servers)')
  .option('--all', 'also refresh all installed server configs after upgrading CLI')
  .action(async (options: { all?: boolean }) => {
    console.log(BANNER)
    const { upgradeCli, upgradeAll } = await import('./lib/outdated.js')
    if (options.all) {
      await upgradeAll()
    } else {
      upgradeCli()
    }
  })

// ─── logs ────────────────────────────────────────────────
program
  .command('logs <name>')
  .description('View live logs from a running MCP server (Ctrl+C to stop)')
  .action(async (name: string) => {
    console.log(BANNER)
    const { viewLogs } = await import('./lib/logs.js')
    viewLogs(name)
  })

// ─── whoami ──────────────────────────────────────────────
program
  .command('whoami')
  .description('Show your environment info — OS, Node version, detected clients, paths')
  .action(async () => {
    console.log(BANNER)
    const { showWhoami } = await import('./lib/whoami.js')
    showWhoami()
  })

// ─── verify ──────────────────────────────────────────────
program
  .command('verify <name>')
  .description('Verify a server works — spawn, initialize, test tools. Use --ci for GitHub Actions')
  .option('--ci', 'CI mode — exits with code 1 on failure, skips env checks')
  .option('--report', 'Report results to MCP Hub API')
  .action(async (name: string, options: { ci?: boolean; report?: boolean }) => {
    console.log(BANNER)
    const { verifyServer } = await import('./lib/verify.js')
    await verifyServer(name, options)
  })

// ─── run ─────────────────────────────────────────────────
program
  .command('run <name>')
  .description('Interactive REPL — call MCP server tools directly from the terminal')
  .action(async (name: string) => {
    console.log(BANNER)
    const { runServer } = await import('./lib/run.js')
    runServer(name)
  })

// ─── bundle share/join (extends existing bundle command) ─
program
  .command('bundle-share [action]')
  .description('Share your MCP setup via short ID — share/list/join')
  .option('-n, --name <name>', 'bundle name')
  .option('-d, --description <desc>', 'bundle description')
  .action(async (action: string, options: { name?: string; description?: string }) => {
    console.log(BANNER)
    const { shareBundle, listSharedBundles, joinBundle } = await import('./lib/bundle-share.js')

    if (!action || action === 'share') {
      shareBundle(options)
    } else if (action === 'list' || action === 'list-shared') {
      listSharedBundles()
    } else if (action === 'join' || action === 'install') {
      console.log(`  ${symbols.cross} Usage: mcp-hub bundle-join <id-or-path>\n`)
    } else {
      console.log(`  ${symbols.cross} Unknown action "${action}". Use "share", "list", or "join".\n`)
    }
  })

program
  .command('bundle-join <id-or-path>')
  .description('Install servers from a shared bundle (by ID or file path)')
  .action(async (idOrPath: string) => {
    console.log(BANNER)
    const { joinBundle } = await import('./lib/bundle-share.js')
    joinBundle(idOrPath)
  })

// ─── history ─────────────────────────────────────────────
program
  .command('history')
  .description('Show your action history — every install, remove, update, backup')
  .option('-n, --limit <n>', 'number of entries to show (default: 25)', '25')
  .option('--clear', 'clear all history')
  .action(async (options: { limit?: string; clear?: boolean }) => {
    console.log(BANNER)
    const { showHistory } = await import('./lib/history.js')
    showHistory({ limit: options.limit ? parseInt(options.limit, 10) : 25, clear: options.clear })
  })

// ─── config import ───────────────────────────────────────
program
  .command('config-import')
  .description('Import existing MCP configs from your AI clients into MCP Hub')
  .option('--from <client>', 'import from specific client only (claude, cursor, cline, windsurf)')
  .action(async (options: { from?: string }) => {
    console.log(BANNER)
    const { importConfigs } = await import('./lib/config-import.js')
    importConfigs(options)
  })

// ─── publish ─────────────────────────────────────────────
program
  .command('publish')
  .description('Submit your MCP server to the MCP Hub directory (run from your server repo)')
  .option('-c, --category <category>', 'server category (database, search, filesystem, api, productivity, devtools, cloud, communication, data, ai)')
  .action(async (options: { category?: string }) => {
    console.log(BANNER)
    const { publishServer } = await import('./lib/publish.js')
    publishServer(options)
  })

// ─── skill ───────────────────────────────────────────────
program
  .command('skill [action] [name]')
  .description('Manage AI skills — install coding, marketing, security, writing skill packs')
  .option('-c, --client <client>', 'install to specific client only')
  .option('--all-clients', 'install to all clients')
  .option('--category <category>', 'filter by category (for list)')
  .option('--installed', 'show only installed skills (for list)')
  .action(async (action: string | undefined, name: string | undefined, options: { client?: string; allClients?: boolean; category?: string; installed?: boolean }) => {
    console.log(BANNER)
    const skills = await import('./lib/skills.js')

    if (!action || action === 'list') {
      skills.listSkills({ category: options.category, installed: options.installed })
    } else if (action === 'install') {
      if (!name) {
        console.log(`  ${symbols.cross} Usage: mcp-hub skill install <name>`)
        console.log(`  ${colors.gray('Browse skills:')} mcp-hub skill list\n`)
        return
      }
      skills.installSkill(name, options)
    } else if (action === 'remove' || action === 'uninstall') {
      if (!name) {
        console.log(`  ${symbols.cross} Usage: mcp-hub skill remove <name>\n`)
        return
      }
      skills.removeSkill(name, options)
    } else if (action === 'search') {
      if (!name) {
        console.log(`  ${symbols.cross} Usage: mcp-hub skill search <query>\n`)
        return
      }
      skills.searchSkillsCmd(name)
    } else if (action === 'info' || action === 'show') {
      if (!name) {
        console.log(`  ${symbols.cross} Usage: mcp-hub skill info <name>\n`)
        return
      }
      skills.showSkillInfo(name)
    } else if (action === 'categories') {
      skills.listSkillCategories()
    } else if (action === 'add') {
      if (!name) {
        console.log(`  ${symbols.cross} Usage: mcp-hub skill add <github-url>`)
        console.log(`  ${colors.gray('Example:')} mcp-hub skill add https://github.com/yaklang/hack-skills\n`)
        return
      }
      const { addCustomSkill } = await import('./lib/custom-skills.js')
      await addCustomSkill(name)
    } else if (action === 'update') {
      if (!name) {
        console.log(`  ${symbols.cross} Usage: mcp-hub skill update <slug>`)
        console.log(`  ${colors.gray('List custom skills:')} mcp-hub skill list-custom\n`)
        return
      }
      const { updateCustomSkill } = await import('./lib/custom-skills.js')
      await updateCustomSkill(name)
    } else if (action === 'list-custom') {
      const { listCustomSkills } = await import('./lib/custom-skills.js')
      listCustomSkills()
    } else if (action === 'remove-custom') {
      if (!name) {
        console.log(`  ${symbols.cross} Usage: mcp-hub skill remove-custom <slug>\n`)
        return
      }
      const { removeCustomSkill } = await import('./lib/custom-skills.js')
      removeCustomSkill(name)
    } else {
      console.log(`  ${symbols.cross} Unknown action "${action}"`)
      console.log(`  ${colors.gray('Use:')} list, install, remove, search, info, categories, add, update, list-custom, remove-custom\n`)
    }
  })

program.parseAsync()