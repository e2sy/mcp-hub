import { existsSync } from 'fs'
import { homedir, platform } from 'os'
import { join } from 'path'
import type { ClientDetection } from '../types.js'

export const SUPPORTED_CLIENTS = [
  'Claude Desktop',
  'Cursor',
  'Cline',
  'Windsurf',
] as const

export type ClientName = (typeof SUPPORTED_CLIENTS)[number]

/**
 * Returns the expected config file path for each MCP-aware AI client
 * on the current OS.
 */
export function getClientPaths(): Record<ClientName, string | null> {
  const home = homedir()
  const os = platform()

  // macOS: ~/Library/Application Support/...
  const macPaths: Record<ClientName, string> = {
    'Claude Desktop': join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
    'Cursor': join(home, '.cursor', 'mcp.json'),
    'Cline': join(home, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    'Windsurf': join(home, '.codeium', 'windsurf', 'mcp_config.json'),
  }

  // Windows: %APPDATA%\...
  const winAppData = process.env.APPDATA || join(home, 'AppData', 'Roaming')
  const winPaths: Record<ClientName, string> = {
    'Claude Desktop': join(winAppData, 'Claude', 'claude_desktop_config.json'),
    'Cursor': join(home, '.cursor', 'mcp.json'),
    'Cline': join(winAppData, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    'Windsurf': join(home, '.codeium', 'windsurf', 'mcp_config.json'),
  }

  // Linux: ~/.config/...
  const linuxPaths: Record<ClientName, string> = {
    'Claude Desktop': join(home, '.config', 'Claude', 'claude_desktop_config.json'),
    'Cursor': join(home, '.cursor', 'mcp.json'),
    'Cline': join(home, '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    'Windsurf': join(home, '.codeium', 'windsurf', 'mcp_config.json'),
  }

  if (os === 'darwin') return macPaths
  if (os === 'win32') return winPaths
  return linuxPaths
}

export function detectClients(): ClientDetection[] {
  const paths = getClientPaths()
  return SUPPORTED_CLIENTS.map((name) => {
    const configPath = paths[name]
    return {
      name,
      detected: configPath ? existsSync(configPath) : false,
      configPath,
    }
  })
}

export function getInstalledClients(): ClientDetection[] {
  return detectClients().filter((c) => c.detected)
}
