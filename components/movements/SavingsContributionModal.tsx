'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Target } from 'lucide-react'
import { format } from 'date-fns'
import { useCreateContribution } from '@/hooks/useSavings'
import { savingsContributionSchema, type SavingsContributionFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'

interface SavingsContributionModalProps {
  goalId: string
  goalName: string
  onClose: () => void
}

export function SavingsContributionModal({ goalId, goalName, onClose }: SavingsContributionModalProps) {
  const createContribution = useCreateContribution()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<SavingsContributionFormValues>({
    resolver: zodResolver(savingsContributionSchema) as any,
    defaultValues: {
      goal_id: goalId,
      amount: '' as unknown as number,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  })

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

  const onSubmit = async (values: SavingsContributionFormValues) => {
    await createContribution.mutateAsync(values)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
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

      {/* Modal container */}
      <div
        role="dialog"
        aria-modal="true"
        className="fade-in"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 55,
          display: 'flex',
          alignItems: 'flex-end', // bottom sheet on mobile
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          className="slide-up"
          style={{
            pointerEvents: 'auto',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '92dvh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Drag handle */}
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
                  background: 'var(--accent-light)',
                  flexShrink: 0,
                }}
              >
                <Target size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--foreground)', margin: 0 }}>
                Abonar a meta
              </h2>
            </div>
            <button
              type="button"
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

          <div style={{ padding: '0.5rem 1.25rem', background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
             <p className="text-sm text-foreground-muted">Meta seleccionada: <strong className="text-foreground">{goalName}</strong></p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            id="contribution-form"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1rem 1.25rem',
              flex: 1,
            }}
          >
            {/* Amount */}
            <div className="field">
              <label htmlFor="amount" className="label">Monto a abonar *</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '44px',
                    padding: '0 0.5rem 0 0.75rem',
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
                    color: 'var(--positive)',
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

            <div className="field">
              <label htmlFor="notes" className="label">Notas (Opcional)</label>
              <input
                id="notes"
                type="text"
                placeholder="Ej: Ahorro quincenal"
                className="input"
                {...register('notes')}
              />
            </div>
          </form>

          {/* Footer */}
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
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancelar
            </button>
            <button
              type="submit"
              form="contribution-form"
              disabled={isSubmitting || createContribution.isPending}
              className="btn"
              style={{ flex: 2, background: 'var(--positive)', color: 'white' }}
            >
              {isSubmitting || createContribution.isPending ? 'Guardando...' : 'Registrar Aporte'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
