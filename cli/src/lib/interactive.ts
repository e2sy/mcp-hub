import * as readline from 'readline'
import { spawn } from 'child_process'
import { getBundledRegistry, searchServers } from './registry.js'
import { installServer } from './config-writer.js'
import { detectClients } from './clients.js'
import { colors, symbols, formatStars } from './ui.js'
import type { ServerEntry } from '../types.js'

/**
 * Interactive fuzzy finder for selecting and installing MCP servers.
 * Like fzf — type to filter, arrow keys to navigate, Enter to install.
 *
 * Zero dependencies — uses Node's built-in readline + raw stdin.
 */

interface FuzzyState {
  query: string
  servers: ServerEntry[]
  filtered: ServerEntry[]
  selected: number
  scrollOffset: number
}

const PAGE_SIZE = 10

/**
 * Fuzzy match — checks if all chars of query appear in order in the text.
 * Returns a score (higher = better match).
 */
function fuzzyMatch(query: string, text: string): number {
  if (!query) return 1
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let qi = 0
  let score = 0
  let lastMatchIdx = -1

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // Consecutive matches score higher
      score += lastMatchIdx === ti - 1 ? 3 : 1
      lastMatchIdx = ti
      qi++
    }
  }

  return qi === q.length ? score : 0
}

function filterServers(servers: ServerEntry[], query: string): ServerEntry[] {
  if (!query.trim()) return servers

  const scored = servers
    .map((s) => {
      const searchText = `${s.name} ${s.description} ${s.category} ${s.tags.join(' ')} ${s.author}`
      const score = fuzzyMatch(query, searchText)
      return { server: s, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.server.stars - a.server.stars)

  return scored.map((x) => x.server)
}

function clearLines(count: number): void {
  for (let i = 0; i < count; i++) {
    process.stdout.write('\x1b[1A\x1b[2K')
  }
}

function render(state: FuzzyState, detectedClients: number): void {
  const lines: string[] = []

  // Header
  lines.push(`${colors.bold('◆ Install MCP server')}`)
  lines.push(`${colors.gray('Type to search · ↑↓ navigate · Enter install · Esc cancel')}`)
  lines.push('')

  // Search input
  lines.push(`${colors.cyan('>')} ${state.query}${colors.gray('█')}`)
  lines.push('')

  // Results
  const visible = state.filtered.slice(state.scrollOffset, state.scrollOffset + PAGE_SIZE)

  if (visible.length === 0) {
    lines.push(`  ${colors.gray('No servers found')}`)
  } else {
    for (let i = 0; i < visible.length; i++) {
      const idx = state.scrollOffset + i
      const s = visible[i]
      const isSelected = idx === state.selected

      const star = s.featured ? `${colors.yellow('★')} ` : '  '
      const name = isSelected
        ? colors.cyan(colors.bold(s.name.padEnd(20)))
        : colors.bold(s.name.padEnd(20))
      const cat = colors.gray(s.category.padEnd(14))
      const stars = colors.gray(`${formatStars(s.stars)} stars`)
      const desc = colors.gray(s.description.length > 45 ? s.description.slice(0, 44) + '…' : s.description)

      const prefix = isSelected ? `${colors.cyan('❯')} ` : '  '
      lines.push(`${prefix}${star}${name} ${cat} ${stars}  ${desc}`)
    }

    if (state.filtered.length > PAGE_SIZE) {
      lines.push('')
      const showing = `${state.scrollOffset + 1}-${Math.min(state.scrollOffset + PAGE_SIZE, state.filtered.length)}`
      lines.push(`  ${colors.gray(`Showing ${showing} of ${state.filtered.length} · ${detectedClients} client(s) detected`)}`)
    }
  }

  lines.push('')

  // Render
  const output = lines.join('\n')
  process.stdout.write(output + '\n')
}

function clearRender(lineCount: number): void {
  clearLines(lineCount)
}

export function interactiveInstall(): void {
  const registry = getBundledRegistry()
  const detected = detectClients().filter((c) => c.detected)

  if (detected.length === 0) {
    console.log(`\n  ${symbols.cross} No AI clients detected.`)
    console.log(`  ${colors.gray('Install Claude Desktop, Cursor, Cline, or Windsurf first.')}`)
    console.log(`  ${colors.gray('Or use --all-clients to write config anyway.')}\n`)
    return
  }

  const state: FuzzyState = {
    query: '',
    servers: registry.servers,
    filtered: registry.servers,
    selected: 0,
    scrollOffset: 0,
  }

  // Set up raw mode
  if (!process.stdin.isTTY) {
    console.log(`\n  ${symbols.cross} Interactive mode requires a TTY.`)
    console.log(`  ${colors.gray('Use: mcp-hub install <name>')}\n`)
    return
  }

  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  process.stdin.resume()

  let renderedLines = 0
  let installed = false

  const doRender = () => {
    if (renderedLines > 0) clearRender(renderedLines)
    state.filtered = filterServers(state.servers, state.query)
    if (state.selected >= state.filtered.length) state.selected = 0
    if (state.scrollOffset > state.selected) state.scrollOffset = state.selected
    if (state.scrollOffset + PAGE_SIZE <= state.selected) state.scrollOffset = state.selected - PAGE_SIZE + 1
    render(state, detected.length)
    renderedLines = 18 // approximate line count
  }

  const cleanup = () => {
    process.stdin.setRawMode(false)
    process.stdin.pause()
    if (renderedLines > 0) clearRender(renderedLines)
  }

  const installSelected = (server: ServerEntry) => {
    installed = true
    cleanup()
    console.log(`\n  ${colors.bold('◆ Installing')} ${colors.cyan(server.name)}\n`)
    const results = installServer(server)
    for (const r of results) {
      const icon = r.status === 'installed' ? symbols.check : r.status === 'already-exists' ? symbols.arrow : symbols.cross
      console.log(`  ${icon} ${colors.bold(r.client)}: ${r.message}`)
    }
    const successCount = results.filter((r) => r.status === 'installed').length
    if (successCount > 0) {
      console.log(`\n  ${symbols.check} ${colors.green('Done!')} Restart your AI client.\n`)
    } else {
      console.log(`\n  ${colors.gray('No changes made.')}\n`)
    }
    process.exit(0)
  }

  process.stdin.on('keypress', (str, key) => {
    if (!key) return

    // Ctrl+C or Esc
    if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
      cleanup()
      console.log(`\n  ${colors.gray('Cancelled.')}\n`)
      process.exit(0)
    }

    // Enter
    if (key.name === 'return' || key.name === 'enter') {
      if (state.filtered[state.selected]) {
        installSelected(state.filtered[state.selected])
      }
      return
    }

    // Arrow keys
    if (key.name === 'down') {
      if (state.selected < state.filtered.length - 1) {
        state.selected++
        doRender()
      }
      return
    }
    if (key.name === 'up') {
      if (state.selected > 0) {
        state.selected--
        doRender()
      }
      return
    }

    // Backspace
    if (key.name === 'backspace') {
      state.query = state.query.slice(0, -1)
      doRender()
      return
    }

    // Tab — also installs
    if (key.name === 'tab') {
      if (state.filtered[state.selected]) {
        installSelected(state.filtered[state.selected])
      }
      return
    }

    // Regular character
    if (str && str.length === 1 && str.charCodeAt(0) >= 32) {
      state.query += str
      doRender()
    }
  })

  // Initial render
  doRender()
}

/**
 * Interactive server browser — for `mcp-hub list --interactive`
 */
export function interactiveBrowse(): void {
  const registry = getBundledRegistry()

  if (!process.stdin.isTTY) {
    console.log(`\n  ${symbols.cross} Interactive mode requires a TTY.\n`)
    return
  }

  const state: FuzzyState = {
    query: '',
    servers: registry.servers,
    filtered: registry.servers,
    selected: 0,
    scrollOffset: 0,
  }

  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  process.stdin.resume()

  let renderedLines = 0

  const doRender = () => {
    if (renderedLines > 0) clearRender(renderedLines)
    state.filtered = filterServers(state.servers, state.query)
    if (state.selected >= state.filtered.length) state.selected = 0
    if (state.scrollOffset > state.selected) state.scrollOffset = state.selected
    if (state.scrollOffset + PAGE_SIZE <= state.selected) state.scrollOffset = state.selected - PAGE_SIZE + 1

    const lines: string[] = []
    lines.push(`${colors.bold('◆ Browse MCP servers')}`)
    lines.push(`${colors.gray('Type to search · ↑↓ navigate · Enter for details · Esc exit')}`)
    lines.push('')
    lines.push(`${colors.cyan('>')} ${state.query}${colors.gray('█')}`)
    lines.push('')

    const visible = state.filtered.slice(state.scrollOffset, state.scrollOffset + PAGE_SIZE)
    for (let i = 0; i < visible.length; i++) {
      const idx = state.scrollOffset + i
      const s = visible[i]
      const isSelected = idx === state.selected
      const star = s.featured ? `${colors.yellow('★')} ` : '  '
      const name = isSelected ? colors.cyan(colors.bold(s.name.padEnd(20))) : colors.bold(s.name.padEnd(20))
      const cat = colors.gray(s.category.padEnd(14))
      const stars = colors.gray(`${formatStars(s.stars)} stars`)
      const desc = colors.gray(s.description.length > 45 ? s.description.slice(0, 44) + '…' : s.description)
      const prefix = isSelected ? `${colors.cyan('❯')} ` : '  '
      lines.push(`${prefix}${star}${name} ${cat} ${stars}  ${desc}`)
    }
    if (state.filtered.length > PAGE_SIZE) {
      lines.push('')
      lines.push(`  ${colors.gray(`Showing ${state.scrollOffset + 1}-${Math.min(state.scrollOffset + PAGE_SIZE, state.filtered.length)} of ${state.filtered.length}`)}`)
    }
    lines.push('')

    const output = lines.join('\n')
    process.stdout.write(output + '\n')
    renderedLines = 18
  }

  const cleanup = () => {
    process.stdin.setRawMode(false)
    process.stdin.pause()
    if (renderedLines > 0) clearRender(renderedLines)
  }

  process.stdin.on('keypress', (str, key) => {
    if (!key) return

    if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
      cleanup()
      console.log(`\n  ${colors.gray('Exited.')}\n`)
      process.exit(0)
    }

    if (key.name === 'return' || key.name === 'enter') {
      const server = state.filtered[state.selected]
      if (server) {
        cleanup()
        console.log(`\n  ${colors.bold('◆')} ${server.name}`)
        console.log(`  ${colors.gray('Author:')}     ${server.author}`)
        console.log(`  ${colors.gray('Category:')}   ${server.category}`)
        console.log(`  ${colors.gray('Stars:')}      ${symbols.star} ${formatStars(server.stars)}`)
        console.log(`  ${colors.gray('Tags:')}       ${server.tags.join(', ')}`)
        console.log(`  ${colors.gray('Repo:')}       ${server.repoUrl}`)
        console.log(`\n  ${server.description}`)
        console.log(`\n  ${colors.gray('Install with:')} mcp-hub install ${server.slug}`)
        console.log(`  ${colors.gray('Info:')}           mcp-hub info ${server.slug}\n`)
        process.exit(0)
      }
      return
    }

    if (key.name === 'down') {
      if (state.selected < state.filtered.length - 1) { state.selected++; doRender() }
      return
    }
    if (key.name === 'up') {
      if (state.selected > 0) { state.selected--; doRender() }
      return
    }
    if (key.name === 'backspace') {
      state.query = state.query.slice(0, -1); doRender(); return
    }
    if (str && str.length === 1 && str.charCodeAt(0) >= 32) {
      state.query += str; doRender()
    }
  })

  doRender()
}
