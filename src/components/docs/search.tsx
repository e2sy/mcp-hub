'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, CornerDownLeft } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { DOC_PAGES, DOC_CATEGORIES } from '@/lib/docs-config'

export function DocsSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (slug: string) => {
    setOpen(false)
    router.push(`/docs/${slug}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search docs...</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono sm:inline">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {DOC_CATEGORIES.map((category) => {
            const pages = DOC_PAGES.filter((p) => p.category === category.id)
            if (pages.length === 0) return null
            return (
              <CommandGroup key={category.id} heading={category.title}>
                {pages.map((page) => (
                  <CommandItem
                    key={page.slug}
                    onSelect={() => handleSelect(page.slug)}
                    className="group"
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-1 flex-col">
                      <span className="font-medium">{page.title}</span>
                      <span className="text-xs text-muted-foreground">{page.description}</span>
                    </div>
                    <CornerDownLeft className="h-3 w-3 opacity-0 group-hover:opacity-50" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
}
