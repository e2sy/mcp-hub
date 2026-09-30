'use client'

import { useState } from 'react'
import { Star, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GITHUB_REPO } from '@/lib/constants'

export function GitHubStarButton({ starred = false }: { starred?: boolean }) {
  const [isStarred, setIsStarred] = useState(starred)
  const [count, setCount] = useState(2847)

  const toggle = () => {
    setIsStarred(!isStarred)
    setCount((c) => (isStarred ? c - 1 : c + 1))
  }

  return (
    <div className="flex items-center gap-px overflow-hidden rounded-md border border-border bg-card/50 backdrop-blur">
      <a
        href={GITHUB_REPO}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Github className="h-4 w-4" />
        <span className="hidden sm:inline">Star</span>
      </a>
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 border-l border-border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted"
      >
        <Star
          className={`h-4 w-4 transition-all ${
            isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
        />
        <span className="tabular-nums">{count.toLocaleString()}</span>
      </button>
    </div>
  )
}
