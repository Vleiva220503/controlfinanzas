'use client'
// components/movements/MovementTable.tsx
// Vista de tabla para escritorio de movimientos
// - Click en fila → abre MovementDetailSheet como modal centrado
// - Botón de 3 puntos: 44×44px táctil

import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'
import { EmptyState } from '@/components/shared/EmptyState'
import { ArrowLeftRight } from 'lucide-react'
import { MovementDetailSheet } from './MovementDetailSheet'

interface MovementTableProps {
  movements: Movement[]
  onEdit?: (m: Movement) => void
  onDelete?: (m: Movement) => void
}

export function MovementTable({ movements, onEdit, onDelete }: MovementTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [detailMovement, setDetailMovement] = useState<Movement | null>(null)

  if (movements.length === 0) {
    return (
      <div className="card p-8">
        <EmptyState
          icon={ArrowLeftRight}
          title="No hay movimientos"
          description="Aún no hay registros para esta vista o filtros."
        />
      </div>
    )
  }

  return (
    <>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Fecha</th>
              <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Descripción</th>
              <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Categoría</th>
              <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Cuenta</th>
              <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--foreground-muted)' }}>Monto</th>
              {(onEdit || onDelete) && (
                <th className="px-2 py-3" style={{ color: 'var(--foreground-muted)', width: '52px' }} />
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movements.map(mov => {
              const isIncome = mov.type === 'ingreso'
              return (
                <tr
                  key={mov.id}
                  className="hover:bg-surface-subtle transition-colors"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setDetailMovement(mov)}
                >
                  <td className="px-4 py-3 text-foreground-muted">{formatDate(mov.date)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex flex-col">
                      <span>{mov.description}</span>
                      {mov.tags && mov.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {mov.tags.map(tag => (
                            <span
                              key={tag.id}
                              className="text-[10px] px-1.5 rounded bg-surface-elevated border border-border text-foreground-subtle"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{
                        background: mov.category?.color
                          ? `color-mix(in srgb, ${mov.category.color} 15%, transparent)`
                          : 'var(--surface-elevated)',
                        color: mov.category?.color || 'var(--foreground-muted)',
                      }}
                    >
                      {mov.category?.name ?? (isIncome ? 'Ingreso' : 'Sin categoría')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">{mov.account?.name ?? '—'}</td>
                  <td
                    className="px-4 py-3 text-right font-semibold"
                    style={{ color: isIncome ? 'var(--positive)' : 'var(--foreground)' }}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(mov.amount)}
                  </td>

                  {/* Botón 3 puntos — 44×44px */}
                  {(onEdit || onDelete) && (
                    <td
                      className="py-3 pr-2 text-right relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label={`Opciones de ${mov.description}`}
                        onClick={e => {
                          e.stopPropagation()
                          setActiveMenuId(activeMenuId === mov.id ? null : mov.id)
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '44px',
                          height: '44px',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: 'var(--foreground-subtle)',
                          transition: 'color 0.15s ease, background 0.15s ease',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.color = 'var(--foreground)'
                          e.currentTarget.style.background = 'var(--surface-subtle)'
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.color = 'var(--foreground-subtle)'
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === mov.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={e => { e.stopPropagation(); setActiveMenuId(null) }}
                          />
                          <div
                            className="absolute right-8 top-10 z-50 rounded-lg shadow-modal py-1 min-w-[140px] slide-up"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                          >
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                setActiveMenuId(null)
                                setDetailMovement(mov)
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-foreground"
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
                                  setActiveMenuId(null)
                                  onEdit(mov)
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-foreground"
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
                                  setActiveMenuId(null)
                                  onDelete(mov)
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
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Sheet (modal centrado en desktop) */}
      {detailMovement && (
        <MovementDetailSheet
          movement={detailMovement}
          onClose={() => setDetailMovement(null)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </>
  )
}
