// components/shared/Skeleton.tsx
// Skeleton loading components for all main UI patterns

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ minHeight: '1rem', ...style }}
      aria-hidden="true"
    />
  )
}

export function KPICardSkeleton() {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <Skeleton style={{ width: '40%', height: '12px', borderRadius: '6px' }} />
      <Skeleton style={{ width: '65%', height: '28px', borderRadius: '8px' }} />
      <Skeleton style={{ width: '30%', height: '10px', borderRadius: '6px' }} />
    </div>
  )
}

export function MovementCardSkeleton() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Skeleton style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton style={{ width: '55%', height: '14px', borderRadius: '6px' }} />
        <Skeleton style={{ width: '35%', height: '11px', borderRadius: '6px' }} />
      </div>
      <Skeleton style={{ width: '70px', height: '18px', borderRadius: '6px', flexShrink: 0 }} />
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="card p-4">
      <Skeleton style={{ width: '30%', height: '14px', borderRadius: '6px', marginBottom: '1rem' }} />
      <Skeleton style={{ width: '100%', height: `${height}px`, borderRadius: '10px' }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0 }} />
            <Skeleton style={{ flex: 1, height: '14px', borderRadius: '6px' }} />
            <Skeleton style={{ width: '80px', height: '14px', borderRadius: '6px', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
