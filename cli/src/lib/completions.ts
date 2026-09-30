import { getBundledRegistry } from './registry.js'
import { SUPPORTED_CLIENTS } from './clients.js'
import { colors, symbols, header } from './ui.js'

/**
 * Generates shell completion scripts for bash, zsh, and fish.
 * Provides tab completion for:
 * - All CLI commands
 * - Server names (for install, info, remove, update, test)
 * - Client names (for --client flag)
 * - Category names (for --category flag)
 */

const COMMANDS = [
  'install', 'list', 'search', 'info', 'remove', 'doctor', 'backup',
  'restore', 'bundle', 'init', 'config', 'clients', 'installed',
  'categories', 'update', 'add', 'test', 'alias', 'status',
  'completions', 'outdated', 'upgrade', 'logs', 'whoami',
]

const CATEGORIES = [
  'database', 'search', 'filesystem', 'api', 'productivity',
  'devtools', 'cloud', 'communication', 'data', 'ai',
]

function generateBash(): string {
  const registry = getBundledRegistry()
  const serverSlugs = registry.servers.map((s) => s.slug).join(' ')
  const clients = SUPPORTED_CLIENTS.map((c) => c.toLowerCase().split(' ')[0]).join(' ')
  const commands = COMMANDS.join(' ')
  const categories = CATEGORIES.join(' ')

  return [
    '# mcp-hub bash completion',
    '_mcp_hub() {',
    '  local cur prev opts',
    '  COMPREPLY=()',
    '  cur="${COMP_WORDS[COMP_CWORD]}"',
    '  prev="${COMP_WORDS[COMP_CWORD-1]}"',
    `  cmds="${commands}"`,
    `  servers="${serverSlugs}"`,
    `  clients="${clients}"`,
    `  categories="${categories}"`,
    '',
    '  if [ $COMP_CWORD -eq 1 ]; then',
    '    COMPREPLY=( $(compgen -W "$cmds" -- $cur) )',
    '  elif [ $COMP_CWORD -ge 2 ]; then',
    '    case "${COMP_WORDS[1]}" in',
    '      install|info|remove|update|test|logs)',
    '        COMPREPLY=( $(compgen -W "$servers" -- $cur) )',
    '        ;;',
    '      list)',
    '        case "$cur" in',
    '          --category=*) COMPREPLY=( $(compgen -W "$categories" -- "${cur#*=}") );;',
    '          *) COMPREPLY=( $(compgen -W "--category --featured --interactive" -- $cur) );;',
    '        esac',
    '        ;;',
    '      backup)',
    '        COMPREPLY=( $(compgen -W "--list --delete --label" -- $cur) )',
    '        ;;',
    '      bundle)',
    '        COMPREPLY=( $(compgen -W "export install" -- $cur) )',
    '        ;;',
    '      alias)',
    '        COMPREPLY=( $(compgen -W "add list remove" -- $cur) )',
    '        ;;',
    '      config)',
    '        COMPREPLY=( $(compgen -W "edit path" -- $cur) )',
    '        ;;',
    '      completions)',
    '        COMPREPLY=( $(compgen -W "bash zsh fish" -- $cur) )',
    '        ;;',
    '      *)',
    '        COMPREPLY=( $(compgen -W "--client --all-clients --help" -- $cur) )',
    '        ;;',
    '    esac',
    '  fi',
    '  return 0',
    '}',
    'complete -F _mcp_hub mcp-hub',
  ].join('\n')
}

function generateZsh(): string {
  const registry = getBundledRegistry()
  const serverSlugs = registry.servers.map((s) => s.slug).join(' ')
  const clients = SUPPORTED_CLIENTS.map((c) => c.toLowerCase().split(' ')[0]).join(' ')
  const commands = COMMANDS.join(' ')
  const categories = CATEGORIES.join(' ')

  return `#compdef mcp-hub
# mcp-hub zsh completion

_mcp-hub() {
  local cmds servers clients categories
  cmds=(${commands})
  servers=(${serverSlugs})
  clients=(${clients})
  categories=(${categories})

  if (( CURRENT == 2 )); then
    _describe 'command' cmds
  elif (( CURRENT >= 3 )); then
    case "\${words[2]}" in
      install|info|remove|update|test|logs)
        _describe 'server' servers
        ;;
      list)
        _arguments '--category=:category:->categories' '--featured' '--interactive'
        _describe 'category' categories
        ;;
      backup)
        _arguments '--list' '--delete=:backup:' '--label=:label:'
        ;;
      bundle)
        _values 'action' 'export' 'install'
        ;;
      alias)
        _values 'action' 'add' 'list' 'remove'
        ;;
      config)
        _values 'action' 'edit' 'path'
        _describe 'client' clients
        ;;
      completions)
        _values 'shell' 'bash' 'zsh' 'fish'
        ;;
      *)
        _arguments '--client=:client:->clients' '--all-clients' '--help'
        ;;
    esac
  fi
}

_mcp-hub "$@"`
}

function generateFish(): string {
  const registry = getBundledRegistry()
  const serverSlugs = registry.servers.map((s) => s.slug).join(' ')
  const clients = SUPPORTED_CLIENTS.map((c) => c.toLowerCase().split(' ')[0]).join(' ')
  const commands = COMMANDS.join(' ')
  const categories = CATEGORIES.join(' ')

  return `# mcp-hub fish completion

set -l cmds ${commands}
set -l servers ${serverSlugs}
set -l clients ${clients}
set -l categories ${categories}

complete -c mcp-hub -n "__fish_use_subcommand" -a "$cmds" -d "mcp-hub command"

complete -c mcp-hub -n "__fish_seen_subcommand_from install info remove update test" -a "$servers" -d "server"

complete -c mcp-hub -n "__fish_seen_subcommand_from list" -l category -a "$categories" -d "filter by category"
complete -c mcp-hub -n "__fish_seen_subcommand_from list" -l featured -d "only featured servers"
complete -c mcp-hub -n "__fish_seen_subcommand_from list" -l interactive -d "interactive mode"

complete -c mcp-hub -n "__fish_seen_subcommand_from bundle" -a "export install" -d "bundle action"
complete -c mcp-hub -n "__fish_seen_subcommand_from alias" -a "add list remove" -d "alias action"
complete -c mcp-hub -n "__fish_seen_subcommand_from config" -a "edit path" -d "config action"
complete -c mcp-hub -n "__fish_seen_subcommand_from config" -a "$clients" -d "client"
complete -c mcp-hub -n "__fish_seen_subcommand_from completions" -a "bash zsh fish" -d "shell"

complete -c mcp-hub -s c -l client -a "$clients" -d "specific client"
complete -c mcp-hub -l all-clients -d "all clients"
complete -c mcp-hub -s h -l help -d "help"`
}

const INSTRUCTIONS: Record<string, string> = {
  bash: `# Add this to your ~/.bashrc:
source <(mcp-hub completions bash)

# Or save to a file:
mcp-hub completions bash > ~/.mcp-hub-completions.bash
echo 'source ~/.mcp-hub-completions.bash' >> ~/.bashrc`,
  zsh: `# Add this to your ~/.zshrc:
source <(mcp-hub completions zsh)

# Or save to a file:
mcp-hub completions zsh > ~/.zsh/mcp-hub-completions.zsh
echo 'source ~/.zsh/mcp-hub-completions.zsh' >> ~/.zshrc`,
  fish: `# Fish auto-loads completions from this directory:
mcp-hub completions fish > ~/.config/fish/completions/mcp-hub.fish

# Or eval directly:
mcp-hub completions fish | source`,
}

export function printCompletions(shell: string): void {
  const normalized = shell.toLowerCase().trim()

  let script: string
  let instructions: string

  switch (normalized) {
    case 'bash':
    case 'sh':
      script = generateBash()
      instructions = INSTRUCTIONS.bash
      break
    case 'zsh':
      script = generateZsh()
      instructions = INSTRUCTIONS.zsh
      break
    case 'fish':
      script = generateFish()
      instructions = INSTRUCTIONS.fish
      break
    default:
      console.log(`  ${symbols.cross} Unknown shell "${colors.red(shell)}"`)
      console.log(`  ${colors.gray('Supported: bash, zsh, fish')}\n`)
      return
  }

  console.log(script)
  console.log(`\n${colors.gray('# ─── Installation ──────────────────────────────')}`)
  console.log(colors.gray(instructions))
}
