'use client'
import { useState } from 'react'
import { Plus, RefreshCw, Trash2, Edit2, Play, Pause } from 'lucide-react'
import { useRecurringTransactions, useDeleteRecurring } from '@/hooks/useRecurring'
import { RecurringModal } from '@/components/recurring/RecurringModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/finance/formatters'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function RecurrentesPage() {
  const { data: recurring = [], isLoading } = useRecurringTransactions()
  const deleteRec = useDeleteRecurring()
  const qc = useQueryClient()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string | null>(null)

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from('recurring_transactions').update({ active: !current }).eq('id', id)
    if (error) toast.error('Error al actualizar')
    else qc.invalidateQueries({ queryKey: ['recurring'] })
  }

  const handleDelete = async () => {
    if (toDelete) {
      await deleteRec.mutateAsync(toDelete)
      setToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-light">
            <RefreshCw size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Movimientos Recurrentes</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Automatiza ingresos y gastos fijos</p>
          </div>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          Nuevo Recurrente
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-foreground-muted">Cargando...</div>
      ) : recurring.length === 0 ? (
        <div className="card p-8">
          <EmptyState 
            icon={RefreshCw}
            title="Sin movimientos recurrentes" 
            description="Crea tu primer movimiento recurrente para automatizar tus finanzas."
            action={<button className="btn btn-primary mt-4" onClick={() => setModalOpen(true)}>Crear ahora</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recurring.map(r => (
            <div key={r.id} className={cn("card p-4 flex flex-col gap-3 transition-opacity", !r.active && "opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      r.type === 'ingreso' ? 'bg-positive-light text-positive' : 'bg-negative-light text-negative'
                    )}>
                      {r.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </span>
                    <span className="text-xs font-medium text-foreground-muted bg-surface-subtle px-2 py-0.5 rounded-full border border-border">
                      {r.frequency}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mt-2 text-lg leading-tight">{r.description}</h3>
                  {r.category && <p className="text-sm text-foreground-muted">{r.category.name}</p>}
                </div>
                <span className={cn(
                  "font-bold text-lg whitespace-nowrap",
                  r.type === 'ingreso' ? 'text-positive' : 'text-negative'
                )}>
                  {r.type === 'ingreso' ? '+' : '-'}{formatCurrency(r.amount)}
                </span>
              </div>

              <div className="bg-surface-subtle rounded-lg p-3 text-sm flex flex-col gap-1 border border-border">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Inicia:</span>
                  <span className="font-medium text-foreground">{format(new Date(r.start_date), 'dd/MM/yyyy')}</span>
                </div>
                {['mensual', 'quincenal'].includes(r.frequency) && r.day_of_month && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Día de cobro:</span>
                    <span className="font-medium text-foreground">Día {r.day_of_month}</span>
                  </div>
                )}
                {r.account && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Cuenta:</span>
                    <span className="font-medium text-foreground truncate max-w-[150px] text-right">{r.account.name}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-1">
                <button 
                  onClick={() => toggleActive(r.id, r.active)}
                  className="btn btn-secondary flex-1"
                  style={{ minHeight: '36px', padding: '0 0.75rem', fontSize: '0.875rem' }}
                >
                  {r.active ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Reanudar</>}
                </button>
                <button 
                  onClick={() => setToDelete(r.id)}
                  className="btn btn-ghost hover:text-negative hover:bg-negative-light"
                  style={{ minHeight: '36px', padding: '0 0.75rem' }}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && <RecurringModal onClose={() => setModalOpen(false)} />}
      <ConfirmDialog 
        open={!!toDelete}
        title="Eliminar Recurrente"
        description="¿Seguro que deseas eliminar este movimiento recurrente? No se generará más en el futuro, pero los generados previamente no se verán afectados."
        dangerous
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
