'use client'
// app/(dashboard)/presupuestos/page.tsx
// Gestión de Presupuestos Mensuales

import { useMonth } from '@/components/providers/MonthProvider'
import { useBudgets } from '@/hooks/useBudgets'
import { PieChart, Plus } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/finance/formatters'
import { budgetProgress, budgetStatus } from '@/lib/finance/calculations'
import { AlertTriangle, Info } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { KPICardSkeleton } from '@/components/shared/Skeleton'
import { BudgetModal } from '@/components/budgets/BudgetModal'
import { useState } from 'react'

export default function PresupuestosPage() {
  const { selectedMonth } = useMonth()
  const { data: budgets, isLoading } = useBudgets(selectedMonth)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Presupuestos</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Controla tus gastos por categoría en este mes
          </p>
        </div>
        <button className="btn btn-primary desktop-only" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Alertas */}
        {budgets && budgets.length > 0 && (
          <div className="flex flex-col gap-2">
            {budgets.filter(b => budgetStatus(b.spent || 0, b.amount) === 'exceeded').map(b => (
              <div key={`alert-${b.id}`} className="p-3 rounded-lg flex items-start gap-3 bg-negative-light border border-negative/20">
                <AlertTriangle size={18} className="text-negative shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-negative">Presupuesto excedido: {b.category?.name}</h4>
                  <p className="text-xs text-negative/80">
                    Has gastado {formatCurrency((b.spent || 0) - b.amount)} más del límite establecido.
                  </p>
                </div>
              </div>
            ))}
            {budgets.filter(b => budgetStatus(b.spent || 0, b.amount) === 'warning').map(b => (
              <div key={`alert-${b.id}`} className="p-3 rounded-lg flex items-start gap-3 bg-warning-light border border-warning/20">
                <Info size={18} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-warning">Alerta de presupuesto: {b.category?.name}</h4>
                  <p className="text-xs text-warning/80">
                    Estás al {formatPercent(budgetProgress(b.spent || 0, b.amount))} del límite.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

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
            action={<button className="btn btn-primary mt-4" onClick={() => setModalOpen(true)}>Crear Presupuesto</button>}
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
      {modalOpen && <BudgetModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
