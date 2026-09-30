import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, rmSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { detectClients } from './clients.js'
import { colors, symbols, header } from './ui.js'

const BACKUP_DIR = join(homedir(), '.mcp-hub', 'backups')

function ensureBackupDir(): string {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }
  return BACKUP_DIR
}

/**
 * Creates a timestamped backup of all detected client config files.
 */
export function createBackup(label?: string): void {
  console.log(header('Creating backup'))

  const detected = detectClients().filter((c) => c.detected && c.configPath && existsSync(c.configPath))

  if (detected.length === 0) {
    console.log(`  ${symbols.cross} No AI client config files found to back up.\n`)
    return
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupName = label ? `${timestamp}-${label}` : timestamp
  const backupPath = join(ensureBackupDir(), backupName)

  mkdirSync(backupPath, { recursive: true })

  let count = 0
  for (const client of detected) {
    const filename = client.name.toLowerCase().replace(/\s+/g, '-') + '.json'
    const dest = join(backupPath, filename)
    copyFileSync(client.configPath!, dest)
    console.log(`  ${symbols.check} ${client.name} → ${colors.gray(dest)}`)
    count++
  }

  // Write a manifest
  const manifest = {
    created: new Date().toISOString(),
    label: label || null,
    clients: detected.map((c) => ({ name: c.name, filename: c.name.toLowerCase().replace(/\s+/g, '-') + '.json' })),
  }
  writeFileSync(join(backupPath, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8')

  console.log(`\n  ${symbols.check} ${colors.green('Backup created:')} ${backupPath}`)
  console.log(`  ${colors.gray('Backed up')} ${count} ${colors.gray('config file(s)')}`)
  console.log(`  ${colors.gray('Restore with:')} mcp-hub restore ${backupName}\n`)
}

/**
 * Lists all available backups.
 */
export function listBackups(): void {
  console.log(header('Available backups'))
  console.log(`  ${colors.gray('Location:')} ${BACKUP_DIR}\n`)

  if (!existsSync(BACKUP_DIR)) {
    console.log(`  ${colors.gray('No backups yet. Run `mcp-hub backup` to create one.')}\n`)
    return
  }

  const entries = readdirSync(BACKUP_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort()
    .reverse()

  if (entries.length === 0) {
    console.log(`  ${colors.gray('No backups yet.')}\n`)
    return
  }

  for (const entry of entries) {
    const manifestPath = join(BACKUP_DIR, entry.name, 'manifest.json')
    let label = ''
    let created = ''
    let clientCount = 0
    if (existsSync(manifestPath)) {
      try {
        const m = JSON.parse(readFileSync(manifestPath, 'utf-8'))
        label = m.label || ''
        created = m.created || ''
        clientCount = m.clients?.length || 0
      } catch {
        // ignore
      }
    }
    const labelStr = label ? ` ${colors.gray(`(${label})`)}` : ''
    const dateStr = created ? new Date(created).toLocaleString() : entry.name
    console.log(`  ${symbols.bullet} ${colors.bold(entry.name)}${labelStr}`)
    console.log(`    ${colors.gray(`${dateStr} · ${clientCount} client(s)`)}`)
  }
  console.log(`\n  ${colors.gray('Restore with:')} mcp-hub restore <name>\n`)
}

/**
 * Restores configs from a named backup.
 */
export function restoreBackup(name: string): void {
  console.log(header(`Restoring from ${name}`))

  const backupPath = join(BACKUP_DIR, name)

  if (!existsSync(backupPath)) {
    console.log(`  ${symbols.cross} Backup "${colors.red(name)}" not found.`)
    console.log(`  ${colors.gray('Run `mcp-hub backup --list` to see available backups.')}\n`)
    return
  }

  const manifestPath = join(backupPath, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.log(`  ${symbols.cross} Backup is missing manifest.json — corrupted?\n`)
    return
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const detected = detectClients()
  const clientMap = new Map(detected.map((c) => [c.name, c]))

  // Backup current configs before restoring
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const preRestorePath = join(ensureBackupDir(), `${timestamp}-pre-restore`)
  mkdirSync(preRestorePath, { recursive: true })

  let restored = 0
  for (const entry of manifest.clients) {
    const client = clientMap.get(entry.name)
    if (!client || !client.configPath) {
      console.log(`  ${symbols.cross} ${entry.name} — client not detected, skipping`)
      continue
    }

    const backupFile = join(backupPath, entry.filename)
    if (!existsSync(backupFile)) {
      console.log(`  ${symbols.cross} ${entry.name} — backup file missing`)
      continue
    }

    // Save current config before overwriting
    if (existsSync(client.configPath)) {
      copyFileSync(client.configPath, join(preRestorePath, entry.filename))
    }

    // Restore
    const dir = dirname(client.configPath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    copyFileSync(backupFile, client.configPath)

    console.log(`  ${symbols.check} ${entry.name} restored`)
    restored++
  }

  writeFileSync(
    join(preRestorePath, 'manifest.json'),
    JSON.stringify({ created: new Date().toISOString(), label: 'pre-restore automatic', clients: manifest.clients }, null, 2),
    'utf-8'
  )

  console.log(`\n  ${symbols.check} ${colors.green('Done!')} Restored ${restored} config(s) from ${name}`)
  console.log(`  ${colors.gray('Previous configs saved as:')} ${preRestorePath}`)
  console.log(`  ${colors.gray('Restart your AI clients to apply changes.')}\n`)
}

/**
 * Deletes a backup.
 */
export function deleteBackup(name: string): void {
  const backupPath = join(BACKUP_DIR, name)
  if (!existsSync(backupPath)) {
    console.log(`\n  ${symbols.cross} Backup "${colors.red(name)}" not found.\n`)
    return
  }
  rmSync(backupPath, { recursive: true, force: true })
  console.log(`\n  ${symbols.check} Deleted backup "${name}"\n`)
}
