'use client'
// components/forms/AccountForm.tsx
// Formulario compartido para crear/editar Cuentas

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, type AccountFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'
import type { Account } from '@/types/database'

interface AccountFormProps {
  defaultValues?: Partial<Account>
  onSubmit: (data: AccountFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const ACCOUNT_TYPES = [
  'Efectivo',
  'Cuenta de Banco',
  'Tarjeta de Crédito',
  'Ahorros',
  'Inversión',
  'Otro',
]

export function AccountForm({ defaultValues, onSubmit, onCancel, isSubmitting }: AccountFormProps) {
  const isEditing = !!defaultValues?.id

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? '',
      initial_balance: defaultValues?.initial_balance ?? 0,
    },
  })

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="name" className="label">Nombre de la cuenta *</label>
        <input
          id="name"
          type="text"
          placeholder="Ej: BDF Planilla"
          className={cn('input', errors.name && 'border-negative')}
          {...register('name')}
        />
        {errors.name && <span className="field-error">{errors.name.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="type" className="label">Tipo de cuenta *</label>
        <select
          id="type"
          className={cn('input', errors.type && 'border-negative')}
          {...register('type')}
        >
          <option value="">Selecciona un tipo</option>
          {ACCOUNT_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.type && <span className="field-error">{errors.type.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="initial_balance" className="label">Saldo Inicial *</label>
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
            id="initial_balance"
            type="number"
            inputMode="decimal"
            step="0.01"
            className={cn(errors.initial_balance ? 'border-negative' : '')}
            style={{
              flex: 1,
              height: '44px',
              padding: '0.625rem 0.75rem',
              background: 'var(--surface)',
              border: `1px solid ${errors.initial_balance ? 'var(--negative)' : 'var(--border)'}`,
              borderLeft: 'none',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
            disabled={isEditing}
            {...register('initial_balance', { valueAsNumber: true })}
          />
        </div>
        {errors.initial_balance && <span className="field-error">{errors.initial_balance.message}</span>}
        {isEditing && (
          <p className="text-xs text-foreground-subtle mt-1">
            El saldo inicial no puede modificarse una vez creada la cuenta. Si necesitas ajustar el saldo, registra un ingreso o gasto.
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
        <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
          {isSubmitting ? 'Guardando...' : 'Guardar Cuenta'}
        </button>
      </div>
    </form>
  )
}
