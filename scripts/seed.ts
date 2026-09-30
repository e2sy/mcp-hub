import { db } from '@/lib/db'

const categories = [
  { slug: 'database', name: 'Database', icon: 'Database', description: 'Query and manage databases directly from your AI assistant' },
  { slug: 'search', name: 'Search', icon: 'Search', description: 'Web search and retrieval capabilities' },
  { slug: 'filesystem', name: 'File System', icon: 'FolderOpen', description: 'Read, write, and manage local files' },
  { slug: 'api', name: 'APIs', icon: 'Plug', description: 'Connect to external APIs and services' },
  { slug: 'productivity', name: 'Productivity', icon: 'Zap', description: 'Notion, Slack, Linear, and other work tools' },
  { slug: 'devtools', name: 'Dev Tools', icon: 'Terminal', description: 'Git, GitHub, Docker, and development workflows' },
  { slug: 'cloud', name: 'Cloud', icon: 'Cloud', description: 'AWS, GCP, Azure, and cloud infrastructure' },
  { slug: 'communication', name: 'Communication', icon: 'MessageSquare', description: 'Email, chat, and messaging integrations' },
  { slug: 'data', name: 'Data', icon: 'BarChart3', description: 'Analytics, metrics, and data pipelines' },
  { slug: 'ai', name: 'AI & ML', icon: 'BrainCircuit', description: 'AI model access and ML workflows' },
]

interface ServerSeed {
  slug: string
  name: string
  description: string
  longDescription: string
  author: string
  repoUrl: string
  homepage?: string
  category: string
  tags: string[]
  installCmd: string
  configJson: string
  stars: number
  featured: boolean
  verified: boolean
}

const servers: ServerSeed[] = [
  {
    slug: 'postgres',
    name: 'PostgreSQL',
    description: 'Query and manage your PostgreSQL databases with read/write access',
    longDescription: 'Connect Claude or Cursor directly to your PostgreSQL database. Run SELECT queries, inspect schemas, and even perform write operations with proper guardrails. Perfect for data exploration without leaving your AI assistant.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    homepage: 'https://modelcontextprotocol.io',
    category: 'database',
    tags: ['sql', 'postgres', 'database', 'query'],
    installCmd: 'npx -y @modelcontextprotocol/server-postgres "postgresql://user:pass@localhost:5432/db"',
    configJson: JSON.stringify({
      mcpServers: {
        postgres: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-postgres', 'postgresql://user:pass@localhost:5432/db']
        }
      }
    }, null, 2),
    stars: 4200,
    featured: true,
    verified: true
  },
  {
    slug: 'sqlite',
    name: 'SQLite',
    description: 'Lightweight SQLite database access for local development and prototyping',
    longDescription: 'A lightweight MCP server for SQLite. Great for local development, prototyping, and small applications. Supports schema inspection, queries, and basic CRUD operations.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    category: 'database',
    tags: ['sql', 'sqlite', 'database', 'local'],
    installCmd: 'npx -y @modelcontextprotocol/server-sqlite --db-path ./app.db',
    configJson: JSON.stringify({
      mcpServers: {
        sqlite: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './app.db']
        }
      }
    }, null, 2),
    stars: 2100,
    featured: false,
    verified: true
  },
  {
    slug: 'supabase',
    name: 'Supabase',
    description: 'Manage Supabase projects, databases, auth, and storage from your AI',
    longDescription: 'Full Supabase integration — manage databases, run migrations, query data, manage auth users, and handle storage buckets without leaving Cursor or Claude Desktop.',
    author: '@supabase',
    repoUrl: 'https://github.com/supabase/mcp-server-supabase',
    homepage: 'https://supabase.com',
    category: 'database',
    tags: ['supabase', 'postgres', 'auth', 'storage', 'backend'],
    installCmd: 'npx -y @supabase/mcp-server-supabase@latest --access-token YOUR_TOKEN',
    configJson: JSON.stringify({
      mcpServers: {
        supabase: {
          command: 'npx',
          args: ['-y', '@supabase/mcp-server-supabase@latest', '--access-token', 'YOUR_TOKEN']
        }
      }
    }, null, 2),
    stars: 1850,
    featured: true,
    verified: true
  },
  {
    slug: 'mongodb',
    name: 'MongoDB',
    description: 'Query and manage MongoDB collections with full aggregation pipeline support',
    longDescription: 'Connect to MongoDB clusters, browse collections, run aggregations, and manage indexes. Supports both local and Atlas connections.',
    author: '@mongodb-js',
    repoUrl: 'https://github.com/mongodb-js/mongodb-mcp-server',
    category: 'database',
    tags: ['mongodb', 'nosql', 'database', 'atlas'],
    installCmd: 'npx -y mongodb-mcp-server --connectionString mongodb://localhost:27017',
    configJson: JSON.stringify({
      mcpServers: {
        mongodb: {
          command: 'npx',
          args: ['-y', 'mongodb-mcp-server', '--connectionString', 'mongodb://localhost:27017']
        }
      }
    }, null, 2),
    stars: 980,
    featured: false,
    verified: true
  },
  {
    slug: 'brave-search',
    name: 'Brave Search',
    description: 'Web and local search powered by Brave Search API',
    longDescription: 'Give your AI assistant real-time web search capabilities. Brave Search offers privacy-focused search with both web and local results. Requires a free Brave Search API key.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    category: 'search',
    tags: ['search', 'web', 'brave', 'api'],
    installCmd: 'npx -y @modelcontextprotocol/server-brave-search',
    configJson: JSON.stringify({
      mcpServers: {
        'brave-search': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-brave-search'],
          env: { BRAVE_API_KEY: 'YOUR_API_KEY' }
        }
      }
    }, null, 2),
    stars: 3100,
    featured: true,
    verified: true
  },
  {
    slug: 'tavily',
    name: 'Tavily Search',
    description: 'AI-optimized web search built for LLMs and agents',
    longDescription: 'Tavily is a search engine specifically built for AI agents and LLMs. Returns clean, relevant results optimized for AI consumption. Great for research workflows.',
    author: '@tavily-ai',
    repoUrl: 'https://github.com/tavily-ai/tavily-mcp',
    homepage: 'https://tavily.com',
    category: 'search',
    tags: ['search', 'ai', 'research', 'web'],
    installCmd: 'npx -y tavily-mcp@latest',
    configJson: JSON.stringify({
      mcpServers: {
        tavily: {
          command: 'npx',
          args: ['-y', 'tavily-mcp@latest'],
          env: { TAVILY_API_KEY: 'YOUR_API_KEY' }
        }
      }
    }, null, 2),
    stars: 1420,
    featured: false,
    verified: true
  },
  {
    slug: 'exa',
    name: 'Exa Search',
    description: 'Neural search engine for finding the most relevant content',
    longDescription: 'Exa provides neural-powered search that understands semantics, not just keywords. Perfect for research, finding similar content, and retrieving specific types of pages.',
    author: '@exa-labs',
    repoUrl: 'https://github.com/exa-labs/exa-mcp-server',
    homepage: 'https://exa.ai',
    category: 'search',
    tags: ['search', 'neural', 'ai', 'research'],
    installCmd: 'npx -y exa-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        exa: {
          command: 'npx',
          args: ['-y', 'exa-mcp-server'],
          env: { EXA_API_KEY: 'YOUR_API_KEY' }
        }
      }
    }, null, 2),
    stars: 870,
    featured: false,
    verified: true
  },
  {
    slug: 'filesystem',
    name: 'Filesystem',
    description: 'Read, write, and manage local files with configurable access boundaries',
    longDescription: 'The official filesystem MCP server. Allows your AI assistant to read, write, create directories, move, and search files. Configure which directories are accessible for safety.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    category: 'filesystem',
    tags: ['files', 'filesystem', 'local', 'io'],
    installCmd: 'npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir',
    configJson: JSON.stringify({
      mcpServers: {
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir']
        }
      }
    }, null, 2),
    stars: 5400,
    featured: true,
    verified: true
  },
  {
    slug: 'fetch',
    name: 'Fetch',
    description: 'Fetch and process web content with automatic markdown conversion',
    longDescription: 'A simple but powerful fetch server that retrieves web pages and converts them to markdown for easy AI consumption. Handles redirects, JS-rendered pages, and pagination.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    category: 'api',
    tags: ['fetch', 'http', 'web', 'scraping'],
    installCmd: 'npx -y @modelcontextprotocol/server-fetch',
    configJson: JSON.stringify({
      mcpServers: {
        fetch: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-fetch']
        }
      }
    }, null, 2),
    stars: 2800,
    featured: false,
    verified: true
  },
  {
    slug: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation for scraping, testing, and interacting with web pages',
    longDescription: 'Full browser automation via Puppeteer. Navigate, click, type, screenshot, and extract content from any web page — even JavaScript-heavy SPAs.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    category: 'api',
    tags: ['puppeteer', 'browser', 'automation', 'scraping'],
    installCmd: 'npx -y @modelcontextprotocol/server-puppeteer',
    configJson: JSON.stringify({
      mcpServers: {
        puppeteer: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-puppeteer']
        }
      }
    }, null, 2),
    stars: 3900,
    featured: true,
    verified: true
  },
  {
    slug: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Dynamic problem-solving through structured, step-by-step reasoning',
    longDescription: 'A specialized MCP server that helps AI assistants break down complex problems into sequential steps. Great for debugging, planning, and multi-step reasoning tasks.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking',
    category: 'ai',
    tags: ['reasoning', 'thinking', 'planning', 'problem-solving'],
    installCmd: 'npx -y @modelcontextprotocol/server-sequential-thinking',
    configJson: JSON.stringify({
      mcpServers: {
        'sequential-thinking': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
        }
      }
    }, null, 2),
    stars: 2600,
    featured: false,
    verified: true
  },
  {
    slug: 'memory',
    name: 'Memory',
    description: 'Persistent knowledge graph for long-term memory across conversations',
    longDescription: 'A knowledge graph-based memory system that persists across sessions. Your AI assistant can remember entities, relationships, and observations — building up contextual knowledge over time.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    category: 'ai',
    tags: ['memory', 'knowledge-graph', 'persistence', 'context'],
    installCmd: 'npx -y @modelcontextprotocol/server-memory',
    configJson: JSON.stringify({
      mcpServers: {
        memory: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-memory']
        }
      }
    }, null, 2),
    stars: 3300,
    featured: true,
    verified: true
  },
  {
    slug: 'notion',
    name: 'Notion',
    description: 'Search, read, and update your Notion workspace',
    longDescription: 'Full Notion integration — search pages, read content, create new pages, update databases, and manage comments. Perfect for AI-assisted note-taking and project management.',
    author: '@makeproservices',
    repoUrl: 'https://github.com/makenotion/notion-mcp-server',
    homepage: 'https://notion.so',
    category: 'productivity',
    tags: ['notion', 'notes', 'docs', 'workspace'],
    installCmd: 'npx -y @notionhq/notion-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        notion: {
          command: 'npx',
          args: ['-y', '@notionhq/notion-mcp-server'],
          env: { OPENAPI_MCP_HEADERS: '{"Authorization":"Bearer YOUR_TOKEN","Notion-Version":"2022-06-28"}' }
        }
      }
    }, null, 2),
    stars: 2150,
    featured: true,
    verified: true
  },
  {
    slug: 'slack',
    name: 'Slack',
    description: 'Read and send Slack messages, search channels, and manage notifications',
    longDescription: 'Integrate Slack directly into your AI workflow. Search messages, read channel history, send new messages, and even create channels. Bot token required.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    category: 'productivity',
    tags: ['slack', 'messaging', 'team', 'communication'],
    installCmd: 'npx -y @modelcontextprotocol/server-slack',
    configJson: JSON.stringify({
      mcpServers: {
        slack: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-slack'],
          env: { SLACK_BOT_TOKEN: 'xoxb-your-token' }
        }
      }
    }, null, 2),
    stars: 1980,
    featured: false,
    verified: true
  },
  {
    slug: 'linear',
    name: 'Linear',
    description: 'Manage Linear issues, projects, and cycles from your AI assistant',
    longDescription: 'Create, update, and query Linear issues. Search across projects, manage cycles, and triage bugs without leaving your editor or chat.',
    author: '@linear',
    repoUrl: 'https://github.com/linear/linear-mcp-server',
    homepage: 'https://linear.app',
    category: 'productivity',
    tags: ['linear', 'issues', 'project-management', 'tickets'],
    installCmd: 'npx -y linear-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        linear: {
          command: 'npx',
          args: ['-y', 'linear-mcp-server'],
          env: { LINEAR_API_KEY: 'YOUR_API_KEY' }
        }
      }
    }, null, 2),
    stars: 1240,
    featured: false,
    verified: true
  },
  {
    slug: 'google-drive',
    name: 'Google Drive',
    description: 'Search and read files from your Google Drive',
    longDescription: 'Search across your Google Drive, read document content, and retrieve metadata. Great for finding context without leaving your AI assistant.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-drive',
    category: 'productivity',
    tags: ['google', 'drive', 'docs', 'search'],
    installCmd: 'npx -y @modelcontextprotocol/server-google-drive',
    configJson: JSON.stringify({
      mcpServers: {
        'google-drive': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-google-drive']
        }
      }
    }, null, 2),
    stars: 1750,
    featured: false,
    verified: true
  },
  {
    slug: 'github',
    name: 'GitHub',
    description: 'Manage repositories, issues, PRs, and more from your AI assistant',
    longDescription: 'Full GitHub integration. Create issues, review PRs, manage branches, search code, create releases, and automate your entire GitHub workflow with natural language.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    homepage: 'https://github.com',
    category: 'devtools',
    tags: ['github', 'git', 'repos', 'prs', 'issues'],
    installCmd: 'npx -y @modelcontextprotocol/server-github',
    configJson: JSON.stringify({
      mcpServers: {
        github: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-github'],
          env: { GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_YOUR_TOKEN' }
        }
      }
    }, null, 2),
    stars: 6800,
    featured: true,
    verified: true
  },
  {
    slug: 'gitlab',
    name: 'GitLab',
    description: 'Manage GitLab projects, issues, merge requests, and pipelines',
    longDescription: 'GitLab integration for project management, CI/CD pipeline monitoring, issue tracking, and merge request management. Supports both gitlab.com and self-hosted instances.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab',
    category: 'devtools',
    tags: ['gitlab', 'git', 'ci-cd', 'devops'],
    installCmd: 'npx -y @modelcontextprotocol/server-gitlab',
    configJson: JSON.stringify({
      mcpServers: {
        gitlab: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-gitlab'],
          env: { GITLAB_PERSONAL_ACCESS_TOKEN: 'YOUR_TOKEN' }
        }
      }
    }, null, 2),
    stars: 1450,
    featured: false,
    verified: true
  },
  {
    slug: 'sentry',
    name: 'Sentry',
    description: 'Retrieve and analyze error reports from your Sentry projects',
    longDescription: 'Pull error traces, stack traces, and issue details from Sentry. Let your AI assistant investigate bugs, suggest fixes, and triage errors in context.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sentry',
    homepage: 'https://sentry.io',
    category: 'devtools',
    tags: ['sentry', 'errors', 'monitoring', 'debugging'],
    installCmd: 'npx -y @modelcontextprotocol/server-sentry',
    configJson: JSON.stringify({
      mcpServers: {
        sentry: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-sentry'],
          env: { SENTRY_AUTH_TOKEN: 'YOUR_TOKEN' }
        }
      }
    }, null, 2),
    stars: 1320,
    featured: false,
    verified: true
  },
  {
    slug: 'aws',
    name: 'AWS',
    description: 'Manage AWS resources, services, and infrastructure',
    longDescription: 'Interact with AWS services through natural language. Manage EC2, S3, Lambda, RDS, and dozens of other services. Requires AWS credentials configured locally.',
    author: '@awslabs',
    repoUrl: 'https://github.com/awslabs/mcp',
    homepage: 'https://aws.amazon.com',
    category: 'cloud',
    tags: ['aws', 'cloud', 'ec2', 's3', 'lambda'],
    installCmd: 'npx -y @awslabs/mcp-aws',
    configJson: JSON.stringify({
      mcpServers: {
        aws: {
          command: 'npx',
          args: ['-y', '@awslabs/mcp-aws']
        }
      }
    }, null, 2),
    stars: 2900,
    featured: true,
    verified: true
  },
  {
    slug: 'cloudflare',
    name: 'Cloudflare',
    description: 'Manage Cloudflare Workers, KV, R2, D1, and other Cloudflare services',
    longDescription: 'Deploy Workers, manage KV stores, upload to R2 buckets, query D1 databases, and configure DNS — all from your AI assistant. Account ID and API token required.',
    author: '@cloudflare',
    repoUrl: 'https://github.com/cloudflare/mcp-server-cloudflare',
    homepage: 'https://cloudflare.com',
    category: 'cloud',
    tags: ['cloudflare', 'workers', 'edge', 'cdn'],
    installCmd: 'npx -y @cloudflare/mcp-server-cloudflare',
    configJson: JSON.stringify({
      mcpServers: {
        cloudflare: {
          command: 'npx',
          args: ['-y', '@cloudflare/mcp-server-cloudflare'],
          env: { CLOUDFLARE_ACCOUNT_ID: 'YOUR_ID', CLOUDFLARE_API_TOKEN: 'YOUR_TOKEN' }
        }
      }
    }, null, 2),
    stars: 1670,
    featured: false,
    verified: true
  },
  {
    slug: 'vercel',
    name: 'Vercel',
    description: 'Manage Vercel deployments, projects, and environment variables',
    longDescription: 'Deploy, inspect, and manage your Vercel projects. View deployment logs, manage env vars, promote deployments to production, and analyze performance.',
    author: '@vercel',
    repoUrl: 'https://github.com/vercel/vercel-mcp-server',
    homepage: 'https://vercel.com',
    category: 'cloud',
    tags: ['vercel', 'deploy', 'hosting', 'nextjs'],
    installCmd: 'npx -y vercel-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        vercel: {
          command: 'npx',
          args: ['-y', 'vercel-mcp-server'],
          env: { VERCEL_API_TOKEN: 'YOUR_TOKEN' }
        }
      }
    }, null, 2),
    stars: 1180,
    featured: false,
    verified: true
  },
  {
    slug: 'gmail',
    name: 'Gmail',
    description: 'Read, send, and manage Gmail messages with full search support',
    longDescription: 'Full Gmail integration. Search emails, read threads, send replies, apply labels, and manage your inbox with natural language commands.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gmail',
    category: 'communication',
    tags: ['gmail', 'email', 'google', 'mail'],
    installCmd: 'npx -y @modelcontextprotocol/server-gmail',
    configJson: JSON.stringify({
      mcpServers: {
        gmail: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-gmail'],
          env: { GMAIL_OAUTH_CREDENTIALS: 'YOUR_CREDENTIALS' }
        }
      }
    }, null, 2),
    stars: 2240,
    featured: false,
    verified: true
  },
  {
    slug: 'discord',
    name: 'Discord',
    description: 'Read and send Discord messages, manage channels and roles',
    longDescription: 'Connect to Discord servers, read message history, send messages, manage channels, and moderate. Bot token required.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/discord',
    category: 'communication',
    tags: ['discord', 'chat', 'bot', 'community'],
    installCmd: 'npx -y @modelcontextprotocol/server-discord',
    configJson: JSON.stringify({
      mcpServers: {
        discord: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-discord'],
          env: { DISCORD_TOKEN: 'YOUR_BOT_TOKEN' }
        }
      }
    }, null, 2),
    stars: 1560,
    featured: false,
    verified: true
  },
  {
    slug: 'stripe',
    name: 'Stripe',
    description: 'Manage payments, customers, subscriptions, and view revenue data',
    longDescription: 'Full Stripe integration. Query charges, manage customers, handle subscriptions, issue refunds, and analyze revenue. Perfect for SaaS founders and finance teams.',
    author: '@stripe',
    repoUrl: 'https://github.com/stripe/agent-toolkit',
    homepage: 'https://stripe.com',
    category: 'data',
    tags: ['stripe', 'payments', 'saas', 'billing'],
    installCmd: 'npx -y @stripe/mcp-stripe',
    configJson: JSON.stringify({
      mcpServers: {
        stripe: {
          command: 'npx',
          args: ['-y', '@stripe/mcp-stripe'],
          env: { STRIPE_SECRET_KEY: 'sk_live_YOUR_KEY' }
        }
      }
    }, null, 2),
    stars: 2480,
    featured: true,
    verified: true
  },
  {
    slug: 'analytics',
    name: 'Google Analytics',
    description: 'Query traffic, engagement, and conversion data from GA4',
    longDescription: 'Pull analytics data directly into your AI conversations. Query pageviews, sessions, conversions, user demographics, and traffic sources using natural language.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-analytics',
    category: 'data',
    tags: ['analytics', 'google', 'traffic', 'metrics'],
    installCmd: 'npx -y @modelcontextprotocol/server-google-analytics',
    configJson: JSON.stringify({
      mcpServers: {
        analytics: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-google-analytics'],
          env: { GA_PROPERTY_ID: 'YOUR_ID' }
        }
      }
    }, null, 2),
    stars: 980,
    featured: false,
    verified: true
  },
  {
    slug: 'everart',
    name: 'EverArt',
    description: 'Generate images from text prompts using AI models',
    longDescription: 'AI image generation server. Create images from text descriptions, generate variations, and integrate visual content creation into your AI workflows.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everart',
    category: 'ai',
    tags: ['image', 'generation', 'ai', 'art'],
    installCmd: 'npx -y @modelcontextprotocol/server-everart',
    configJson: JSON.stringify({
      mcpServers: {
        everart: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-everart'],
          env: { EVERART_API_KEY: 'YOUR_KEY' }
        }
      }
    }, null, 2),
    stars: 760,
    featured: false,
    verified: true
  },
  {
    slug: 'openai',
    name: 'OpenAI',
    description: 'Generate embeddings and use OpenAI models as tools within MCP',
    longDescription: 'Use OpenAI models as MCP tools. Generate embeddings for semantic search, run classification, and chain multiple OpenAI calls within your agent workflows.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/openai',
    category: 'ai',
    tags: ['openai', 'embeddings', 'llm', 'ai'],
    installCmd: 'npx -y @modelcontextprotocol/server-openai',
    configJson: JSON.stringify({
      mcpServers: {
        openai: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-openai'],
          env: { OPENAI_API_KEY: 'sk-YOUR_KEY' }
        }
      }
    }, null, 2),
    stars: 1890,
    featured: false,
    verified: true
  },
  {
    slug: 'obsidian',
    name: 'Obsidian',
    description: 'Read and search your Obsidian vault from any AI assistant',
    longDescription: 'Connect your Obsidian vault to AI. Search notes, read content, create new notes, and manage tags — perfect for personal knowledge management workflows.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/obsidian',
    category: 'productivity',
    tags: ['obsidian', 'notes', 'pkm', 'knowledge'],
    installCmd: 'npx -y @modelcontextprotocol/server-obsidian',
    configJson: JSON.stringify({
      mcpServers: {
        obsidian: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-obsidian'],
          env: { OBSIDIAN_VAULT_PATH: '/path/to/vault' }
        }
      }
    }, null, 2),
    stars: 1340,
    featured: false,
    verified: true
  },
  {
    slug: 'time',
    name: 'Time',
    description: 'Get current time, convert timezones, and perform time calculations',
    longDescription: 'Simple but essential. Get the current time in any timezone, convert between timezones, and perform time-based calculations. Great for scheduling and planning workflows.',
    author: '@modelcontextprotocol',
    repoUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/time',
    category: 'devtools',
    tags: ['time', 'timezone', 'date', 'utility'],
    installCmd: 'npx -y @modelcontextprotocol/server-time',
    configJson: JSON.stringify({
      mcpServers: {
        time: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-time']
        }
      }
    }, null, 2),
    stars: 890,
    featured: false,
    verified: true
  },
  // ===== v1.1 additions =====
  {
    slug: 'linear',
    name: 'Linear',
    description: 'Manage Linear issues, projects, and cycles from your AI assistant',
    longDescription: 'Create, update, and query Linear issues. Search across projects, manage cycles, and triage bugs without leaving your editor or chat. Full Linear API access via MCP.',
    author: '@linear',
    repoUrl: 'https://github.com/linear/linear-mcp-server',
    homepage: 'https://linear.app',
    category: 'productivity',
    tags: ['linear', 'issues', 'project-management', 'tickets'],
    installCmd: 'npx -y linear-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        linear: {
          command: 'npx',
          args: ['-y', 'linear-mcp-server'],
          env: { LINEAR_API_KEY: 'YOUR_API_KEY' }
        }
      }
    }, null, 2),
    stars: 1480,
    featured: false,
    verified: true
  },
  {
    slug: 'figma',
    name: 'Figma',
    description: 'Read Figma files, get design tokens, and inspect components',
    longDescription: 'Bring Figma designs into your AI workflow. Read design files, extract design tokens, inspect components, and bridge the gap between design and code.',
    author: '@figma',
    repoUrl: 'https://github.com/figma/figma-mcp-server',
    homepage: 'https://figma.com',
    category: 'productivity',
    tags: ['figma', 'design', 'ui', 'tokens'],
    installCmd: 'npx -y figma-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        figma: {
          command: 'npx',
          args: ['-y', 'figma-mcp-server'],
          env: { FIGMA_ACCESS_TOKEN: 'YOUR_TOKEN' }
        }
      }
    }, null, 2),
    stars: 1120,
    featured: false,
    verified: true
  },
  {
    slug: 'shopify',
    name: 'Shopify',
    description: 'Manage Shopify stores — products, orders, customers, and inventory',
    longDescription: 'Full Shopify admin integration. Manage products, fulfill orders, query customers, and sync inventory. Perfect for ecommerce founders and store managers.',
    author: '@shopify',
    repoUrl: 'https://github.com/shopify/mcp-server',
    homepage: 'https://shopify.com',
    category: 'data',
    tags: ['shopify', 'ecommerce', 'store', 'products'],
    installCmd: 'npx -y @shopify/mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        shopify: {
          command: 'npx',
          args: ['-y', '@shopify/mcp-server'],
          env: { SHOPIFY_ACCESS_TOKEN: 'YOUR_TOKEN', SHOPIFY_STORE: 'your-store.myshopify.com' }
        }
      }
    }, null, 2),
    stars: 890,
    featured: false,
    verified: true
  },
  {
    slug: 'jira',
    name: 'Jira',
    description: 'Create, update, and search Jira issues and sprints',
    longDescription: 'Atlassian Jira integration for issue tracking, sprint management, and project reporting. Create tickets, update status, search with JQL, and manage boards without leaving your AI.',
    author: '@atlassian',
    repoUrl: 'https://github.com/atlassian/atlassian-mcp-server',
    homepage: 'https://atlassian.com',
    category: 'productivity',
    tags: ['jira', 'atlassian', 'issues', 'agile'],
    installCmd: 'npx -y atlassian-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        jira: {
          command: 'npx',
          args: ['-y', 'atlassian-mcp-server'],
          env: { ATLASSIAN_API_TOKEN: 'YOUR_TOKEN', ATLASSIAN_EMAIL: 'you@example.com' }
        }
      }
    }, null, 2),
    stars: 1340,
    featured: false,
    verified: true
  },
  {
    slug: 'twilio',
    name: 'Twilio',
    description: 'Send SMS, make calls, and manage Twilio messaging',
    longDescription: 'Send SMS messages, initiate phone calls, and manage Twilio messaging workflows. Great for notification systems, OTP flows, and customer outreach.',
    author: '@twilio',
    repoUrl: 'https://github.com/twilio/twilio-mcp-server',
    homepage: 'https://twilio.com',
    category: 'communication',
    tags: ['twilio', 'sms', 'phone', 'messaging'],
    installCmd: 'npx -y twilio-mcp-server',
    configJson: JSON.stringify({
      mcpServers: {
        twilio: {
          command: 'npx',
          args: ['-y', 'twilio-mcp-server'],
          env: { TWILIO_ACCOUNT_SID: 'YOUR_SID', TWILIO_AUTH_TOKEN: 'YOUR_TOKEN' }
        }
      }
    }, null, 2),
    stars: 720,
    featured: false,
    verified: true
  }
]

async function seed() {
  console.log('Seeding categories...')
  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: cat,
    })
  }

  console.log('Seeding MCP servers...')
  for (const s of servers) {
    await db.mcpServer.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        longDescription: s.longDescription,
        author: s.author,
        repoUrl: s.repoUrl,
        homepage: s.homepage,
        category: s.category,
        tags: JSON.stringify(s.tags),
        installCmd: s.installCmd,
        configJson: s.configJson,
        stars: s.stars,
        featured: s.featured,
        verified: s.verified,
      },
      create: {
        slug: s.slug,
        name: s.name,
        description: s.description,
        longDescription: s.longDescription,
        author: s.author,
        repoUrl: s.repoUrl,
        homepage: s.homepage,
        category: s.category,
        tags: JSON.stringify(s.tags),
        installCmd: s.installCmd,
        configJson: s.configJson,
        stars: s.stars,
        featured: s.featured,
        verified: s.verified,
      },
    })
  }

  for (const cat of categories) {
    const count = await db.mcpServer.count({ where: { category: cat.slug } })
    await db.category.update({ where: { slug: cat.slug }, data: { count } })
  }

  const total = await db.mcpServer.count()
  const totalCats = await db.category.count()
  console.log(`Seeded ${total} servers across ${totalCats} categories`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
