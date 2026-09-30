import { existsSync, readFileSync } from 'fs'
import { execSync } from 'child_process'
import { colors, symbols, header } from './ui.js'
import { logAction } from './history.js'
import { GITHUB_REPO } from './constants.js'

interface ServerPublishData {
  slug: string
  name: string
  description: string
  author: string
  repoUrl: string
  homepage?: string
  installCmd: string
  category: string
  tags: string[]
}

/**
 * Publishes a new MCP server to the directory.
 *
 * 1. Reads the current directory's package.json
 * 2. Generates a server entry template
 * 3. Copies it to clipboard
 * 4. Opens a browser to create a PR
 *
 * Works from the server author's project directory.
 */
export function publishServer(options: { category?: string }): void {
  console.log(header('Publish your MCP server'))

  // Step 1: Check for package.json
  if (!existsSync('package.json')) {
    console.log(`  ${symbols.cross} No package.json found in current directory.`)
    console.log(`  ${colors.gray('Run this command from your MCP server project root.')}`)
    console.log(`  ${colors.gray('Or use `mcp-hub init <name>` to scaffold a new server first.')}\n`)
    return
  }

  // Step 2: Read package.json
  let pkg: any
  try {
    pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
  } catch {
    console.log(`  ${symbols.cross} Invalid package.json\n`)
    return
  }

  const name = pkg.name || ''
  const description = pkg.description || ''
  const homepage = pkg.homepage || undefined

  if (!name) {
    console.log(`  ${symbols.cross} package.json is missing "name" field\n`)
    return
  }

  // Step 3: Get git remote URL
  let repoUrl = ''
  try {
    repoUrl = execSync('git remote get-url origin', { encoding: 'utf-8', timeout: 5000 }).trim()
    // Convert SSH to HTTPS
    if (repoUrl.startsWith('git@github.com:')) {
      repoUrl = repoUrl.replace('git@github.com:', 'https://github.com/')
    }
    if (repoUrl.endsWith('.git')) {
      repoUrl = repoUrl.slice(0, -4)
    }
  } catch {
    // no git remote
  }

  if (!repoUrl) {
    console.log(`  ${symbols.cross} No git remote found.`)
    console.log(`  ${colors.gray('Add a remote first:')} git remote add origin https://github.com/you/your-server\n`)
    return
  }

  // Extract author from repo URL
  const repoMatch = repoUrl.match(/github\.com\/([^/]+)\//)
  const author = repoMatch ? `@${repoMatch[1]}` : '@unknown'

  // Generate slug from package name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-mcp-?server/g, '')
    .replace(/-server$/, '') || name

  // Step 4: Detect install command
  let installCmd = `npx -y ${name}`
  if (pkg.bin) {
    const binName = typeof pkg.bin === 'string' ? pkg.bin : Object.keys(pkg.bin)[0]
    if (binName) {
      installCmd = `npx -y ${name}`
    }
  }

  // Step 5: Show what we found
  console.log(`  ${colors.gray('Detected from package.json + git:')}\n`)
  console.log(`  ${colors.bold('Name:')}        ${name}`)
  console.log(`  ${colors.bold('Slug:')}         ${slug}`)
  console.log(`  ${colors.bold('Description:')}  ${description || colors.gray('(none)')}`)
  console.log(`  ${colors.bold('Author:')}       ${author}`)
  console.log(`  ${colors.bold('Repo:')}         ${repoUrl}`)
  if (homepage) {
    console.log(`  ${colors.bold('Homepage:')}     ${homepage}`)
  }
  console.log(`  ${colors.bold('Install:')}      ${installCmd}`)

  // Step 6: Category
  const category = options.category || ''
  if (!category) {
    console.log(`\n  ${colors.yellow('⚠ No category specified.')}`)
    console.log(`  ${colors.gray('Categories:')} database, search, filesystem, api, productivity,`)
    console.log(`                devtools, cloud, communication, data, ai`)
    console.log(`  ${colors.gray('Use:')} mcp-hub publish --category <category>\n`)
    return
  }

  const validCategories = ['database', 'search', 'filesystem', 'api', 'productivity', 'devtools', 'cloud', 'communication', 'data', 'ai']
  if (!validCategories.includes(category)) {
    console.log(`\n  ${symbols.cross} Invalid category "${colors.red(category)}"`)
    console.log(`  ${colors.gray('Valid:')} ${validCategories.join(', ')}\n`)
    return
  }

  // Step 7: Generate the entry
  const tags = [category, name.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 20)]
  if (description) {
    // Extract keywords from description
    const words = description.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3)
    tags.push(...words.slice(0, 3))
  }

  const entry = generateEntry({
    slug,
    name: name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    description: description || 'An MCP server',
    author,
    repoUrl,
    homepage,
    installCmd,
    category,
    tags: [...new Set(tags)].slice(0, 5),
  })

  // Step 8: Show the entry
  console.log(`\n  ${colors.bold('Generated entry for scripts/seed.ts:')}\n`)
  console.log(colors.gray(entry))
  console.log(`\n  ${colors.gray('─'.repeat(46))}`)

  // Step 9: Copy to clipboard (best-effort)
  try {
    execSync('echo ' + JSON.stringify(entry) + ' | xclip -selection clipboard 2>/dev/null || echo ' + JSON.stringify(entry) + ' | pbcopy 2>/dev/null || echo ' + JSON.stringify(entry) + ' | clip 2>/dev/null', { stdio: 'ignore', timeout: 3000 })
    console.log(`\n  ${symbols.check} ${colors.green('Copied to clipboard!')}`)
  } catch {
    // clipboard not available
  }

  // Step 10: Open PR
  console.log(`\n  ${colors.bold('Next steps:')}`)
  console.log(`    ${colors.gray('1.')} Fork the repo: ${GITHUB_REPO}`)
  console.log(`    ${colors.gray('2.')} Add the entry above to scripts/seed.ts`)
  console.log(`    ${colors.gray('3.')} Run: bun run scripts/export-registry.ts`)
  console.log(`    ${colors.gray('4.')} Open a PR`)
  console.log()
  console.log(`  ${colors.gray('Or open a new issue with the "server-request" template:')}`)
  console.log(`  ${colors.cyan(`${GITHUB_REPO}/issues/new?template=server_request.md`)}\n`)

  // Try to open browser
  try {
    const url = `${GITHUB_REPO}/issues/new?template=server_request.md&title=[Server+Request]+Add+MCP+server+for+${encodeURIComponent(name)}`
    execSync(`xdg-open "${url}" 2>/dev/null || open "${url}" 2>/dev/null || start "${url}" 2>/dev/null`, { stdio: 'ignore', timeout: 3000 })
    console.log(`  ${symbols.check} ${colors.gray('Opened browser to submit form')}\n`)
  } catch {
    // no browser
  }

  logAction('publish', slug, `category: ${category}`)
}

function generateEntry(data: ServerPublishData): string {
  const configJson = JSON.stringify({
    mcpServers: {
      [data.slug]: {
        command: 'npx',
        args: ['-y', data.installCmd.replace('npx -y ', '')],
        ...(data.homepage ? {} : {}),
      },
    },
  }, null, 2)

  return `{
  slug: '${data.slug}',
  name: '${data.name}',
  description: '${data.description}',
  longDescription: '${data.description}',
  author: '${data.author}',
  repoUrl: '${data.repoUrl}',
  ${data.homepage ? `homepage: '${data.homepage}',\n  ` : ''}category: '${data.category}',
  tags: ${JSON.stringify(data.tags)},
  installCmd: '${data.installCmd}',
  configJson: JSON.stringify(${configJson}, null, 2),
  stars: 0,
  featured: false,
  verified: true
}`
}
