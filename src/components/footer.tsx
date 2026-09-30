import Link from 'next/link'
import { Terminal, Heart } from 'lucide-react'
import { GITHUB_REPO } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                MCP<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The open directory and auto-installer for Model Context Protocol servers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/servers" className="hover:text-foreground">Directory</Link></li>
              <li><Link href="/cli" className="hover:text-foreground">CLI Tool</Link></li>
              <li><Link href="/docs" className="hover:text-foreground">Docs</Link></li>
              <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href={GITHUB_REPO} target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a></li>
              <li><a href="#add" className="hover:text-foreground">Submit a server</a></li>
              <li><a href={GITHUB_REPO + '/discussions'} target="_blank" rel="noreferrer" className="hover:text-foreground">Discussions</a></li>
              <li><a href={GITHUB_REPO + '/issues'} target="_blank" rel="noreferrer" className="hover:text-foreground">Report an issue</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer" className="hover:text-foreground">MCP Docs</a></li>
              <li><a href="https://www.anthropic.com/claude" target="_blank" rel="noreferrer" className="hover:text-foreground">Claude</a></li>
              <li><a href="https://cursor.com" target="_blank" rel="noreferrer" className="hover:text-foreground">Cursor</a></li>
              <li><a href="https://cline.bot" target="_blank" rel="noreferrer" className="hover:text-foreground">Cline</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MCP Hub. Open source under MIT.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Built with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> by indie hackers
          </p>
        </div>
      </div>
    </footer>
  )
}
