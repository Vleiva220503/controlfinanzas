'use client'
// components/movements/MovementTable.tsx
// Vista de tabla para escritorio de movimientos

import { useState } from 'react'
import { Edit2, Trash2, MoreVertical } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'
import { EmptyState } from '@/components/shared/EmptyState'
import { ArrowLeftRight } from 'lucide-react'

interface MovementTableProps {
  movements: Movement[]
  onEdit: (m: Movement) => void
  onDelete: (m: Movement) => void
}

export function MovementTable({ movements, onEdit, onDelete }: MovementTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

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
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
          <tr>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Fecha</th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Descripción</th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Categoría</th>
            <th className="px-4 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Cuenta</th>
            <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--foreground-muted)' }}>Monto</th>
            <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--foreground-muted)', width: '60px' }}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {movements.map(mov => {
            const isIncome = mov.type === 'ingreso'
            return (
              <tr key={mov.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-4 py-3 text-foreground-muted">{formatDate(mov.date)}</td>
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex flex-col">
                    <span>{mov.description}</span>
                    {mov.tags && mov.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {mov.tags.map(tag => (
                          <span key={tag.id} className="text-[10px] px-1.5 rounded bg-surface-elevated border border-border text-foreground-subtle">
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
                      background: mov.category?.color ? `color-mix(in srgb, ${mov.category.color} 15%, transparent)` : 'var(--surface-elevated)',
                      color: mov.category?.color || 'var(--foreground-muted)'
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
                <td className="px-4 py-3 text-right relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === mov.id ? null : mov.id)}
                    className="p-1 rounded text-foreground-subtle hover:text-foreground transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeMenuId === mov.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                      <div 
                        className="absolute right-8 top-10 z-50 rounded-lg shadow-modal py-1 min-w-[120px] slide-up"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                      >
                        <button
                          onClick={() => { setActiveMenuId(null); onEdit(mov); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-subtle transition-colors text-foreground"
                        >
                          <Edit2 size={14} /> Editar
                        </button>
                        <button
                          onClick={() => { setActiveMenuId(null); onDelete(mov); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-negative-light transition-colors text-negative"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
