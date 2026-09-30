import { Info, Lightbulb, AlertTriangle, XCircle, type LucideIcon } from 'lucide-react'
import * as React from 'react'

type CalloutType = 'info' | 'tip' | 'warning' | 'danger'

const STYLES: Record<CalloutType, { bg: string; border: string; text: string; icon: LucideIcon; label: string }> = {
  info: {
    bg: 'bg-sky-500/5',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-300',
    icon: Info,
    label: 'Info',
  },
  tip: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: Lightbulb,
    label: 'Tip',
  },
  warning: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-300',
    icon: AlertTriangle,
    label: 'Warning',
  },
  danger: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/30',
    text: 'text-red-700 dark:text-red-300',
    icon: XCircle,
    label: 'Danger',
  },
}

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: React.ReactNode
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const style = STYLES[type]
  const Icon = style.icon

  return (
    <div className={`my-4 flex gap-3 rounded-lg border ${style.border} ${style.bg} p-4`}>
      <Icon className={`h-5 w-5 shrink-0 ${style.text}`} />
      <div className="flex-1 text-sm">
        {title && (
          <p className={`mb-1 font-semibold ${style.text}`}>
            {title}
          </p>
        )}
        <div className="text-foreground/90 [&>p]:my-0 [&>p]:leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}
