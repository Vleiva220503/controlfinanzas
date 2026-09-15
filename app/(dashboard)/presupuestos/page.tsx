'use client'
// app/(dashboard)/presupuestos/page.tsx
// Gestión de Presupuestos Mensuales

import { useMonth } from '@/components/providers/MonthProvider'
import { useBudgets } from '@/hooks/useBudgets'
import { PieChart, Plus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/finance/formatters'
import { budgetProgress, budgetStatus } from '@/lib/finance/calculations'
import { EmptyState } from '@/components/shared/EmptyState'
import { KPICardSkeleton } from '@/components/shared/Skeleton'

export default function PresupuestosPage() {
  const { selectedMonth } = useMonth()
  const { data: budgets, isLoading } = useBudgets(selectedMonth)

  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Presupuestos</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Controla tus gastos por categoría en este mes
          </p>
        </div>
        <button className="btn btn-primary desktop-only" disabled>
          <Plus size={18} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="card overflow-hidden p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KPICardSkeleton />
            <KPICardSkeleton />
          </div>
        ) : !budgets || budgets.length === 0 ? (
          <EmptyState 
            icon={PieChart}
            title="Sin presupuestos definidos" 
            description="Crea presupuestos para tus categorías de gasto."
            action={<button className="btn btn-secondary mt-4" disabled>Próximamente</button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(b => {
              const progress = budgetProgress(b.spent || 0, b.amount)
              const status = budgetStatus(b.spent || 0, b.amount)
              return (
                <div key={b.id} className="p-4 rounded-xl border border-border bg-surface-subtle flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{b.category?.name}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md bg-${status}-light text-${status}`}>
                      {formatPercent(progress)}
                    </span>
                  </div>
                  
                  <div className="progress" style={{ height: '8px' }}>
                    <div className={`progress-bar ${status}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-foreground-muted">Gastado: <strong className="text-foreground">{formatCurrency(b.spent || 0)}</strong></span>
                    <span className="text-foreground-muted">Límite: <strong className="text-foreground">{formatCurrency(b.amount)}</strong></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
