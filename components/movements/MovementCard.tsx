'use client'
// components/movements/MovementCard.tsx
// Tarjeta para vista móvil de un movimiento
// - Tap en la tarjeta → abre MovementDetailSheet con detalle completo
// - Botón de 3 puntos: 44×44px táctil, abre menú rápido inline

import { MoreVertical, Tag as TagIcon } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'
import { useState } from 'react'
import { MovementDetailSheet } from './MovementDetailSheet'

interface MovementCardProps {
  movement: Movement
  onEdit?: (m: Movement) => void
  onDelete?: (m: Movement) => void
}

export function MovementCard({ movement, onEdit, onDelete }: MovementCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const isIncome = movement.type === 'ingreso'

  const hasActions = !!(onEdit || onDelete)

  return (
    <>
      {/* Card — clickeable para abrir detalle */}
      <div
        className="card p-4 relative group"
        onClick={() => setDetailOpen(true)}
        style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        role="button"
        aria-label={`Ver detalle de ${movement.description}`}
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setDetailOpen(true) }}
      >
        <div className="flex items-start gap-3">
          {/* Icono / Color de categoría */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5"
            style={{
              background: movement.category?.color
                ? `color-mix(in srgb, ${movement.category.color} 15%, transparent)`
                : 'var(--surface-elevated)',
              color: movement.category?.color || 'var(--foreground-muted)',
            }}
          >
            {movement.category?.name?.substring(0, 2).toUpperCase() ?? (isIncome ? 'IN' : 'GA')}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0" style={{ paddingRight: hasActions ? '40px' : '0' }}>
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--foreground)' }}>
              {movement.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs" style={{ color: 'var(--foreground-subtle)' }}>
              <span>{movement.category?.name ?? (isIncome ? 'Ingreso' : 'Sin categoría')}</span>
              <span>•</span>
              <span>{formatDate(movement.date)}</span>
              {movement.account?.name && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[100px]">{movement.account.name}</span>
                </>
              )}
            </div>

            {/* Etiquetas */}
            {movement.tags && movement.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {movement.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated border border-border flex items-center gap-1"
                  >
                    <TagIcon size={8} /> {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Monto */}
          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className="font-bold whitespace-nowrap text-base"
              style={{ color: isIncome ? 'var(--positive)' : 'var(--foreground)' }}
            >
              {isIncome ? '+' : '-'}{formatCurrency(movement.amount)}
            </span>
          </div>
        </div>

        {/* Botón de 3 puntos — 44×44px táctil, siempre visible */}
        {hasActions && (
          <div
            style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
            onClick={e => e.stopPropagation()} // No propagar el click al card
          >
            <button
              type="button"
              aria-label="Opciones del movimiento"
              onClick={e => {
                e.stopPropagation()
                setMenuOpen(prev => !prev)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--foreground-muted)',
                transition: 'color 0.15s ease',
              }}
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown rápido */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={e => { e.stopPropagation(); setMenuOpen(false) }}
                />
                <div
                  className="absolute right-0 top-12 z-50 rounded-lg shadow-modal py-1 min-w-[140px] slide-up"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      setMenuOpen(false)
                      setDetailOpen(true)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: 'var(--foreground)' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Ver detalle
                  </button>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onEdit(movement)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--foreground)' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      ✏️ Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        setMenuOpen(false)
                        onDelete(movement)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: 'var(--negative)' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'var(--negative-light)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      🗑 Eliminar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      {detailOpen && (
        <MovementDetailSheet
          movement={movement}
          onClose={() => setDetailOpen(false)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  )
}
