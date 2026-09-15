'use client'
// components/dashboard/BudgetAlerts.tsx
// Muestra alertas rápidas de presupuestos superados o en riesgo

import Link from 'next/link'
import { AlertTriangle, Info } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/finance/formatters'
import { budgetProgress, budgetStatus } from '@/lib/finance/calculations'
import type { Budget } from '@/types/database'

interface BudgetAlertsProps {
  budgets: Budget[]
}

export function BudgetAlerts({ budgets }: BudgetAlertsProps) {
  // Filtrar presupuestos en warning (>=80%) o exceeded (>=100%)
  const alerts = budgets
    .map(b => {
      const progress = budgetProgress(b.spent || 0, b.amount)
      const status = budgetStatus(b.spent || 0, b.amount)
      return { ...b, progress, status }
    })
    .filter(b => b.status === 'warning' || b.status === 'exceeded')
    .sort((a, b) => b.progress - a.progress)

  if (alerts.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
        Alertas de Presupuesto
      </h3>
      <div className="flex flex-col gap-2">
        {alerts.slice(0, 3).map(b => (
          <Link
            key={b.id}
            href="/presupuestos"
            className="flex items-start gap-3 p-3 rounded-xl border transition-colors no-underline"
            style={{ 
              borderColor: b.status === 'exceeded' ? 'var(--negative-light)' : 'var(--warning-light)',
              background: b.status === 'exceeded' ? 'color-mix(in srgb, var(--negative) 5%, var(--surface))' : 'color-mix(in srgb, var(--warning) 5%, var(--surface))'
            }}
          >
            {b.status === 'exceeded' ? (
              <AlertTriangle size={18} style={{ color: 'var(--negative)', marginTop: '2px' }} />
            ) : (
              <Info size={18} style={{ color: 'var(--warning)', marginTop: '2px' }} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {b.category?.name} {b.status === 'exceeded' ? 'excedido' : 'al límite'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                {formatPercent(b.progress)} consumido ({formatCurrency(b.spent || 0)} de {formatCurrency(b.amount)})
              </p>
              <div className="progress mt-2" style={{ height: '4px', background: 'var(--surface-elevated)' }}>
                <div 
                  className={`progress-bar ${b.status}`} 
                  style={{ width: `${Math.min(b.progress, 100)}%` }} 
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
