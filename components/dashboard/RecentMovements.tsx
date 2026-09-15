'use client'
// components/dashboard/RecentMovements.tsx
// Lista rápida de los últimos movimientos en el dashboard

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'
import { EmptyState } from '@/components/shared/EmptyState'

interface RecentMovementsProps {
  movements: Movement[]
}

export function RecentMovements({ movements }: RecentMovementsProps) {
  if (movements.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Últimos Movimientos</h3>
        <EmptyState 
          title="No hay movimientos recientes" 
          description="Los movimientos que registres aparecerán aquí."
        />
      </div>
    )
  }

  return (
    <div className="card flex flex-col h-full">
      <div className="p-4 sm:p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Últimos Movimientos</h3>
        <Link 
          href="/movimientos" 
          className="text-sm font-medium flex items-center gap-1 hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="flex flex-col divide-y divide-border">
          {movements.map(mov => (
            <li key={mov.id} className="p-4 sm:p-5 flex items-center gap-3 hover:bg-surface-subtle transition-colors">
              {/* Icon / Category Color */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                style={{ 
                  background: mov.category?.color ? `color-mix(in srgb, ${mov.category.color} 15%, transparent)` : 'var(--surface-elevated)',
                  color: mov.category?.color || 'var(--foreground-muted)'
                }}
              >
                {mov.category?.name?.substring(0, 2).toUpperCase() ?? (mov.type === 'ingreso' ? 'IN' : 'GA')}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>
                  {mov.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                  <span className="truncate max-w-[100px] sm:max-w-none">
                    {mov.category?.name ?? (mov.type === 'ingreso' ? 'Ingreso' : 'Sin categoría')}
                  </span>
                  <span>•</span>
                  <span>{formatDate(mov.date)}</span>
                </div>
              </div>

              {/* Amount */}
              <div 
                className="font-semibold text-right whitespace-nowrap"
                style={{ color: mov.type === 'ingreso' ? 'var(--positive)' : 'var(--foreground)' }}
              >
                {mov.type === 'ingreso' ? '+' : '-'}{formatCurrency(mov.amount)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
