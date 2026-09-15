'use client'
// app/(dashboard)/gastos/page.tsx
// Página de gastos (movimientos filtrados)

import { useState } from 'react'
import { Plus, Search, TrendingDown } from 'lucide-react'
import { useMovements } from '@/hooks/useMovements'
import { useMonth } from '@/components/providers/MonthProvider'
import { MovementCard } from '@/components/movements/MovementCard'
import { MovementTable } from '@/components/movements/MovementTable'
import { MovementModal } from '@/components/movements/MovementModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TableSkeleton, MovementCardSkeleton } from '@/components/shared/Skeleton'
import type { Movement, MovementFilters, Category } from '@/types/database'
import { useDeleteMovement } from '@/hooks/useMovements'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency } from '@/lib/finance/formatters'

export default function GastosPage() {
  const { selectedMonth } = useMonth()
  // Filtro base: SIEMPRE gastos
  const [filters, setFilters] = useState<MovementFilters>({ month: selectedMonth, type: 'gasto' })
  const [search, setSearch] = useState('')
  
  if (filters.month !== selectedMonth && !filters.startDate && !filters.endDate) {
    setFilters({ ...filters, month: selectedMonth })
  }

  const { data: movements, isLoading } = useMovements(filters)
  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts()
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories('gasto')
  const deleteMovement = useDeleteMovement()

  // Calcular totales
  const totalSpent = movements?.reduce((sum, m) => sum + m.amount, 0) || 0


  const [modalOpen, setModalOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null)

  const handleOpenCreate = () => {
    setEditingMovement(null)
    setModalOpen(true)
  }

  const handleEdit = (m: Movement) => {
    setEditingMovement(m)
    setModalOpen(true)
  }

  const handleDeleteRequest = (m: Movement) => {
    setMovementToDelete(m)
  }

  const confirmDelete = async () => {
    if (movementToDelete) {
      await deleteMovement.mutateAsync(movementToDelete.id)
      setMovementToDelete(null)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (val.length > 2 || val.length === 0) {
      setFilters(prev => ({ ...prev, search: val || undefined }))
    }
  }

  return (
    <div className="flex flex-col gap-6 fade-in max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-negative-light">
            <TrendingDown size={20} className="text-negative" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Gastos</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Historial de tus gastos mensuales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleOpenCreate} className="btn desktop-only" style={{ background: 'var(--negative)', color: 'white' }}>
            <Plus size={18} />
            Nuevo Gasto
          </button>
        </div>
      </div>

      {/* Resumen de Saldos Disponibles */}
      {!isLoadingAccounts && accounts.length > 0 && (
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {accounts.map(acc => (
            <div key={acc.id} className="card p-3 min-w-[140px] flex-shrink-0 flex flex-col gap-1 snap-start border-l-4 border-l-accent">
              <span className="text-xs font-medium text-foreground-muted truncate">{acc.name}</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(acc.current_balance)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Barra de Herramientas y Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="input-with-icon flex-1 w-full max-w-sm">
            <span className="input-icon-left"><Search size={18} /></span>
            <input
              type="text"
              placeholder="Buscar gasto..."
              value={search}
              onChange={handleSearch}
              className="input w-full bg-surface"
            />
          </div>
          <select 
            className="input w-full sm:w-48 bg-surface text-sm"
            value={filters.categoryId || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, categoryId: e.target.value || undefined }))}
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        {/* Total Filtrado */}
        <div className="card px-4 py-2 flex items-center gap-3 bg-surface-subtle border-none self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-sm font-medium text-foreground-muted">Total filtrado:</span>
          <span className="text-lg font-bold text-negative">{formatCurrency(totalSpent)}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <div className="mobile-only flex flex-col gap-3">
               <MovementCardSkeleton />
               <MovementCardSkeleton />
            </div>
            <div className="desktop-only"><TableSkeleton rows={4} /></div>
          </>
        ) : (
          <>
            <div className="mobile-only flex flex-col gap-3 pb-16">
              {movements?.length === 0 ? (
                <div className="card p-8 text-center text-foreground-muted">No hay gastos registrados.</div>
              ) : (
                movements?.map(mov => (
                  <MovementCard key={mov.id} movement={mov} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                ))
              )}
            </div>
            <div className="desktop-only">
              <MovementTable movements={movements || []} onEdit={handleEdit} onDelete={handleDeleteRequest} />
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <MovementModal 
          defaultType="gasto" 
          onClose={() => setModalOpen(false)} 
          editMovement={editingMovement || undefined}
        />
      )}

      <ConfirmDialog 
        open={!!movementToDelete}
        title="Eliminar Gasto"
        description={`¿Eliminar el gasto "${movementToDelete?.description}" por ${formatCurrency(movementToDelete?.amount || 0)}?`}
        dangerous
        confirmLabel={deleteMovement.isPending ? 'Eliminando...' : 'Sí, eliminar'}
        onConfirm={confirmDelete}
        onCancel={() => setMovementToDelete(null)}
      />
    </div>
  )
}
