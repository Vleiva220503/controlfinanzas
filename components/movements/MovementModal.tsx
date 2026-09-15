'use client'
// components/movements/MovementModal.tsx
// Full-screen bottom sheet on mobile, centered dialog on desktop
// Handles both income and expense creation/editing

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateMovement, useUpdateMovement } from '@/hooks/useMovements'
import { useAccounts } from '@/hooks/useAccounts'
import { useCategories } from '@/hooks/useCategories'
import { movementSchema, type MovementFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'
import type { Movement } from '@/types/database'

interface MovementModalProps {
  defaultType: 'ingreso' | 'gasto'
  onClose: () => void
  editMovement?: Movement
}

const INCOME_TYPES = ['Salario', 'Bono', 'Comisión', 'Freelance', 'Inversión', 'Adicional', 'Otro']

export function MovementModal({ defaultType, onClose, editMovement }: MovementModalProps) {
  const createMovement = useCreateMovement()
  const updateMovement = useUpdateMovement()
  const { data: accounts = [] } = useAccounts()
  const { data: incomeCategories = [] } = useCategories('ingreso')
  const { data: expenseCategories = [] } = useCategories('gasto')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema) as any,
    defaultValues: {
      type: editMovement?.type ?? defaultType,
      date: editMovement?.date ?? format(new Date(), 'yyyy-MM-dd'),
      description: editMovement?.description ?? '',
      amount: editMovement?.amount ?? ('' as unknown as number),
      account_id: editMovement?.account_id ?? '',
      category_id: editMovement?.category_id ?? '',
      payment_method_id: editMovement?.payment_method_id ?? '',
      income_type: editMovement?.income_type ?? '',
      expense_type: editMovement?.expense_type ?? '',
      notes: editMovement?.notes ?? '',
      is_recurring: editMovement?.is_recurring ?? false,
    },
  })

  const type = watch('type')
  const isIncome = type === 'ingreso'
  const categories = isIncome ? incomeCategories : expenseCategories

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard: Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function onSubmit(data: MovementFormValues) {
    if (editMovement) {
      await updateMovement.mutateAsync({ id: editMovement.id, values: data })
    } else {
      await createMovement.mutateAsync(data)
    }
    onClose()
  }

  const accentColor = isIncome ? 'var(--positive)' : 'var(--negative)'
  const accentBg = isIncome ? 'var(--positive-light)' : 'var(--negative-light)'

  return (
    <>
      {/* Backdrop — semitransparent, click to close */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal container — flex column, aligns sheet to bottom on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="movement-modal-title"
        className="fade-in"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 55,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Bottom sheet */}
        <div
          className="slide-up"
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
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Drag handle (mobile visual affordance) */}
          <div
            className="mobile-only"
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '10px',
              paddingBottom: '4px',
              flexShrink: 0,
            }}
          >
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--border)' }} />
          </div>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: accentBg,
                  flexShrink: 0,
                }}
              >
                {isIncome
                  ? <TrendingUp size={16} style={{ color: 'var(--positive)' }} />
                  : <TrendingDown size={16} style={{ color: 'var(--negative)' }} />
                }
              </div>
              <h2
                id="movement-modal-title"
                style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--foreground)', margin: 0 }}
              >
                {editMovement
                  ? `Editar ${isIncome ? 'ingreso' : 'gasto'}`
                  : `Nuevo ${isIncome ? 'ingreso' : 'gasto'}`
                }
              </h2>
            </div>
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
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--foreground-muted)',
                flexShrink: 0,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Type toggle (only when creating) */}
          {!editMovement && (
            <div style={{ padding: '1rem 1.25rem 0' }}>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  background: 'var(--surface-subtle)',
                }}
              >
                {(['ingreso', 'gasto'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('type', t)}
                    style={{
                      flex: 1,
                      padding: '0.625rem 0',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-lg)',
                      margin: '3px',
                      transition: 'all 0.15s ease',
                      background: type === t
                        ? (t === 'ingreso' ? 'var(--positive)' : 'var(--negative)')
                        : 'transparent',
                      color: type === t ? 'white' : 'var(--foreground-muted)',
                      boxShadow: type === t ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                    }}
                  >
                    {t === 'ingreso' ? '↑ Ingreso' : '↓ Gasto'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="movement-form"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1rem 1.25rem',
              flex: 1,
            }}
          >
            {/* Amount — prominent field */}
            <div className="field">
              <label htmlFor="amount" className="label">Monto *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {/* Currency prefix box — NOT absolute, uses flexbox */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '44px',
                    paddingLeft: '0.75rem',
                    paddingRight: '0.5rem',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--foreground-muted)',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    borderRight: 'none',
                    borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  C$
                </span>
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className={cn(errors.amount ? 'border-negative' : '')}
                  style={{
                    flex: 1,
                    height: '44px',
                    padding: '0.625rem 0.75rem',
                    background: 'var(--surface)',
                    border: `1px solid ${errors.amount ? 'var(--negative)' : 'var(--border)'}`,
                    borderLeft: 'none',
                    borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                    color: accentColor,
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    width: '100%',
                  }}
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && <span className="field-error">{errors.amount.message}</span>}
            </div>

            {/* Description */}
            <div className="field">
              <label htmlFor="description" className="label">Descripción *</label>
              <input
                id="description"
                type="text"
                placeholder={isIncome ? 'Ej: Salario agosto' : 'Ej: Supermercado'}
                className={cn('input', errors.description && 'border-negative')}
                {...register('description')}
              />
              {errors.description && <span className="field-error">{errors.description.message}</span>}
            </div>

            {/* Date */}
            <div className="field">
              <label htmlFor="date" className="label">Fecha *</label>
              <input
                id="date"
                type="date"
                className={cn('input', errors.date && 'border-negative')}
                {...register('date')}
              />
              {errors.date && <span className="field-error">{errors.date.message}</span>}
            </div>

            {/* Income type / Category */}
            {isIncome ? (
              <div className="field">
                <label htmlFor="income_type" className="label">Tipo de ingreso</label>
                <select id="income_type" className="input" {...register('income_type')}>
                  <option value="">Selecciona tipo</option>
                  {INCOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <div className="field">
                <label htmlFor="category_id" className="label">Categoría</label>
                <select id="category_id" className="input" {...register('category_id')}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Account */}
            <div className="field">
              <label htmlFor="account_id" className="label">Cuenta</label>
              <select id="account_id" className="input" {...register('account_id')}>
                <option value="">Sin cuenta</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div className="field">
              <label htmlFor="notes" className="label">Observaciones</label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Notas opcionales..."
                className="input"
                style={{ resize: 'vertical', minHeight: '68px' }}
                {...register('notes')}
              />
            </div>
          </form>

          {/* Footer — sticky at bottom */}
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
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="movement-form"
              disabled={isSubmitting}
              className="btn"
              style={{ flex: 2, background: accentColor, color: 'white' }}
            >
              {isSubmitting ? 'Guardando…' : editMovement ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
