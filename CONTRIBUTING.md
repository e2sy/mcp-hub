# Contributing to MCP Hub

Thanks for your interest in contributing! This guide covers everything you need to know.

## 🚀 Quick start (local dev)

```bash
git clone https://github.com/e2sy/mcp-hub.git
cd mcp-hub
bun install
bun run db:push
bun run scripts/seed.ts
bun run scripts/export-registry.ts
bun run dev
```

## 🗄️ Adding your MCP server to the directory

This is the most common contribution. Here's how:

### 1. Add your server to the seed file

Open `scripts/seed.ts` and add a new entry to the `servers` array:

```typescript
{
  slug: 'your-server-name',           // kebab-case, unique
  name: 'Your Server Name',           // display name
  description: 'One-line description', // shown in cards & search
  longDescription: 'A longer paragraph...',  // shown on detail page
  author: '@your-github-handle',      // with @ prefix
  repoUrl: 'https://github.com/you/your-server',
  homepage: 'https://your-server.com',  // optional
  category: 'devtools',               // see categories below
  tags: ['tag1', 'tag2', 'tag3'],
  installCmd: 'npx -y your-package-name',
  configJson: JSON.stringify({
    mcpServers: {
      'your-server-name': {
        command: 'npx',
        args: ['-y', 'your-package-name'],
        env: { API_KEY: 'YOUR_KEY' }  // only if needed
      }
    }
  }, null, 2),
  stars: 0,                           // your repo's GitHub star count
  featured: false,                    // leave false — we feature servers manually
  verified: true                      // set true if you're the author
}
```

### 2. Pick the right category

| Slug | Name | Use for |
|------|------|---------|
| `database` | Database | SQL, NoSQL, data stores |
| `search` | Search | Web search, retrieval |
| `filesystem` | File System | Local file access |
| `api` | APIs | External API integrations |
| `productivity` | Productivity | Notion, Slack, work tools |
| `devtools` | Dev Tools | Git, GitHub, Docker, dev workflows |
| `cloud` | Cloud | AWS, GCP, Azure, infra |
| `communication` | Communication | Email, chat, messaging |
| `data` | Data | Analytics, metrics, pipelines |
| `ai` | AI & ML | AI models, embeddings, reasoning |

### 3. Export the registry

```bash
bun run scripts/export-registry.ts
```

This updates both `public/servers.json` (used by the website) and `cli/src/registry.json` (bundled in the CLI).

### 4. Test locally

```bash
# Verify the server appears on the website
bun run dev
# Visit http://localhost:3000/servers

# Verify the CLI picks it up
cd cli && bun run build && node dist/index.js info your-server-name
```

### 5. Open a PR

- Branch name: `add-server/your-server-name`
- PR title: `Add server: Your Server Name`
- Include a link to your server's repo in the PR description

We review submissions within **48 hours**.

## 📝 Guidelines

### Server requirements

- ✅ Must be a real, working MCP server (not vaporware)
- ✅ Must be open source (MIT, Apache, or similar permissive license)
- ✅ Must have a working `npx` or `npm` install command
- ✅ Must include correct config JSON for at least Claude Desktop
- ✅ Repo must have a README with setup instructions

### Quality bar

- The `description` should be one clear sentence (max ~100 chars)
- The `longDescription` should explain what the server does and when to use it (2-4 sentences)
- The `configJson` must be valid JSON that works when pasted directly into a client config file
- Tags should be lowercase, no spaces, 2-5 tags

### What gets you featured

- 500+ GitHub stars
- Active maintenance (commits in the last 30 days)
- Good documentation
- Real user base

We feature ~10 servers at a time on the homepage.

## 🐛 Reporting bugs

[Open a bug report](https://github.com/e2sy/mcp-hub/issues/new?template=bug_report.md) with:

- Your OS and Node.js version
- The exact command you ran
- The full error output
- Your AI client (Claude Desktop / Cursor / Cline / Windsurf)

## ✨ Requesting features

[Open a feature request](https://github.com/e2sy/mcp-hub/issues/new?template=feature_request.md) and explain:

- What problem does this solve?
- What's your current workaround?
- Any ideas for the API/design?

## 🛠️ Contributing to the CLI

The CLI lives in `cli/`. It's a standalone npm package written in TypeScript and built with `tsup`.

```bash
cd cli
bun install
bun run build    # builds to cli/dist/
node dist/index.js list  # test locally
```

### Adding a new AI client

1. Add the client to `SUPPORTED_CLIENTS` in `cli/src/lib/clients.ts`
2. Add config paths for macOS, Windows, and Linux in `getClientPaths()`
3. Add the client to the tabs in `src/components/server-config-tabs.tsx` (website)
4. Update `cli/src/index.ts` if the client needs special handling
5. Test on all three OSes if possible

### Adding a new CLI command

1. Add the command to `cli/src/index.ts` using `commander`
2. Test with `node dist/index.js your-command`
3. Update the CLI docs page at `src/app/cli/page.tsx`
4. Update the README

## 🌐 Contributing to the website

The website is a Next.js 16 app. Key files:

- `src/app/page.tsx` — landing page
- `src/app/servers/` — directory + server detail pages
- `src/app/cli/` — CLI documentation
- `src/app/docs/` — full docs
- `src/components/` — all UI components

### Design rules

- Use the existing shadcn/ui components — don't add new UI libraries
- Dark mode is the default — design for dark first
- No blue or indigo colors — the palette is emerald-green based
- All pages must be responsive (mobile-first)
- Use semantic HTML and proper ARIA labels

## 📦 Publishing

Only maintainers can publish to npm. The process:

```bash
cd cli
# Bump version in package.json
bun run build
npm publish
```

The `prepublishOnly` script handles building automatically.

## 💬 Questions?

[Open a discussion](https://github.com/e2sy/mcp-hub/discussions) — we're friendly and respond fast.

---

Thanks for contributing! 🎉
