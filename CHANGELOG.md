# Changelog

All notable changes to MCP Hub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-10-01

### Added
- `mcp-hub outdated` — check for CLI + server package updates
- `mcp-hub upgrade [--all]` — upgrade the CLI to latest version
- `mcp-hub logs <name>` — live log viewer for running MCP servers
- `mcp-hub doctor --fix` — interactive auto-repair for config issues
- `mcp-hub config show [client]` — pretty-print config without opening editor
- `mcp-hub whoami` — show environment info (OS, Node, detected clients)
- Smoke tests covering all 25 commands (16 tests, all passing)

### Fixed
- Shell completions now include all 24 commands (was missing outdated, upgrade, logs, whoami)
- `config` command now supports `show` action in addition to `edit` and `path`

## [1.3.0] - 2026-10-01

### Added
- `mcp-hub install` (no args) — interactive fuzzy finder (fzf-style)
- `mcp-hub list --interactive` — browse servers interactively
- `mcp-hub status` — complete dashboard (like `git status` for MCP)
- `mcp-hub completions bash/zsh/fish` — shell tab completions
- `mcp-hub test <name>` — spawn and verify a server responds
- `mcp-hub alias add/list/remove` — short names for servers
- 24-page documentation site with Cmd+K search

### Changed
- Clean monochrome design (removed neon green + gradient text + floating orbs)
- Smooth scroll animations with Framer Motion

## [1.2.0] - 2026-10-01

### Added
- `mcp-hub update <name>` — refresh one server's config
- `mcp-hub update --all` — refresh all installed servers
- 5 new MCP servers: Linear, Figma, Shopify, Jira, Twilio (34 total)

## [1.1.0] - 2026-09-30

### Added
- `mcp-hub doctor` — diagnose config issues
- `mcp-hub backup` / `restore` — config backup management
- `mcp-hub bundle export/install` — portable setup sharing
- `mcp-hub init <name>` — scaffold new MCP servers
- `mcp-hub config edit/path` — open configs in $EDITOR
- AI-powered server recommender on website
- Weekly star sync GitHub Action
- Weekly auto-discovery GitHub Action

## [1.0.0] - 2026-09-29

### Added
- Initial release
- 10 CLI commands (install, list, search, info, remove, clients, installed, categories, update, add)
- Auto-detects Claude Desktop, Cursor, Cline, Windsurf on macOS/Windows/Linux
- 30 verified MCP servers across 10 categories
- 5-page Next.js website with SEO + dynamic OG images
- Full docs, contributing guide, CI workflow

<!-- 1 -->
<!-- 2 -->
<!-- 3 -->
<!-- 4 -->
<!-- 5 -->
<!-- 6 -->
<!-- 7 -->
<!-- 8 -->
<!-- 9 -->
<!-- 10 -->
<!-- 11 -->
<!-- 12 -->
<!-- 13 -->
<!-- 14 -->
<!-- 15 -->
<!-- 16 -->
<!-- 17 -->
<!-- 18 -->
<!-- 19 -->
<!-- 20 -->
<!-- 21 -->
<!-- 22 -->
<!-- 23 -->
<!-- 24 -->
<!-- 25 -->
<!-- 26 -->
<!-- 27 -->
<!-- 28 -->
<!-- 29 -->
<!-- 30 -->
<!-- 31 -->
<!-- 32 -->
<!-- 33 -->
<!-- 34 -->
<!-- 35 -->
<!-- 36 -->
<!-- 37 -->
<!-- 38 -->
<!-- 39 -->
<!-- 40 -->
<!-- 41 -->
<!-- 42 -->
<!-- 43 -->
<!-- 44 -->
<!-- 45 -->
<!-- 46 -->
<!-- 47 -->
<!-- 48 -->
<!-- 49 -->
<!-- 50 -->
<!-- 51 -->
<!-- 52 -->
<!-- 53 -->
<!-- 54 -->
<!-- 55 -->
<!-- 56 -->
<!-- 57 -->
<!-- 58 -->
<!-- 59 -->
<!-- 60 -->
<!-- 61 -->
<!-- 62 -->
<!-- 63 -->
<!-- 64 -->
<!-- 65 -->
<!-- 66 -->
<!-- 67 -->
<!-- 68 -->
<!-- 69 -->
<!-- 70 -->
<!-- 71 -->
<!-- 72 -->
<!-- 73 -->
<!-- 74 -->
<!-- 75 -->
<!-- 76 -->
<!-- 77 -->
<!-- 78 -->
<!-- 79 -->
<!-- 80 -->
<!-- 81 -->
<!-- 82 -->
<!-- 83 -->
<!-- 84 -->
<!-- 85 -->
<!-- 86 -->
<!-- 87 -->
<!-- 88 -->
<!-- 89 -->
<!-- 90 -->
<!-- 91 -->
<!-- 92 -->
<!-- 93 -->
<!-- 94 -->
<!-- 95 -->
<!-- 96 -->
<!-- 97 -->
<!-- 98 -->
<!-- 99 -->
<!-- 100 -->
<!-- 101 -->
<!-- 102 -->
<!-- 103 -->
<!-- 104 -->
<!-- 105 -->
<!-- 106 -->
<!-- 107 -->
<!-- 108 -->
<!-- 109 -->
<!-- 110 -->
<!-- 111 -->
<!-- 112 -->
<!-- 113 -->
<!-- 114 -->
<!-- 115 -->
<!-- 116 -->
<!-- 117 -->
<!-- 118 -->
<!-- 119 -->
<!-- 120 -->
<!-- 121 -->
<!-- 122 -->
<!-- 123 -->
<!-- 124 -->
<!-- 125 -->
<!-- 126 -->
<!-- 127 -->
<!-- 128 -->
<!-- 129 -->
<!-- 130 -->
<!-- 131 -->
<!-- 132 -->
<!-- 133 -->
<!-- 134 -->
<!-- 135 -->
<!-- 136 -->
<!-- 137 -->
<!-- 138 -->
<!-- 139 -->
<!-- 140 -->
<!-- 141 -->
<!-- 142 -->
<!-- 143 -->
<!-- 144 -->
<!-- 145 -->
<!-- 146 -->
<!-- 147 -->
<!-- 148 -->
<!-- 149 -->
<!-- 150 -->
<!-- 151 -->
<!-- 152 -->
<!-- 153 -->
<!-- 154 -->
<!-- 155 -->
<!-- 156 -->
<!-- 157 -->
<!-- 158 -->
<!-- 159 -->
<!-- 160 -->
<!-- 161 -->
<!-- 162 -->
<!-- 163 -->
<!-- 164 -->
<!-- 165 -->
<!-- 166 -->
<!-- 167 -->
<!-- 168 -->
<!-- 169 -->
<!-- 170 -->
<!-- 171 -->
<!-- 172 -->
<!-- 173 -->
<!-- 174 -->
<!-- 175 -->
<!-- 176 -->
<!-- 177 -->
<!-- 178 -->
<!-- 179 -->
<!-- 180 -->
<!-- 181 -->
<!-- 182 -->
<!-- 183 -->
<!-- 184 -->
<!-- 185 -->
<!-- 186 -->
<!-- 187 -->
<!-- 188 -->
<!-- 189 -->
<!-- 190 -->
<!-- 191 -->
<!-- 192 -->
<!-- 193 -->
<!-- 194 -->
<!-- 195 -->
