import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync, unlinkSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { detectClients, getClientPaths, SUPPORTED_CLIENTS } from './clients.js'
import { SKILLS, ALL_SKILLS, SKILL_CATEGORIES, findSkill, searchSkills, getSkillsByCategory, type Skill } from './skills-data.js'
import { getCustomSkills, findCustomSkill } from './custom-skills.js'
import { colors, symbols, header, formatStars, printTable } from './ui.js'
import { logAction } from './history.js'

const SKILLS_DIR = join(homedir(), '.mcp-hub', 'skills')
const INSTALLED_FILE = join(SKILLS_DIR, 'installed.json')

interface InstalledSkills {
  [slug: string]: {
    installedAt: string
    clients: string[]
  }
}

/**
 * Where each AI client stores its rules/instructions:
 * - Cursor: .cursorrules file in home dir
 * - Claude Desktop: claude_desktop_config.json → customInstructions (or .claude/instructions.md)
 * - Cline: cline_mcp_settings.json → customInstructions
 * - Windsurf: .codeium/windsurf/rules.md
 */
function getRulesPath(clientName: string): string | null {
  const home = homedir()
  switch (clientName) {
    case 'Cursor':
      return join(home, '.cursorrules')
    case 'Claude Desktop':
      // Claude Desktop reads .claude/instructions.md if it exists
      return join(home, '.claude', 'instructions.md')
    case 'Cline':
      // Cline reads from its settings directory
      return join(home, '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'custom_instructions.md')
    case 'Windsurf':
      return join(home, '.codeium', 'windsurf', 'rules.md')
    default:
      return null
  }
}

function loadInstalled(): InstalledSkills {
  if (!existsSync(INSTALLED_FILE)) return {}
  try {
    return JSON.parse(readFileSync(INSTALLED_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function saveInstalled(data: InstalledSkills): void {
  mkdirSync(dirname(INSTALLED_FILE), { recursive: true })
  writeFileSync(INSTALLED_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

/**
 * Installs a skill by appending its content to the AI client's rules file.
 */
export function installSkill(slug: string, options: { client?: string; allClients?: boolean }): void {
  // Check builtin skills first, then custom
  const skill = findSkill(slug) || findCustomSkill(slug)
  if (!skill) {
    console.log(`\n  ${symbols.cross} Skill "${colors.red(slug)}" not found.`)
    console.log(`  ${colors.gray('Try:')} mcp-hub skill search "${slug}"\n`)
    return
  }

  console.log(header(`Installing skill: ${skill.name}`))
  console.log(`  ${colors.gray('Category:')}   ${skill.category}`)
  console.log(`  ${colors.gray('Tags:')}       ${skill.tags.join(', ')}`)
  console.log(`  ${colors.gray('Content:')}    ${skill.content.length} chars\n`)

  // Determine which clients to install to
  let targetClients: string[] = []
  if (options.client) {
    const cl = options.client.toLowerCase()
    const match = SUPPORTED_CLIENTS.find((c) => c.toLowerCase().includes(cl))
    if (!match) {
      console.log(`  ${symbols.cross} Unknown client "${options.client}"`)
      console.log(`  ${colors.gray('Supported:')} ${SUPPORTED_CLIENTS.join(', ')}\n`)
      return
    }
    targetClients = [match]
  } else if (options.allClients) {
    targetClients = [...SUPPORTED_CLIENTS]
  } else {
    // Auto-detect installed clients
    const detected = detectClients().filter((c) => c.detected).map((c) => c.name)
    targetClients = detected.length > 0 ? detected : [...SUPPORTED_CLIENTS]
  }

  const installed = loadInstalled()

  // Check if already installed
  if (installed[skill.slug]?.clients.some((c) => targetClients.includes(c))) {
    const existing = installed[skill.slug].clients.filter((c) => targetClients.includes(c))
    console.log(`  ${symbols.arrow} Already installed in: ${existing.join(', ')}`)
    console.log(`  ${colors.gray('Use --force to reinstall, or remove first')}\n`)
    return
  }

  let successCount = 0

  for (const clientName of targetClients) {
    const rulesPath = getRulesPath(clientName)
    if (!rulesPath) {
      console.log(`  ${symbols.cross} ${clientName}: No rules path configured`)
      continue
    }

    try {
      // Create directory if needed
      mkdirSync(dirname(rulesPath), { recursive: true })

      // Check if skill is already in the file
      let existingContent = ''
      if (existsSync(rulesPath)) {
        existingContent = readFileSync(rulesPath, 'utf-8')
      }

      // Check for skill marker
      const startMarker = `<!-- mcp-hub-skill:${skill.slug} -->`
      const endMarker = `<!-- /mcp-hub-skill:${skill.slug} -->`

      if (existingContent.includes(startMarker)) {
        // Replace existing skill block
        const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'g')
        existingContent = existingContent.replace(regex, '').trim()
      }

      // Append skill content with markers
      const skillBlock = `\n\n${startMarker}\n${skill.content}\n${endMarker}\n`
      const newContent = existingContent + skillBlock

      writeFileSync(rulesPath, newContent, 'utf-8')

      console.log(`  ${symbols.check} ${clientName}: Skill installed`)
      console.log(`    ${colors.gray(rulesPath)}`)
      successCount++
    } catch (err) {
      console.log(`  ${symbols.cross} ${clientName}: ${err instanceof Error ? err.message : 'failed'}`)
    }
  }

  // Update installed registry
  if (!installed[skill.slug]) {
    installed[skill.slug] = {
      installedAt: new Date().toISOString(),
      clients: [],
    }
  }
  installed[skill.slug].clients = [...new Set([...installed[skill.slug].clients, ...targetClients])]
  saveInstalled(installed)

  if (successCount > 0) {
    console.log(`\n  ${symbols.check} ${colors.green('Done!')} Installed to ${successCount} client(s).`)
    console.log(`  ${colors.gray('Restart your AI client to activate the skill.')}\n`)
    logAction('skill-install', skill.slug, `→ ${targetClients.join(', ')}`)
  }
}

/**
 * Removes a skill from all (or specific) AI clients.
 */
export function removeSkill(slug: string, options: { client?: string }): void {
  const skill = findSkill(slug)
  if (!skill) {
    console.log(`\n  ${symbols.cross} Skill "${colors.red(slug)}" not found.\n`)
    return
  }

  const installed = loadInstalled()
  if (!installed[skill.slug]) {
    console.log(`\n  ${symbols.cross} Skill "${skill.name}" is not installed.\n`)
    return
  }

  let targetClients = options.client
    ? SUPPORTED_CLIENTS.filter((c) => c.toLowerCase().includes(options.client!.toLowerCase()))
    : installed[skill.slug].clients

  if (targetClients.length === 0) {
    console.log(`\n  ${symbols.cross} No matching clients found.\n`)
    return
  }

  console.log(header(`Removing skill: ${skill.name}`))

  let removedCount = 0
  const startMarker = `<!-- mcp-hub-skill:${skill.slug} -->`
  const endMarker = `<!-- /mcp-hub-skill:${skill.slug} -->`

  for (const clientName of targetClients) {
    const rulesPath = getRulesPath(clientName)
    if (!rulesPath || !existsSync(rulesPath)) {
      continue
    }

    try {
      let content = readFileSync(rulesPath, 'utf-8')
      const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\n?`, 'g')
      content = content.replace(regex, '').trim()
      writeFileSync(rulesPath, content + '\n', 'utf-8')
      console.log(`  ${symbols.check} ${clientName}: Skill removed`)
      removedCount++
    } catch (err) {
      console.log(`  ${symbols.cross} ${clientName}: ${err instanceof Error ? err.message : 'failed'}`)
    }
  }

  // Update installed registry
  installed[skill.slug].clients = installed[skill.slug].clients.filter(
    (c) => !targetClients.includes(c)
  )
  if (installed[skill.slug].clients.length === 0) {
    delete installed[skill.slug]
  }
  saveInstalled(installed)

  if (removedCount > 0) {
    console.log(`\n  ${symbols.check} ${colors.green('Done!')} Removed from ${removedCount} client(s).\n`)
    logAction('skill-remove', skill.slug, `from ${targetClients.join(', ')}`)
  }
}

/**
 * Lists all available skills (or filtered by category).
 */
export function listSkills(options: { category?: string; installed?: boolean }): void {
  if (options.installed) {
    showInstalledSkills()
    return
  }

  // Combine builtin + custom skills
  const customSkills = getCustomSkills()
  let skills = [...ALL_SKILLS, ...customSkills]
  if (options.category) {
    skills = skills.filter((s) => s.category === options.category)
  }

  console.log(header(`${skills.length} skills available (${ALL_SKILLS.length} builtin + ${customSkills.length} custom)`))

  if (skills.length === 0) {
    console.log(`  ${colors.gray('No skills found. Try a different category.')}\n`)
    return
  }

  const installed = loadInstalled()

  // Group by category
  const categories = [...new Set(skills.map((s) => s.category))]
  for (const cat of categories) {
    const catInfo = SKILL_CATEGORIES.find((c) => c.slug === cat)
    console.log(`\n  ${colors.bold(catInfo?.name || cat)} ${colors.gray(`(${catInfo?.description || ''})`)}`)

    const catSkills = skills.filter((s) => s.category === cat)
    for (const skill of catSkills) {
      const isInstalled = installed[skill.slug] ? colors.green('✓') : ' '
      const tags = colors.gray(skill.tags.slice(0, 3).join(', '))
      console.log(`    ${isInstalled} ${colors.bold(skill.name.padEnd(22))} ${tags}`)
      console.log(`      ${colors.gray(skill.description)}`)
    }
  }
  console.log()
}

/**
 * Shows only installed skills.
 */
function showInstalledSkills(): void {
  const installed = loadInstalled()
  const slugs = Object.keys(installed)

  if (slugs.length === 0) {
    console.log(header('Installed skills'))
    console.log(`  ${colors.gray('No skills installed yet.')}`)
    console.log(`  ${colors.gray('Browse:')} mcp-hub skill list`)
    console.log(`  ${colors.gray('Install:')} mcp-hub skill install <name>\n`)
    return
  }

  console.log(header(`Installed skills (${slugs.length})`))
  for (const slug of slugs) {
    const skill = findSkill(slug)
    if (!skill) continue
    const info = installed[slug]
    const date = new Date(info.installedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    console.log(`  ${symbols.check} ${colors.bold(skill.name.padEnd(22))} ${colors.gray(`→ ${info.clients.join(', ')}`)}`)
    console.log(`    ${colors.gray(skill.description)}`)
    console.log(`    ${colors.gray(`Installed ${date}`)}`)
  }
  console.log()
}

/**
 * Searches skills by name, description, tag, or category.
 */
export function searchSkillsCmd(query: string): void {
  // Search builtin + custom
  const builtinResults = searchSkills(query)
  const customResults = getCustomSkills().filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.description.toLowerCase().includes(query.toLowerCase()) ||
    s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  )
  const results = [...builtinResults, ...customResults]

  console.log(header(`Search: "${query}" → ${results.length} results`))

  if (results.length === 0) {
    console.log(`  ${colors.gray('No skills found. Try a different query.')}\n`)
    return
  }

  for (const skill of results) {
    console.log(`  ${colors.bold(skill.name.padEnd(22))} ${colors.gray(skill.category)}`)
    console.log(`    ${skill.description}`)
    console.log(`    ${colors.gray(skill.tags.join(', '))}`)
  }
  console.log(`\n  ${colors.gray('Install with:')} mcp-hub skill install <name>\n`)
}

/**
 * Shows detailed info about a skill.
 */
export function showSkillInfo(slug: string): void {
  const skill = findSkill(slug) || findCustomSkill(slug)
  if (!skill) {
    console.log(`\n  ${symbols.cross} Skill "${colors.red(slug)}" not found.\n`)
    return
  }

  const installed = loadInstalled()
  const isInstalled = installed[skill.slug]

  console.log(header(skill.name))
  console.log(`  ${colors.gray('Category:')}   ${skill.category}`)
  console.log(`  ${colors.gray('Tags:')}       ${skill.tags.join(', ')}`)
  console.log(`  ${colors.gray('Author:')}     ${skill.author}`)
  console.log(`  ${colors.gray('Source:')}     ${skill.source}`)
  if (isInstalled) {
    console.log(`  ${colors.gray('Installed:')}  ${colors.green('Yes')} ${colors.gray(`(${isInstalled.clients.join(', ')})`)}`)
  } else {
    console.log(`  ${colors.gray('Installed:')}  No`)
  }
  console.log(`\n  ${colors.bold('Description:')}`)
  console.log(`  ${skill.description}`)
  console.log(`\n  ${colors.bold('Content preview:')}`)
  const preview = skill.content.slice(0, 500)
  console.log(colors.gray(preview))
  if (skill.content.length > 500) {
    console.log(colors.gray(`\n  ... (${skill.content.length - 500} more chars)`))
  }
  console.log(`\n  ${colors.gray('Install with:')} mcp-hub skill install ${skill.slug}\n`)
}

/**
 * Lists all skill categories.
 */
export function listSkillCategories(): void {
  console.log(header('Skill Categories'))
  for (const cat of SKILL_CATEGORIES) {
    const count = getSkillsByCategory(cat.slug).length
    console.log(`  ${symbols.bullet} ${colors.bold(cat.name.padEnd(18))} ${colors.gray(String(count))} skills`)
    console.log(`    ${colors.gray(cat.description)}`)
  }
  console.log()
}
