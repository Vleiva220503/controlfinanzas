'use client'
// components/categories/CategoryExpensesPanel.tsx
// Panel lateral/modal que muestra todos los movimientos de una categoría
// en el mes actualmente visualizado. Reutiliza MovementModal y ConfirmDialog.

import { useEffect, useState, useMemo } from 'react'
import {
  X,
  ArrowDownUp,
  ArrowUp,
  ArrowDown,
  Calendar,
  CreditCard,
  TrendingDown,
} from 'lucide-react'
import { useMovements, useDeleteMovement } from '@/hooks/useMovements'
import { MovementModal } from '@/components/movements/MovementModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { MovementCardSkeleton } from '@/components/shared/Skeleton'
import { formatCurrency, formatDate, formatMonth } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'

type SortField = 'date' | 'amount'
type SortDir = 'asc' | 'desc'

interface CategoryInfo {
  id: string
  name: string
  color?: string | null
  icon?: string | null
}

interface CategoryExpensesPanelProps {
  category: CategoryInfo
  month: string // YYYY-MM
  totalAmount: number
  onClose: () => void
}

export function CategoryExpensesPanel({
  category,
  month,
  totalAmount,
  onClose,
}: CategoryExpensesPanelProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null)
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null)

  const deleteMovement = useDeleteMovement()

  const { data: movements, isLoading } = useMovements({
    month,
    type: 'gasto',
    categoryId: category.id,
  })

  // Sorted movements
  const sortedMovements = useMemo(() => {
    if (!movements) return []
    return [...movements].sort((a, b) => {
      if (sortField === 'date') {
        const diff = a.date.localeCompare(b.date)
        return sortDir === 'asc' ? diff : -diff
      } else {
        const diff = a.amount - b.amount
        return sortDir === 'asc' ? diff : -diff
      }
    })
  }, [movements, sortField, sortDir])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !modalOpen && !movementToDelete) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, modalOpen, movementToDelete])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ArrowDownUp size={14} style={{ opacity: 0.4 }} />
    return sortDir === 'asc'
      ? <ArrowUp size={14} style={{ color: 'var(--accent)' }} />
      : <ArrowDown size={14} style={{ color: 'var(--accent)' }} />
  }

  const catColor = category.color ?? 'var(--negative)'
  const catBg = category.color
    ? `color-mix(in srgb, ${category.color} 15%, transparent)`
    : 'var(--negative-light)'

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Panel — bottom sheet on mobile, right panel on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Gastos de ${category.name}`}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 65,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Desktop: centre as tall modal */}
        <style>{`
          @media (min-width: 768px) {
            .cat-panel-inner {
              align-self: center !important;
              border-radius: var(--radius-2xl) !important;
              max-width: 560px !important;
              max-height: 88dvh !important;
            }
          }
        `}</style>

        <div
          className="cat-panel-inner slide-up"
          style={{
            pointerEvents: 'auto',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '92dvh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          }}
        >
          {/* Drag handle (mobile) */}
          <div
            className="mobile-only"
            style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px', flexShrink: 0 }}
          >
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--border)' }} />
          </div>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem 0.875rem',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: catBg,
                  flexShrink: 0,
                }}
              >
                {category.icon
                  ? <span style={{ fontSize: '1.25rem' }}>{category.icon}</span>
                  : <TrendingDown size={20} style={{ color: catColor }} />
                }
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-subtle)', marginBottom: '1px' }}>
                  Categoría · {formatMonth(month)}
                </p>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: '1.0625rem',
                    color: 'var(--foreground)',
                    margin: 0,
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {category.name}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: catColor, whiteSpace: 'nowrap' }}>
                -{formatCurrency(totalAmount)}
              </span>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                  border: 'none', background: 'var(--surface-subtle)', cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Sort controls */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              flexShrink: 0,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)', marginRight: '0.25rem' }}>
              Ordenar:
            </span>
            {([
              { field: 'date' as SortField, label: 'Fecha', icon: <Calendar size={14} /> },
              { field: 'amount' as SortField, label: 'Monto', icon: <TrendingDown size={14} /> },
            ] as const).map(({ field, label, icon }) => (
              <button
                key={field}
                type="button"
                onClick={() => toggleSort(field)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${sortField === field ? 'var(--accent)' : 'var(--border)'}`,
                  background: sortField === field ? 'var(--accent-light)' : 'var(--surface-subtle)',
                  color: sortField === field ? 'var(--accent)' : 'var(--foreground-muted)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {icon}
                {label}
                <SortIcon field={field} />
              </button>
            ))}
            {!isLoading && movements && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.75rem',
                  color: 'var(--foreground-subtle)',
                }}
              >
                {movements.length} movimiento{movements.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Movements list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <MovementCardSkeleton />
                <MovementCardSkeleton />
                <MovementCardSkeleton />
              </div>
            ) : sortedMovements.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1rem',
                  gap: '0.75rem',
                  color: 'var(--foreground-muted)',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  marginTop: '0.5rem',
                }}
              >
                <TrendingDown size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>No hay gastos en este mes</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--foreground-subtle)', textAlign: 'center' }}>
                  No se encontraron movimientos de {category.name} en {formatMonth(month)}.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sortedMovements.map(mov => (
                  <MovementRow
                    key={mov.id}
                    movement={mov}
                    catColor={catColor}
                    catBg={catBg}
                    onEdit={() => { setEditingMovement(mov); setModalOpen(true) }}
                    onDelete={() => setMovementToDelete(mov)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {modalOpen && (
        <MovementModal
          defaultType="gasto"
          onClose={() => { setModalOpen(false); setEditingMovement(null) }}
          editMovement={editingMovement || undefined}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!movementToDelete}
        title="Eliminar Gasto"
        description={`¿Eliminar "${movementToDelete?.description}" por ${formatCurrency(movementToDelete?.amount || 0)}?`}
        dangerous
        confirmLabel={deleteMovement.isPending ? 'Eliminando...' : 'Sí, eliminar'}
        onConfirm={async () => {
          if (movementToDelete) {
            await deleteMovement.mutateAsync(movementToDelete.id)
            setMovementToDelete(null)
          }
        }}
        onCancel={() => setMovementToDelete(null)}
      />
    </>
  )
}

// ─── Individual movement row inside the panel ──────────────────────────────

interface MovementRowProps {
  movement: Movement
  catColor: string
  catBg: string
  onEdit: () => void
  onDelete: () => void
}

function MovementRow({ movement, catColor, catBg, onEdit, onDelete }: MovementRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border-subtle)',
        transition: 'background 0.15s ease',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--border-subtle)')}
      onMouseOut={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
    >
      {/* Icon */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: catBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <TrendingDown size={16} style={{ color: catColor }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--foreground)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '2px',
          }}
        >
          {movement.description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
            <Calendar size={11} />
            {formatDate(movement.date)}
          </span>
          {movement.payment_method && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
              <CreditCard size={11} />
              {movement.payment_method.name}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <span
        style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          color: catColor,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        -{formatCurrency(movement.amount)}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
        <button
          type="button"
          aria-label="Editar"
          onClick={onEdit}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--foreground-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--accent-light)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--foreground-muted)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          type="button"
          aria-label="Eliminar"
          onClick={onDelete}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--foreground-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--negative-light)'
            e.currentTarget.style.color = 'var(--negative)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--foreground-muted)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
