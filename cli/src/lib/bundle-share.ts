import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { detectClients } from './clients.js'
import { getBundledRegistry, findServer } from './registry.js'
import { installServer } from './config-writer.js'
import { colors, symbols, header } from './ui.js'

const SHARE_DIR = join(homedir(), '.mcp-hub', 'shared')
const SHARE_INDEX = join(SHARE_DIR, 'index.json')

interface SharedBundle {
  id: string
  name: string
  description?: string
  servers: string[]
  createdAt: string
}

interface ShareIndex {
  [id: string]: SharedBundle
}

function loadIndex(): ShareIndex {
  if (!existsSync(SHARE_INDEX)) return {}
  try {
    return JSON.parse(readFileSync(SHARE_INDEX, 'utf-8'))
  } catch {
    return {}
  }
}

function saveIndex(index: ShareIndex): void {
  mkdirSync(dirname(SHARE_INDEX), { recursive: true })
  writeFileSync(SHARE_INDEX, JSON.stringify(index, null, 2), 'utf-8')
}

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

/**
 * Creates a shareable bundle from currently installed servers.
 * Saves locally and prints a shareable command.
 */
export function shareBundle(options: { name?: string; description?: string }): void {
  console.log(header('Creating shareable bundle'))

  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))
  const registry = getBundledRegistry()

  // Collect all installed server slugs
  const installedSlugs = new Set<string>()
  for (const client of detected) {
    try {
      const config = JSON.parse(readFileSync(client.configPath!, 'utf-8'))
      const servers = config.mcpServers || {}
      for (const slug of Object.keys(servers)) {
        // Only include known registry servers
        if (findServer(registry, slug)) {
          installedSlugs.add(slug)
        }
      }
    } catch {
      // skip
    }
  }

  if (installedSlugs.size === 0) {
    console.log(`  ${symbols.cross} No MCP Hub servers found installed.`)
    console.log(`  ${colors.gray('Install servers with `mcp-hub install <name>` first.')}\n`)
    return
  }

  const servers = [...installedSlugs]
  const id = generateId()
  const bundle: SharedBundle = {
    id,
    name: options.name || 'My MCP Setup',
    description: options.description,
    servers,
    createdAt: new Date().toISOString(),
  }

  // Save to local index
  const index = loadIndex()
  index[id] = bundle
  saveIndex(index)

  // Also save the bundle file
  const bundlePath = join(SHARE_DIR, `${id}.json`)
  writeFileSync(bundlePath, JSON.stringify({
    version: '1.0.0',
    ...bundle,
  }, null, 2), 'utf-8')

  console.log(`  ${symbols.check} Bundle created: ${colors.bold(bundle.name)}`)
  if (bundle.description) {
    console.log(`  ${colors.gray('Description:')} ${bundle.description}`)
  }
  console.log(`  ${colors.gray('Servers:')}    ${servers.length}`)
  console.log()
  console.log(`  ${colors.bold('Servers in this bundle:')}`)
  for (const slug of servers) {
    const server = findServer(registry, slug)
    console.log(`    ${symbols.bullet} ${server?.name || slug} ${colors.gray(`(${slug})`)}`)
  }
  console.log()

  // Print share command
  console.log(`  ${colors.bold('Share with anyone:')}\n`)
  console.log(`  ${colors.cyan(`npx mcp-hub bundle join ${id}`)}\n`)
  console.log(`  ${colors.gray('Or save the bundle file and share manually:')}`)
  console.log(`  ${colors.gray(bundlePath)}\n`)

  console.log(`  ${colors.gray('Bundle ID:')} ${id}`)
  console.log(`  ${colors.gray('Created at:')} ${new Date(bundle.createdAt).toLocaleString()}\n`)
}

/**
 * Lists all shared bundles created on this machine.
 */
export function listSharedBundles(): void {
  console.log(header('Shared bundles'))
  console.log(`  ${colors.gray('Location:')} ${SHARE_DIR}\n`)

  const index = loadIndex()
  const entries = Object.values(index).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (entries.length === 0) {
    console.log(`  ${colors.gray('No shared bundles yet.')}`)
    console.log(`  ${colors.gray('Create one with:')} mcp-hub bundle share\n`)
    return
  }

  for (const bundle of entries) {
    const date = new Date(bundle.createdAt).toLocaleDateString('en', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    console.log(`  ${colors.bold(bundle.id)}  ${bundle.name} ${colors.gray(`(${bundle.servers.length} servers · ${date})`)}`)
    if (bundle.description) {
      console.log(`    ${colors.gray(bundle.description)}`)
    }
    console.log(`    ${colors.gray(`Share: npx mcp-hub bundle join ${bundle.id}`)}`)
  }
  console.log()
}

/**
 * Installs servers from a shared bundle.
 * Works with either a bundle ID (from share server) or a file path.
 */
export function joinBundle(idOrPath: string): void {
  console.log(header('Joining bundle'))

  // If it looks like a file path
  if (idOrPath.includes('/') || idOrPath.endsWith('.json')) {
    if (!existsSync(idOrPath)) {
      console.log(`  ${symbols.cross} File not found: ${colors.red(idOrPath)}\n`)
      return
    }
    try {
      const bundle = JSON.parse(readFileSync(idOrPath, 'utf-8'))
      installFromBundle(bundle)
    } catch (e) {
      console.log(`  ${symbols.cross} Invalid bundle file: ${e instanceof Error ? e.message : 'parse error'}\n`)
    }
    return
  }

  // Otherwise treat as bundle ID — look up locally
  const index = loadIndex()
  const bundle = index[idOrPath]

  if (!bundle) {
    console.log(`  ${symbols.cross} Bundle "${colors.red(idOrPath)}" not found locally.`)
    console.log(`\n  ${colors.gray('If someone shared this ID with you:')}`)
    console.log(`  ${colors.gray('1. Ask them to share the bundle file')}`)
    console.log(`  ${colors.gray('2. Save it locally')}`)
    console.log(`  ${colors.gray('3. Run: mcp-hub bundle join <path-to-file>')}\n`)
    console.log(`  ${colors.gray('Or list your local bundles:')} mcp-hub bundle list-shared\n`)
    return
  }

  installFromBundle(bundle)
}

function installFromBundle(bundle: any): void {
  console.log(`  ${colors.gray('Bundle:')} ${bundle.name || 'unnamed'}`)
  if (bundle.description) {
    console.log(`  ${colors.gray('Description:')} ${bundle.description}`)
  }
  console.log(`  ${colors.gray('Servers:')} ${bundle.servers?.length || 0}\n`)

  if (!bundle.servers || !Array.isArray(bundle.servers)) {
    console.log(`  ${symbols.cross} Invalid bundle — missing servers array\n`)
    return
  }

  const registry = getBundledRegistry()
  let installed = 0
  let skipped = 0

  for (const slug of bundle.servers) {
    const server = findServer(registry, slug)
    if (!server) {
      console.log(`  ${symbols.cross} ${slug} — not found in registry`)
      skipped++
      continue
    }
    const results = installServer(server)
    const success = results.some((r) => r.status === 'installed')
    const already = results.every((r) => r.status === 'already-exists' || r.status === 'skipped')
    if (success) {
      console.log(`  ${symbols.check} ${server.name} — installed`)
      installed++
    } else if (already) {
      console.log(`  ${colors.gray('○')} ${server.name} — already installed`)
    } else {
      console.log(`  ${symbols.cross} ${server.name} — failed`)
    }
  }

  console.log(`\n  ${symbols.check} ${colors.green('Done!')} Installed ${installed}, skipped ${skipped}`)
  console.log(`  ${colors.gray('Restart your AI clients to apply changes.')}\n`)
}
