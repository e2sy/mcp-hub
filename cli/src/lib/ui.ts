// ANSI color codes — no external dependency needed
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
}

function supportColor(): boolean {
  return process.stdout.isTTY !== false && process.env.NO_COLOR === undefined
}

const color = supportColor()

export const colors = {
  bold: (s: string) => (color ? `${c.bold}${s}${c.reset}` : s),
  dim: (s: string) => (color ? `${c.dim}${s}${c.reset}` : s),
  red: (s: string) => (color ? `${c.red}${s}${c.reset}` : s),
  green: (s: string) => (color ? `${c.green}${s}${c.reset}` : s),
  yellow: (s: string) => (color ? `${c.yellow}${s}${c.reset}` : s),
  blue: (s: string) => (color ? `${c.blue}${s}${c.reset}` : s),
  magenta: (s: string) => (color ? `${c.magenta}${s}${c.reset}` : s),
  cyan: (s: string) => (color ? `${c.cyan}${s}${c.reset}` : s),
  gray: (s: string) => (color ? `${c.gray}${s}${c.reset}` : s),
}

export const symbols = {
  check: colors.green('✓'),
  cross: colors.red('✗'),
  arrow: colors.cyan('→'),
  star: colors.yellow('★'),
  bullet: colors.gray('•'),
  box: colors.gray('▢'),
}

export function header(title: string): string {
  return `\n${colors.bold(colors.cyan('◆'))} ${colors.bold(title)}\n${colors.gray('─'.repeat(40))}\n`
}

export function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return n.toString()
}

export function printTable(
  rows: string[][],
  options: { headers?: string[]; colWidths?: number[] } = {}
): void {
  const { headers, colWidths } = options
  const allRows = headers ? [headers, ...rows] : rows
  if (allRows.length === 0) return

  // Calculate column widths
  const numCols = allRows[0].length
  const widths = colWidths || Array.from({ length: numCols }, (_, i) =>
    Math.max(...allRows.map((r) => r[i]?.length || 0))
  )

  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i]
    const line = row
      .map((cell, j) => {
        const w = widths[j]
        const truncated = cell.length > w ? cell.slice(0, w - 1) + '…' : cell
        return truncated.padEnd(w)
      })
      .join('  ')
    if (headers && i === 0) {
      console.log(colors.bold(line))
      console.log(colors.gray('─'.repeat(line.length)))
    } else {
      console.log(line)
    }
  }
}
