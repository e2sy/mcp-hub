import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { colors, symbols, header } from './ui.js'

const ALIASES_FILE = join(homedir(), '.mcp-hub', 'aliases.json')

interface Aliases {
  [alias: string]: string
}

export function loadAliases(): Aliases {
  if (!existsSync(ALIASES_FILE)) return {}
  try {
    return JSON.parse(readFileSync(ALIASES_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function saveAliases(aliases: Aliases): void {
  mkdirSync(dirname(ALIASES_FILE), { recursive: true })
  writeFileSync(ALIASES_FILE, JSON.stringify(aliases, null, 2), 'utf-8')
}

/**
 * Lists all configured aliases.
 */
export function listAliases(): void {
  console.log(header('Aliases'))
  console.log(`  ${colors.gray('File:')} ${ALIASES_FILE}\n`)

  const aliases = loadAliases()
  const entries = Object.entries(aliases)

  if (entries.length === 0) {
    console.log(`  ${colors.gray('No aliases configured.')}`)
    console.log(`  ${colors.gray('Create one with:')} mcp-hub alias add <alias> <server-name>\n`)
    return
  }

  for (const [alias, name] of entries) {
    console.log(`  ${symbols.bullet} ${colors.bold(alias.padEnd(15))} → ${colors.cyan(name)}`)
  }
  console.log(`\n  ${colors.gray('Use an alias anywhere you would use a server name:')}`)
  console.log(`  ${colors.cyan('mcp-hub install gh')}  ${colors.gray('# installs github')}\n`)
}

/**
 * Adds a new alias.
 */
export function addAlias(alias: string, serverName: string): void {
  const aliases = loadAliases()

  if (aliases[alias]) {
    console.log(`  ${symbols.cross} Alias "${colors.red(alias)}" already exists (→ ${aliases[alias]})`)
    console.log(`  ${colors.gray('Remove it first with:')} mcp-hub alias remove ${alias}\n`)
    return
  }

  aliases[alias] = serverName
  saveAliases(aliases)

  console.log(`  ${symbols.check} Added alias: ${colors.bold(alias)} → ${colors.cyan(serverName)}\n`)
}

/**
 * Removes an alias.
 */
export function removeAlias(alias: string): void {
  const aliases = loadAliases()

  if (!aliases[alias]) {
    console.log(`  ${symbols.cross} Alias "${colors.red(alias)}" not found.\n`)
    return
  }

  delete aliases[alias]
  saveAliases(aliases)
  console.log(`  ${symbols.check} Removed alias "${alias}"\n`)
}

/**
 * Resolves an alias to the actual server name.
 * Returns the input unchanged if no alias exists.
 */
export function resolveAlias(input: string): string {
  const aliases = loadAliases()
  return aliases[input] || input
}
