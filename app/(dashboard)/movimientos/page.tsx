'use client'
// app/(dashboard)/movimientos/page.tsx
// Página principal de historial de movimientos

import { useState } from 'react'
import { Plus, SlidersHorizontal, Search } from 'lucide-react'
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

export default function MovimientosPage() {
  const { selectedMonth } = useMonth()
  const [filters, setFilters] = useState<MovementFilters>({ month: selectedMonth })
  const [search, setSearch] = useState('')
  
  // Sync filters with selectedMonth context when it changes, unless we have custom date ranges
  // For simplicity in this version, we just use the selected month
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
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Movimientos</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Historial detallado de ingresos y gastos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Oculto en móvil (usar FAB), visible en desktop */}
          <button onClick={handleOpenCreate} className="btn btn-primary desktop-only">
            <Plus size={18} />
            Nuevo
          </button>
        </div>
      </div>

      {/* Barra de Herramientas (Búsqueda + Filtros) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Buscar por descripción o notas..."
            value={search}
            onChange={handleSearch}
            className="input pl-10 w-full bg-surface"
          />
        </div>
        <button 
          className="btn btn-secondary w-full sm:w-auto"
          aria-label="Filtros avanzados"
          disabled // Filtros avanzados se implementarán después
        >
          <SlidersHorizontal size={18} />
          Filtros
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <div className="mobile-only flex flex-col gap-3">
               <MovementCardSkeleton />
               <MovementCardSkeleton />
               <MovementCardSkeleton />
            </div>
            <div className="desktop-only">
               <TableSkeleton rows={6} />
            </div>
          </>
        ) : (
          <>
            {/* Vista Móvil (Tarjetas) */}
            <div className="mobile-only flex flex-col gap-3 pb-16">
              {movements?.length === 0 ? (
                <div className="card p-8 text-center text-foreground-muted">No hay movimientos.</div>
              ) : (
                movements?.map(mov => (
                  <MovementCard 
                    key={mov.id} 
                    movement={mov} 
                    onEdit={handleEdit} 
                    onDelete={handleDeleteRequest} 
                  />
                ))
              )}
            </div>

            {/* Vista Desktop (Tabla) */}
            <div className="desktop-only">
              <MovementTable 
                movements={movements || []} 
                onEdit={handleEdit} 
                onDelete={handleDeleteRequest} 
              />
            </div>
          </>
        )}
      </div>

      {/* Modales */}
      {modalOpen && (
        <MovementModal 
          defaultType={editingMovement?.type || 'gasto'} 
          onClose={() => setModalOpen(false)} 
          editMovement={editingMovement || undefined}
        />
      )}

      <ConfirmDialog 
        open={!!movementToDelete}
        title="Eliminar Movimiento"
        description={`¿Eliminar el movimiento "${movementToDelete?.description}" por ${formatCurrency(movementToDelete?.amount || 0)}? El saldo de la cuenta asociada se actualizará automáticamente.`}
        dangerous
        confirmLabel={deleteMovement.isPending ? 'Eliminando...' : 'Sí, eliminar'}
        onConfirm={confirmDelete}
        onCancel={() => setMovementToDelete(null)}
      />

    </div>
  )
}
