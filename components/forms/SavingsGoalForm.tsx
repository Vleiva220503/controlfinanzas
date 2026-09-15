'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { savingsGoalSchema, type SavingsGoalFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface SavingsGoalFormProps {
  defaultValues?: Partial<SavingsGoalFormValues>
  onSubmit: (values: SavingsGoalFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function SavingsGoalForm({ defaultValues, onSubmit, onCancel, isSubmitting }: SavingsGoalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalSchema) as any,
    defaultValues: defaultValues || {
      name: '',
      target_amount: '' as unknown as number,
      target_date: undefined,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="name" className="label">Nombre de la Meta *</label>
        <input
          id="name"
          type="text"
          className={cn('input', errors.name && 'border-negative')}
          placeholder="Ej: Fondo de emergencia, Viaje, etc."
          {...register('name')}
        />
        {errors.name && <span className="field-error">{errors.name.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="target_amount" className="label">Monto Objetivo *</label>
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
            id="target_amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            className={cn(errors.target_amount ? 'border-negative' : '')}
            style={{
              flex: 1,
              height: '44px',
              padding: '0.625rem 0.75rem',
              background: 'var(--surface)',
              border: `1px solid ${errors.target_amount ? 'var(--negative)' : 'var(--border)'}`,
              borderLeft: 'none',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
            {...register('target_amount', { valueAsNumber: true })}
          />
        </div>
        {errors.target_amount && <span className="field-error">{errors.target_amount.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="target_date" className="label">Fecha Objetivo (Opcional)</label>
        <input
          id="target_date"
          type="date"
          className={cn('input', errors.target_date && 'border-negative')}
          {...register('target_date')}
        />
        {errors.target_date && <span className="field-error">{errors.target_date.message}</span>}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border mt-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
          {isSubmitting ? 'Guardando...' : 'Guardar Meta'}
        </button>
      </div>
    </form>
  )
}
