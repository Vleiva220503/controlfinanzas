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
import type { Movement, MovementFilters } from '@/types/database'
import { useDeleteMovement } from '@/hooks/useMovements'
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
  const deleteMovement = useDeleteMovement()

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

      {/* Barra de Herramientas */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={search}
            onChange={handleSearch}
            className="input pl-10 w-full bg-surface"
          />
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
