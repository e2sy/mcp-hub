#!/usr/bin/env node
/**
 * Basic smoke tests for the mcp-hub CLI.
 * Run: node tests/smoke-test.js
 *
 * These tests verify that the CLI builds and that all commands
 * at least respond without crashing. They don't test functionality
 * deeply — that would require a real AI client installed.
 */

import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

const CLI_PATH = fileURLToPath(new URL('../dist/index.js', import.meta.url))

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (e) {
    console.log(`  ✗ ${name}`)
    console.log(`    ${e.message}`)
    failed++
  }
}

function runCli(args) {
  const result = spawnSync('node', [CLI_PATH, ...args], {
    encoding: 'utf-8',
    timeout: 10000,
  })
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status,
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

console.log('\n◆ MCP Hub CLI Smoke Tests\n')

// ─── Build exists ────────────────────────────────────────
test('CLI build exists', () => {
  assert(existsSync(CLI_PATH), `Build not found at ${CLI_PATH}`)
})

// ─── Version ─────────────────────────────────────────────
test('--version returns version number', () => {
  const { stdout, status } = runCli(['--version'])
  assert(status === 0, `Exit code ${status}`)
  assert(/\d+\.\d+\.\d+/.test(stdout), `Expected version, got: ${stdout}`)
})

// ─── Help ────────────────────────────────────────────────
test('--help lists all commands', () => {
  const { stdout, status } = runCli(['--help'])
  assert(status === 0, `Exit code ${status}`)
  const commands = ['install', 'list', 'search', 'info', 'remove', 'doctor',
    'backup', 'restore', 'bundle', 'init', 'config', 'clients', 'installed',
    'categories', 'update', 'add', 'test', 'alias', 'status', 'completions',
    'outdated', 'upgrade', 'logs', 'whoami']
  for (const cmd of commands) {
    assert(stdout.includes(cmd), `Missing command in help: ${cmd}`)
  }
})

// ─── List ────────────────────────────────────────────────
test('list shows servers', () => {
  const { stdout, status } = runCli(['list'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('MCP servers'), `Expected servers count`)
  assert(stdout.includes('GitHub'), `Expected GitHub in list`)
})

// ─── Categories ──────────────────────────────────────────
test('categories lists all 10 categories', () => {
  const { stdout, status } = runCli(['categories'])
  assert(status === 0, `Exit code ${status}`)
  const categories = ['Database', 'Search', 'File System', 'APIs', 'Productivity',
    'Dev Tools', 'Cloud', 'Communication', 'Data', 'AI & ML']
  for (const cat of categories) {
    assert(stdout.includes(cat), `Missing category: ${cat}`)
  }
})

// ─── Search ──────────────────────────────────────────────
test('search finds postgres', () => {
  const { stdout, status } = runCli(['search', 'postgres'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('PostgreSQL'), `Expected PostgreSQL in results`)
})

test('search with no results returns empty', () => {
  const { stdout, status } = runCli(['search', 'xyznonexistent12345'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('0 results') || stdout.includes('No servers'), `Expected no results`)
})

// ─── Info ────────────────────────────────────────────────
test('info shows server details', () => {
  const { stdout, status } = runCli(['info', 'github'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('GitHub'), `Expected GitHub in info`)
  assert(stdout.includes('Author:'), `Expected Author field`)
})

test('info with unknown server fails gracefully', () => {
  const { stdout, status } = runCli(['info', 'nonexistent-server'])
  assert(status === 1, `Expected exit code 1, got ${status}`)
  assert(stdout.includes('not found'), `Expected not found message`)
})

// ─── Clients ─────────────────────────────────────────────
test('clients shows detected clients', () => {
  const { stdout, status } = runCli(['clients'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('Claude Desktop'), `Expected Claude Desktop`)
  assert(stdout.includes('Cursor'), `Expected Cursor`)
})

// ─── Completions ─────────────────────────────────────────
test('completions bash generates script', () => {
  const { stdout, status } = runCli(['completions', 'bash'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('_mcp_hub'), `Expected bash function`)
  assert(stdout.includes('complete -F'), `Expected complete command`)
})

test('completions zsh generates script', () => {
  const { stdout, status } = runCli(['completions', 'zsh'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('#compdef'), `Expected zsh compdef`)
})

test('completions fish generates script', () => {
  const { stdout, status } = runCli(['completions', 'fish'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('complete -c mcp-hub'), `Expected fish complete`)
})

test('completions with invalid shell fails gracefully', () => {
  const { stdout, status } = runCli(['completions', 'powershell'])
  assert(status === 0, `Expected exit code 0`)
  assert(stdout.includes('Unknown shell'), `Expected unknown shell message`)
})

// ─── Status ──────────────────────────────────────────────
test('status runs without crashing', () => {
  const { stdout, status } = runCli(['status'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('MCP Hub Status'), `Expected status header`)
  assert(stdout.includes('AI Clients'), `Expected AI Clients section`)
  assert(stdout.includes('Summary'), `Expected Summary section`)
})

// ─── Whoami ──────────────────────────────────────────────
test('whoami shows environment info', () => {
  const { stdout, status } = runCli(['whoami'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('System'), `Expected System section`)
  assert(stdout.includes('Node.js'), `Expected Node.js info`)
  assert(stdout.includes('MCP Hub'), `Expected MCP Hub section`)
})

// ─── Bundle share ────────────────────────────────────────
test('bundle-share list runs without crashing', () => {
  const { stdout, status } = runCli(['bundle-share', 'list'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('Shared bundles'), `Expected Shared bundles header`)
})

// ─── History ─────────────────────────────────────────────
test('history runs without crashing', () => {
  const { stdout, status } = runCli(['history'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('History'), `Expected History header`)
})

// ─── Config import ───────────────────────────────────────
test('config-import runs without crashing', () => {
  const { stdout, status } = runCli(['config-import'])
  assert(status === 0, `Exit code ${status}`)
  assert(stdout.includes('Importing'), `Expected Importing header`)
})

// ─── Summary ─────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`)
console.log(`  ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('  ✗ Some tests failed')
  process.exit(1)
} else {
  console.log('  ✓ All tests passed!')
}
console.log()
