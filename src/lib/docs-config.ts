export interface DocPage {
  slug: string
  title: string
  description: string
  category: string
}

export interface DocCategory {
  id: string
  title: string
  icon: string
}

export const DOC_CATEGORIES: DocCategory[] = [
  { id: 'getting-started', title: 'Getting Started', icon: 'Rocket' },
  { id: 'cli', title: 'CLI Reference', icon: 'Terminal' },
  { id: 'guides', title: 'Guides', icon: 'Book' },
  { id: 'api', title: 'API Reference', icon: 'Code' },
  { id: 'contributing', title: 'Contributing', icon: 'Users' },
]

export const DOC_PAGES: DocPage[] = [
  // Getting Started
  { slug: 'introduction', title: 'Introduction', description: 'What MCP Hub is and why it exists', category: 'getting-started' },
  { slug: 'installation', title: 'Installation', description: 'Install the CLI globally or use with npx', category: 'getting-started' },
  { slug: 'quickstart', title: 'Quick Start', description: 'Install your first MCP server in 60 seconds', category: 'getting-started' },
  { slug: 'how-it-works', title: 'How It Works', description: 'Architecture and design decisions', category: 'getting-started' },

  // CLI Reference
  { slug: 'install', title: 'mcp-hub install', description: 'Install a server into your AI clients', category: 'cli' },
  { slug: 'list', title: 'mcp-hub list', description: 'Browse and filter all available servers', category: 'cli' },
  { slug: 'search', title: 'mcp-hub search', description: 'Search servers by name, tag, or description', category: 'cli' },
  { slug: 'doctor', title: 'mcp-hub doctor', description: 'Diagnose config issues and find broken servers', category: 'cli' },
  { slug: 'backup', title: 'mcp-hub backup & restore', description: 'Back up and restore all your configs', category: 'cli' },
  { slug: 'bundle', title: 'mcp-hub bundle', description: 'Share your MCP setup as a portable file', category: 'cli' },
  { slug: 'init', title: 'mcp-hub init', description: 'Scaffold a new MCP server from a template', category: 'cli' },
  { slug: 'update', title: 'mcp-hub update', description: 'Update installed servers to latest configs', category: 'cli' },

  // Guides
  { slug: 'first-server', title: 'Install Your First Server', description: 'Step-by-step: GitHub MCP in Claude Desktop', category: 'guides' },
  { slug: 'share-setup', title: 'Share Your Setup', description: 'Export your config and share with teammates', category: 'guides' },
  { slug: 'build-server', title: 'Build a Custom Server', description: 'Create and publish your own MCP server', category: 'guides' },
  { slug: 'diagnose-issues', title: 'Diagnose Issues', description: 'Use doctor to find and fix broken configs', category: 'guides' },
  { slug: 'multiple-clients', title: 'Multiple Clients', description: 'Manage MCP servers across Claude, Cursor, Cline, Windsurf', category: 'guides' },

  // API Reference
  { slug: 'search-api', title: 'Search API', description: 'GET /api/search — search the directory', category: 'api' },
  { slug: 'recommend-api', title: 'Recommend API', description: 'POST /api/recommend — AI-powered recommendations', category: 'api' },
  { slug: 'servers-api', title: 'Servers API', description: 'GET /api/servers — list and filter servers', category: 'api' },

  // Contributing
  { slug: 'add-server', title: 'Add a Server', description: 'Submit your MCP server to the directory', category: 'contributing' },
  { slug: 'add-client', title: 'Add a Client', description: 'Add support for a new AI client', category: 'contributing' },
  { slug: 'development', title: 'Development Setup', description: 'Run MCP Hub locally for development', category: 'contributing' },
]

export function getPagesByCategory(categoryId: string): DocPage[] {
  return DOC_PAGES.filter((p) => p.category === categoryId)
}

export function getPage(slug: string): DocPage | undefined {
  return DOC_PAGES.find((p) => p.slug === slug)
}

export function getAdjacentPages(currentSlug: string): { prev?: DocPage; next?: DocPage } {
  const idx = DOC_PAGES.findIndex((p) => p.slug === currentSlug)
  return {
    prev: idx > 0 ? DOC_PAGES[idx - 1] : undefined,
    next: idx < DOC_PAGES.length - 1 ? DOC_PAGES[idx + 1] : undefined,
  }
}
