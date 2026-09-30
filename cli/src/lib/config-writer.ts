import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { dirname } from 'path'
import type { ServerEntry, ClientDetection } from '../types.js'
import { detectClients, getClientPaths, type ClientName } from './clients.js'

/**
 * Parses the server's configJson and returns the mcpServers block.
 * The configJson is a full {"mcpServers": {...}} object — we extract the inner key.
 */
function extractServerBlock(server: ServerEntry): Record<string, unknown> {
  try {
    const parsed = JSON.parse(server.configJson)
    if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
      return parsed.mcpServers as Record<string, unknown>
    }
    // If it's just the server config directly, wrap it under the slug
    return { [server.slug]: parsed }
  } catch {
    throw new Error(`Invalid config JSON for server "${server.name}"`)
  }
}

function readConfig(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {}
  try {
    const raw = readFileSync(path, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeConfig(path: string, config: Record<string, unknown>): void {
  const dir = dirname(path)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

function backupConfig(path: string): void {
  if (!existsSync(path)) return
  const backupPath = path + '.backup'
  try {
    copyFileSync(path, backupPath)
  } catch {
    // ignore backup failures
  }
}

export interface InstallResult {
  client: string
  status: 'installed' | 'already-exists' | 'skipped' | 'error'
  message: string
  configPath: string
}

/**
 * Installs a server into all detected AI clients.
 * If `clients` is specified, only installs to those clients.
 */
export function installServer(
  server: ServerEntry,
  clients?: string[]
): InstallResult[] {
  const detected = detectClients()
  const serverBlock = extractServerBlock(server)
  const results: InstallResult[] = []

  for (const client of detected) {
    if (clients && clients.length > 0 && !clients.includes(client.name)) {
      continue
    }

    if (!client.configPath) {
      results.push({
        client: client.name,
        status: 'skipped',
        message: 'No config path known for this OS',
        configPath: '',
      })
      continue
    }

    try {
      // Even if the file doesn't exist yet, we can create it
      const existing = readConfig(client.configPath)
      const mcpServers = (existing.mcpServers || {}) as Record<string, unknown>
      const serverKey = server.slug

      if (mcpServers[serverKey]) {
        results.push({
          client: client.name,
          status: 'already-exists',
          message: `"${server.name}" is already configured`,
          configPath: client.configPath,
        })
        continue
      }

      // Backup before writing
      backupConfig(client.configPath)

      mcpServers[serverKey] = serverBlock[serverKey] || serverBlock
      existing.mcpServers = mcpServers
      writeConfig(client.configPath, existing)

      results.push({
        client: client.name,
        status: 'installed',
        message: `Added "${server.name}" to ${client.name}`,
        configPath: client.configPath,
      })
    } catch (err) {
      results.push({
        client: client.name,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
        configPath: client.configPath,
      })
    }
  }

  return results
}

export function removeServer(serverSlug: string, clients?: string[]): InstallResult[] {
  const detected = detectClients()
  const results: InstallResult[] = []

  for (const client of detected) {
    if (clients && clients.length > 0 && !clients.includes(client.name)) {
      continue
    }
    if (!client.configPath || !existsSync(client.configPath)) {
      continue
    }

    try {
      const existing = readConfig(client.configPath)
      const mcpServers = (existing.mcpServers || {}) as Record<string, unknown>

      if (!mcpServers[serverSlug]) {
        results.push({
          client: client.name,
          status: 'skipped',
          message: `"${serverSlug}" not found in ${client.name}`,
          configPath: client.configPath,
        })
        continue
      }

      backupConfig(client.configPath)
      delete mcpServers[serverSlug]
      existing.mcpServers = mcpServers
      writeConfig(client.configPath, existing)

      results.push({
        client: client.name,
        status: 'installed',
        message: `Removed "${serverSlug}" from ${client.name}`,
        configPath: client.configPath,
      })
    } catch (err) {
      results.push({
        client: client.name,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
        configPath: client.configPath,
      })
    }
  }

  return results
}

/**
 * Lists all servers currently installed across all detected clients.
 */
export function listInstalled(): { client: string; servers: string[] }[] {
  const detected = detectClients()
  return detected
    .filter((c) => c.configPath && existsSync(c.configPath))
    .map((c) => {
      const config = readConfig(c.configPath!)
      const mcpServers = (config.mcpServers || {}) as Record<string, unknown>
      return {
        client: c.name,
        servers: Object.keys(mcpServers),
      }
    })
    .filter((c) => c.servers.length > 0)
}
