import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import { colors, symbols, header } from './ui.js'
import { logAction } from './history.js'
import type { Skill } from './skills-data.js'

const CUSTOM_SKILLS_DIR = join(homedir(), '.mcp-hub', 'skills', 'custom')
const CUSTOM_INDEX = join(CUSTOM_SKILLS_DIR, 'index.json')

interface CustomSkill extends Skill {
  sourceUrl: string
  installedAt: string
  updatedAt: string
}

interface CustomIndex {
  [slug: string]: CustomSkill
}

function loadCustomIndex(): CustomIndex {
  if (!existsSync(CUSTOM_INDEX)) return {}
  try {
    return JSON.parse(readFileSync(CUSTOM_INDEX, 'utf-8'))
  } catch {
    return {}
  }
}

function saveCustomIndex(index: CustomIndex): void {
  mkdirSync(dirname(CUSTOM_INDEX), { recursive: true })
  writeFileSync(CUSTOM_INDEX, JSON.stringify(index, null, 2), 'utf-8')
}

/**
 * Converts a GitHub URL to a raw URL for fetching file contents.
 * Handles:
 * - https://github.com/user/repo/blob/main/skill.md
 * - https://github.com/user/repo/blob/main/skills/my-skill.md
 * - https://raw.githubusercontent.com/user/repo/main/skill.md
 */
function toRawUrl(url: string): string {
  // Already raw
  if (url.includes('raw.githubusercontent.com')) {
    return url
  }

  // Convert github.com/blob URL to raw
  const blobMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/)
  if (blobMatch) {
    const [, user, repo, branch, path] = blobMatch
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`
  }

  // Convert github.com/tree URL (directory) — can't fetch directly
  const treeMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/)
  if (treeMatch) {
    const [, user, repo, branch, dirPath] = treeMatch
    // Try fetching README.md or index.md from the directory
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${dirPath}/README.md`
  }

  // Plain github repo URL — fetch README
  const repoMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/)
  if (repoMatch) {
    const [, user, repo] = repoMatch
    return `https://raw.githubusercontent.com/${user}/${repo}/main/README.md`
  }

  return url
}

/**
 * Extracts skill metadata from markdown content.
 * Looks for a YAML frontmatter block or falls back to the first heading.
 */
function parseSkillFromMarkdown(content: string, sourceUrl: string): CustomSkill {
  const slug = sourceUrl
    .split('/')
    .pop()
    ?.replace(/\.md$|README/i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase() || 'custom-skill'

  // Try to extract name from first H1
  const nameMatch = content.match(/^#\s+(.+)$/m)
  const name = nameMatch ? nameMatch[1].trim() : slug

  // Try to extract description from first paragraph after H1
  const descMatch = content.match(/^#\s+.+\n+(.+)$/m)
  const description = descMatch ? descMatch[1].trim().slice(0, 150) : 'Custom skill from GitHub'

  // Try to detect category from content
  let category = 'coding'
  const lowerContent = content.toLowerCase()
  if (lowerContent.includes('security') || lowerContent.includes('vulnerability')) category = 'security'
  else if (lowerContent.includes('marketing') || lowerContent.includes('seo')) category = 'marketing'
  else if (lowerContent.includes('design') || lowerContent.includes('ui') || lowerContent.includes('ux')) category = 'design'
  else if (lowerContent.includes('docker') || lowerContent.includes('kubernetes') || lowerContent.includes('ci/cd')) category = 'devops'
  else if (lowerContent.includes('sql') || lowerContent.includes('data')) category = 'data'
  else if (lowerContent.includes('prompt') || lowerContent.includes('llm') || lowerContent.includes('rag')) category = 'ai'
  else if (lowerContent.includes('business') || lowerContent.includes('startup')) category = 'business'
  else if (lowerContent.includes('writing') || lowerContent.includes('copy')) category = 'writing'

  // Extract author from URL
  const authorMatch = sourceUrl.match(/github\.com\/([^/]+)/)
  const author = authorMatch ? `@${authorMatch[1]}` : '@custom'

  const now = new Date().toISOString()

  return {
    slug,
    name,
    description,
    category,
    tags: ['custom', 'github'],
    author,
    source: sourceUrl,
    sourceUrl,
    content,
    installedAt: now,
    updatedAt: now,
  }
}

/**
 * Adds a custom skill from a GitHub URL.
 * Fetches the markdown content, parses it, and saves it locally.
 */
export async function addCustomSkill(githubUrl: string): Promise<void> {
  console.log(header('Adding custom skill'))

  const rawUrl = toRawUrl(githubUrl)
  console.log(`  ${colors.gray('Fetching:')} ${rawUrl}\n`)

  try {
    const res = await fetch(rawUrl, {
      headers: { 'User-Agent': 'mcp-hub' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.log(`  ${symbols.cross} Failed to fetch: ${res.status} ${res.statusText}`)
      console.log(`  ${colors.gray('Make sure the URL is correct and the file is public.')}\n`)
      return
    }

    const content = await res.text()

    if (!content || content.length < 50) {
      console.log(`  ${symbols.cross} File is empty or too short to be a skill.\n`)
      return
    }

    const skill = parseSkillFromMarkdown(content, githubUrl)
    const index = loadCustomIndex()
    index[skill.slug] = skill
    saveCustomIndex(index)

    console.log(`  ${symbols.check} ${colors.green('Skill added!')}\n`)
    console.log(`  ${colors.bold('Name:')}       ${skill.name}`)
    console.log(`  ${colors.bold('Slug:')}        ${skill.slug}`)
    console.log(`  ${colors.bold('Category:')}    ${skill.category}`)
    console.log(`  ${colors.bold('Author:')}      ${skill.author}`)
    console.log(`  ${colors.bold('Content:')}     ${skill.content.length} chars`)
    console.log(`  ${colors.bold('Source:')}      ${skill.sourceUrl}`)
    console.log(`\n  ${colors.gray('Install with:')} mcp-hub skill install ${skill.slug}`)
    console.log(`  ${colors.gray('Update with:')}   mcp-hub skill update ${skill.slug}\n`)

    logAction('skill-add', skill.slug, `from ${githubUrl}`)
  } catch (err) {
    console.log(`  ${symbols.cross} Failed to fetch skill: ${err instanceof Error ? err.message : 'unknown error'}\n`)
  }
}

/**
 * Updates a custom skill by re-fetching from its source URL.
 */
export async function updateCustomSkill(slug: string): Promise<void> {
  const index = loadCustomIndex()
  const skill = index[slug.toLowerCase()]

  if (!skill) {
    console.log(`\n  ${symbols.cross} Custom skill "${colors.red(slug)}" not found.`)
    console.log(`  ${colors.gray('List custom skills:')} mcp-hub skill list-custom\n`)
    return
  }

  console.log(header(`Updating skill: ${skill.name}`))
  console.log(`  ${colors.gray('Source:')} ${skill.sourceUrl}\n`)

  try {
    const rawUrl = toRawUrl(skill.sourceUrl)
    const res = await fetch(rawUrl, {
      headers: { 'User-Agent': 'mcp-hub' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      console.log(`  ${symbols.cross} Failed to fetch: ${res.status}\n`)
      return
    }

    const content = await res.text()
    const updated = parseSkillFromMarkdown(content, skill.sourceUrl)
    updated.slug = skill.slug // keep original slug
    updated.installedAt = skill.installedAt
    updated.updatedAt = new Date().toISOString()

    index[updated.slug] = updated
    saveCustomIndex(index)

    const changed = content !== skill.content
    if (changed) {
      console.log(`  ${symbols.check} ${colors.green('Updated!')} Content has changed.`)
      console.log(`  ${colors.gray('Old:')} ${skill.content.length} chars`)
      console.log(`  ${colors.gray('New:')} ${updated.content.length} chars`)
      console.log(`\n  ${colors.gray('Reinstall to apply changes:')} mcp-hub skill install ${updated.slug}\n`)
    } else {
      console.log(`  ${symbols.check} ${colors.gray('Already up to date.')}\n`)
    }

    logAction('skill-update', updated.slug, changed ? 'content changed' : 'no changes')
  } catch (err) {
    console.log(`  ${symbols.cross} Failed to update: ${err instanceof Error ? err.message : 'unknown'}\n`)
  }
}

/**
 * Lists all custom skills.
 */
export function listCustomSkills(): void {
  const index = loadCustomIndex()
  const skills = Object.values(index)

  console.log(header(`Custom skills (${skills.length})`))
  console.log(`  ${colors.gray('Location:')} ${CUSTOM_SKILLS_DIR}\n`)

  if (skills.length === 0) {
    console.log(`  ${colors.gray('No custom skills yet.')}`)
    console.log(`  ${colors.gray('Add one with:')} mcp-hub skill add <github-url>`)
    console.log(`  ${colors.gray('Example:')} mcp-hub skill add https://github.com/yaklang/hack-skills\n`)
    return
  }

  for (const skill of skills) {
    const date = new Date(skill.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    console.log(`  ${symbols.bullet} ${colors.bold(skill.name.padEnd(22))} ${colors.gray(`(${skill.category})`)}`)
    console.log(`    ${skill.description}`)
    console.log(`    ${colors.gray(`Updated ${date} · ${skill.content.length} chars`)}`)
    console.log(`    ${colors.gray(skill.sourceUrl)}`)
  }
  console.log()
}

/**
 * Removes a custom skill.
 */
export function removeCustomSkill(slug: string): void {
  const index = loadCustomIndex()
  const lowerSlug = slug.toLowerCase()

  if (!index[lowerSlug]) {
    console.log(`\n  ${symbols.cross} Custom skill "${colors.red(slug)}" not found.\n`)
    return
  }

  const name = index[lowerSlug].name
  delete index[lowerSlug]
  saveCustomIndex(index)

  console.log(`\n  ${symbols.check} Removed custom skill "${name}"\n`)
  logAction('skill-remove-custom', lowerSlug, '')
}

/**
 * Returns all custom skills as Skill[] (for the main skill list/search).
 */
export function getCustomSkills(): Skill[] {
  const index = loadCustomIndex()
  return Object.values(index).map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.description,
    category: s.category,
    tags: s.tags,
    author: s.author,
    source: s.source,
    content: s.content,
  }))
}

/**
 * Finds a custom skill by slug.
 */
export function findCustomSkill(slug: string): CustomSkill | undefined {
  const index = loadCustomIndex()
  return index[slug.toLowerCase()]
}
