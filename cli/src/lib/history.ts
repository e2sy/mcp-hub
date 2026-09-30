import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { colors, symbols, header } from './ui.js'

const HISTORY_FILE = join(homedir(), '.mcp-hub', 'history.jsonl')

interface HistoryEntry {
  timestamp: string
  action: string
  target: string
  detail: string
}

/**
 * Appends an entry to the history log.
 * Called by install, remove, update, backup, restore, bundle commands.
 */
export function logAction(action: string, target: string, detail: string = ''): void {
  try {
    mkdirSync(dirname(HISTORY_FILE), { recursive: true })
    const entry: HistoryEntry = {
      timestamp: new Date().toISOString(),
      action,
      target,
      detail,
    }
    appendFileSync(HISTORY_FILE, JSON.stringify(entry) + '\n', 'utf-8')
  } catch {
    // ignore — history is best-effort
  }
}

/**
 * Reads all history entries.
 */
export function readHistory(): HistoryEntry[] {
  if (!existsSync(HISTORY_FILE)) return []
  try {
    const raw = readFileSync(HISTORY_FILE, 'utf-8')
    return raw
      .trim()
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as HistoryEntry)
      .reverse() // newest first
  } catch {
    return []
  }
}

/**
 * Clears all history.
 */
export function clearHistory(): void {
  if (existsSync(HISTORY_FILE)) {
    writeFileSync(HISTORY_FILE, '', 'utf-8')
  }
}

/**
 * Displays the history log.
 */
export function showHistory(options: { limit?: number; clear?: boolean }): void {
  if (options.clear) {
    clearHistory()
    console.log(header('History cleared'))
    console.log(`  ${symbols.check} All history entries removed.\n`)
    return
  }

  const entries = readHistory()

  if (entries.length === 0) {
    console.log(header('History'))
    console.log(`  ${colors.gray('No history yet.')}`)
    console.log(`  ${colors.gray('Actions (install, remove, update, backup, etc.) will be logged here.')}\n`)
    return
  }

  const limit = options.limit || 25
  const shown = entries.slice(0, limit)

  console.log(header(`History (${entries.length} entries, showing ${shown.length})`))
  console.log(`  ${colors.gray('File:')} ${HISTORY_FILE}\n`)

  for (const entry of shown) {
    const date = new Date(entry.timestamp)
    const time = date.toLocaleString('en', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    let icon = symbols.bullet
    let actionColored = entry.action

    switch (entry.action) {
      case 'install':
        icon = symbols.check
        actionColored = colors.green(entry.action)
        break
      case 'remove':
        icon = symbols.cross
        actionColored = colors.red(entry.action)
        break
      case 'update':
        icon = symbols.arrow
        actionColored = colors.cyan(entry.action)
        break
      case 'backup':
        icon = '💾'
        actionColored = colors.yellow(entry.action)
        break
      case 'restore':
        icon = '♻'
        actionColored = colors.magenta(entry.action)
        break
      case 'bundle-share':
        icon = '🔗'
        actionColored = colors.blue(entry.action)
        break
      case 'bundle-join':
        icon = '📥'
        actionColored = colors.blue(entry.action)
        break
      case 'import':
        icon = '⬆'
        actionColored = colors.green(entry.action)
        break
      case 'alias':
        icon = '🏷'
        actionColored = colors.gray(entry.action)
        break
    }

    const target = colors.bold(entry.target.padEnd(18))
    const detail = entry.detail ? colors.gray(` ${entry.detail}`) : ''
    console.log(`  ${colors.gray(time)}  ${icon} ${actionColored.padEnd(14)} ${target}${detail}`)
  }

  if (entries.length > limit) {
    console.log(`\n  ${colors.gray(`... and ${entries.length - limit} more (use --limit ${entries.length} to see all)`)}`)
  }
  console.log()
}
