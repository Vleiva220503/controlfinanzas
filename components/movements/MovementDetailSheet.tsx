'use client'
// components/movements/MovementDetailSheet.tsx
// Panel de detalle de un movimiento:
//  - Móvil:   bottom sheet deslizante desde abajo
//  - Desktop: modal centrado
// Muestra todos los campos del movimiento + botones Editar y Eliminar

import { useEffect } from 'react'
import {
  X, Edit2, Trash2, Calendar, Tag as TagIcon,
  Wallet, CreditCard, StickyNote, ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'

interface MovementDetailSheetProps {
  movement: Movement
  onClose: () => void
  onEdit?: (m: Movement) => void
  onDelete?: (m: Movement) => void
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
  valueColor?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.625rem 0' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--surface-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--foreground-muted)',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--foreground-subtle)', marginBottom: '2px' }}>{label}</p>
        <p
          style={{
            fontSize: '0.9375rem',
            color: valueColor ?? 'var(--foreground)',
            fontWeight: 500,
            wordBreak: 'break-word',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

export function MovementDetailSheet({
  movement,
  onClose,
  onEdit,
  onDelete,
}: MovementDetailSheetProps) {
  const isIncome = movement.type === 'ingreso'
  const accentColor = isIncome ? 'var(--positive)' : 'var(--negative)'
  const accentBg = isIncome ? 'var(--positive-light)' : 'var(--negative-light)'

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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

      {/* Sheet container — bottom on mobile, centered on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle: ${movement.description}`}
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
        {/* Desktop: centre the sheet */}
        <style>{`
          @media (min-width: 768px) {
            .detail-sheet-inner {
              align-self: center !important;
              border-radius: var(--radius-2xl) !important;
              max-width: 480px !important;
              max-height: 85dvh !important;
            }
          }
        `}</style>

        <div
          className="detail-sheet-inner slide-up"
          style={{
            pointerEvents: 'auto',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
            width: '100%',
            maxWidth: '540px',
            maxHeight: '92dvh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: accentBg,
                  flexShrink: 0,
                }}
              >
                {isIncome
                  ? <ArrowUpCircle size={22} style={{ color: 'var(--positive)' }} />
                  : <ArrowDownCircle size={22} style={{ color: 'var(--negative)' }} />
                }
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-subtle)', marginBottom: '1px' }}>
                  {isIncome ? 'Ingreso' : 'Gasto'}
                </p>
                <h2
                  style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--foreground)',
                    margin: 0,
                    lineHeight: 1.2,
                    maxWidth: '220px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {movement.description}
                </h2>
              </div>
            </div>

            {/* Amount + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: accentColor, whiteSpace: 'nowrap' }}>
                {isIncome ? '+' : '-'}{formatCurrency(movement.amount)}
              </span>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--surface-subtle)',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ padding: '0.5rem 1.25rem', flex: 1, overflowY: 'auto' }}>
            <DetailRow
              icon={<Calendar size={16} />}
              label="Fecha"
              value={formatDate(movement.date)}
            />
            <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

            {movement.category && (
              <>
                <DetailRow
                  icon={<TagIcon size={16} />}
                  label="Categoría"
                  value={
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.875rem',
                        background: movement.category.color
                          ? `color-mix(in srgb, ${movement.category.color} 18%, transparent)`
                          : 'var(--surface-elevated)',
                        color: movement.category.color ?? 'var(--foreground-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {movement.category.name}
                    </span>
                  }
                />
                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
              </>
            )}

            {movement.account && (
              <>
                <DetailRow
                  icon={<Wallet size={16} />}
                  label="Cuenta"
                  value={movement.account.name}
                />
                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
              </>
            )}

            {movement.payment_method && (
              <>
                <DetailRow
                  icon={<CreditCard size={16} />}
                  label="Método de pago"
                  value={movement.payment_method.name}
                />
                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
              </>
            )}

            {movement.income_type && (
              <>
                <DetailRow
                  icon={<ArrowUpCircle size={16} />}
                  label="Tipo de ingreso"
                  value={movement.income_type}
                />
                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
              </>
            )}

            {movement.tags && movement.tags.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.625rem 0' }}>
                  <div
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-subtle)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      color: 'var(--foreground-muted)',
                    }}
                  >
                    <TagIcon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--foreground-subtle)', marginBottom: '6px' }}>Etiquetas</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {movement.tags.map(tag => (
                        <span
                          key={tag.id}
                          style={{
                            fontSize: '0.75rem',
                            padding: '2px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: tag.color
                              ? `color-mix(in srgb, ${tag.color} 18%, transparent)`
                              : 'var(--surface-elevated)',
                            color: tag.color ?? 'var(--foreground-muted)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
              </>
            )}

            {movement.notes && (
              <DetailRow
                icon={<StickyNote size={16} />}
                label="Observaciones"
                value={movement.notes}
              />
            )}
          </div>

          {/* Footer actions */}
          {(onEdit || onDelete) && (
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
                borderTop: '1px solid var(--border)',
                background: 'var(--surface)',
                flexShrink: 0,
              }}
            >
              {onDelete && (
                <button
                  type="button"
                  onClick={() => { onClose(); onDelete(movement) }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '48px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--negative)',
                    background: 'transparent',
                    color: 'var(--negative)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--negative-light)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Trash2 size={18} /> Eliminar
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => { onClose(); onEdit(movement) }}
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    minHeight: '48px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  <Edit2 size={18} /> Editar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
