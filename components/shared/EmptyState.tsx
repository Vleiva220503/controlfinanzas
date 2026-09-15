// components/shared/EmptyState.tsx
// Empty state component for pages/sections with no data

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon && (
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl mb-1"
          style={{ background: 'var(--surface-subtle)' }}
        >
          <Icon size={28} style={{ color: 'var(--foreground-subtle)' }} />
        </div>
      )}
      <div>
        <p className="font-semibold text-base" style={{ color: 'var(--foreground-muted)' }}>
          {title}
        </p>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
