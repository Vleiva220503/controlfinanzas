'use client'
// app/(dashboard)/ahorros/page.tsx
import { useState } from 'react'
import { Target, Plus, TrendingUp, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { useSavingsGoals, useCreateSavingsGoal, useDeleteSavingsGoal } from '@/hooks/useSavings'
import { SavingsGoalForm } from '@/components/forms/SavingsGoalForm'
import { SavingsContributionModal } from '@/components/movements/SavingsContributionModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatCurrency, formatPercent } from '@/lib/finance/formatters'
import type { SavingsGoal } from '@/types/database'
import type { SavingsGoalFormValues } from '@/lib/finance/validators'

export default function AhorrosPage() {
  const { data: goals, isLoading } = useSavingsGoals()
  const createGoal = useCreateSavingsGoal()
  const deleteGoal = useDeleteSavingsGoal()

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  
  // Contribution modal state
  const [contributionGoal, setContributionGoal] = useState<{id: string, name: string} | null>(null)

  const handleCreateGoal = async (values: SavingsGoalFormValues) => {
    await createGoal.mutateAsync(values)
    setIsGoalModalOpen(false)
  }

  const confirmDelete = async () => {
    if (goalToDelete) {
      await deleteGoal.mutateAsync(goalToDelete.id)
      setGoalToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Metas de Ahorro</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Alcanza tus objetivos financieros</p>
        </div>
        <button onClick={() => setIsGoalModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          Nueva Meta
        </button>
      </div>

      {/* Grid of goals */}
      {isLoading ? (
        <div className="card p-8 text-center text-foreground-muted">Cargando metas...</div>
      ) : !goals || goals.length === 0 ? (
        <div className="card p-8">
          <EmptyState 
            icon={Target}
            title="Sin metas de ahorro" 
            description="Crea tu primera meta para empezar a ahorrar."
            action={<button onClick={() => setIsGoalModalOpen(true)} className="btn btn-secondary mt-4">Crear Meta</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const progress = ((goal.total_contributed ?? 0) / goal.target_amount) * 100
            const isCompleted = progress >= 100
            
            return (
              <div key={goal.id} className="card p-5 flex flex-col gap-4 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent-light text-accent">
                      <Target size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{goal.name}</h3>
                      <span className="text-xs font-medium text-accent">
                        {isCompleted ? '¡Meta alcanzada!' : `${formatPercent(progress)} completado`}
                      </span>
                    </div>
                  </div>
                  
                  {/* Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === goal.id ? null : goal.id)}
                      className="btn btn-ghost"
                      style={{ minHeight: '32px', width: '32px', padding: 0 }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenuId === goal.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                        <div 
                          className="absolute right-0 top-10 z-50 rounded-lg shadow-modal py-1 min-w-[140px] slide-up"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                        >
                          <button
                            onClick={() => {
                              setActiveMenuId(null)
                              setGoalToDelete(goal)
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-negative-light transition-colors"
                            style={{ color: 'var(--negative)' }}
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-foreground">{formatCurrency(goal.total_contributed ?? 0)}</span>
                    <span className="text-foreground-muted">{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <div className="h-2 rounded-full w-full bg-surface-subtle overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 transition-all duration-500 ease-out"
                      style={{ 
                        width: `${Math.min(progress, 100)}%`,
                        background: isCompleted ? 'var(--positive)' : 'var(--accent)',
                        borderRadius: 'var(--radius-full)'
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => setContributionGoal({ id: goal.id, name: goal.name })}
                    className="btn flex-1 text-sm bg-accent-light text-accent hover:bg-accent hover:text-white"
                    disabled={isCompleted}
                    style={{ minHeight: '36px' }}
                  >
                    <TrendingUp size={16} />
                    Abonar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Goal Modal */}
      {isGoalModalOpen && (
        <div 
          className="z-50 flex items-center justify-center p-4"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        >
          <div 
            className="w-full max-w-md rounded-2xl p-6 slide-up relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>Nueva Meta de Ahorro</h2>
            <SavingsGoalForm 
              onSubmit={handleCreateGoal}
              onCancel={() => setIsGoalModalOpen(false)}
              isSubmitting={createGoal.isPending}
            />
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contributionGoal && (
        <SavingsContributionModal 
          goalId={contributionGoal.id}
          goalName={contributionGoal.name}
          onClose={() => setContributionGoal(null)}
        />
      )}

      {/* Delete Dialog */}
      <ConfirmDialog 
        open={!!goalToDelete}
        title="Eliminar Meta"
        description={`¿Estás seguro de que deseas eliminar la meta "${goalToDelete?.name}"? Se borrará su registro de ahorros.`}
        dangerous
        confirmLabel={deleteGoal.isPending ? 'Eliminando...' : 'Sí, eliminar'}
        onConfirm={confirmDelete}
        onCancel={() => setGoalToDelete(null)}
      />
    </div>
  )
}
