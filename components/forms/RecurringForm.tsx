'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '@/hooks/useCategories'
import { useAccounts } from '@/hooks/useAccounts'
import { useCreateRecurring } from '@/hooks/useRecurring'
import { cn } from '@/lib/utils'
import { INCOME_TYPES } from '@/lib/finance/validators'
import { useState } from 'react'
import type { MovementType } from '@/types/database'

const recurringSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  type: z.enum(['ingreso', 'gasto']),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  frequency: z.enum(['semanal', 'quincenal', 'mensual', 'anual']),
  day_of_month: z.number().min(1).max(31).optional().nullable(),
  start_date: z.string().min(1, 'La fecha de inicio es requerida'),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  income_type: z.string().optional(),
  active: z.boolean().default(true),
})

type RecurringFormValues = z.infer<typeof recurringSchema>

export function RecurringForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
  const [type, setType] = useState<MovementType>('gasto')
  
  const { data: categories = [], isLoading: isLoadingCat } = useCategories(type)
  const { data: accounts = [], isLoading: isLoadingAcc } = useAccounts()
  const createRecurring = useCreateRecurring()

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema) as any,
    defaultValues: {
      type: 'gasto',
      amount: 0,
      frequency: 'mensual',
      start_date: new Date().toISOString().split('T')[0],
      active: true,
      day_of_month: new Date().getDate(),
    },
  })
  
  // Watch type change to update category options
  const watchType = watch('type')
  if (watchType !== type) {
    setType(watchType)
    setValue('category_id', '') // Reset category when type changes
  }
  
  const frequency = watch('frequency')

  const onSubmit = async (data: RecurringFormValues) => {
    await createRecurring.mutateAsync({
      ...data,
      category_id: data.category_id || null,
      account_id: data.account_id || null,
      income_type: data.type === 'ingreso' ? (data.income_type || null) : null,
      day_of_month: ['mensual', 'quincenal'].includes(data.frequency) ? data.day_of_month || 1 : null,
      end_date: null,
      last_generated_month: null,
    })
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 sm:p-5 h-full overflow-y-auto">
      
      {/* Type Toggle */}
      <div className="flex bg-surface-subtle border border-border rounded-xl overflow-hidden p-1">
        <button
          type="button"
          onClick={() => setValue('type', 'ingreso')}
          className={cn(
            'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
            type === 'ingreso' ? 'bg-positive text-white shadow-soft' : 'text-foreground-muted hover:bg-surface'
          )}
        >
          ↑ Ingreso
        </button>
        <button
          type="button"
          onClick={() => setValue('type', 'gasto')}
          className={cn(
            'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
            type === 'gasto' ? 'bg-negative text-white shadow-soft' : 'text-foreground-muted hover:bg-surface'
          )}
        >
          ↓ Gasto
        </button>
      </div>

      <div className="field">
        <label htmlFor="description" className="label">Descripción *</label>
        <input id="description" type="text" className={cn('input', errors.description && 'border-negative')} {...register('description')} />
        {errors.description && <span className="field-error">{errors.description.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="amount" className="label">Monto *</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '44px', paddingLeft: '0.75rem', paddingRight: '0.5rem',
              fontWeight: 700, fontSize: '1rem', color: 'var(--foreground-muted)',
              background: 'var(--surface-subtle)', border: '1px solid var(--border)',
              borderRight: 'none', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', flexShrink: 0
            }}
          >C$</span>
          <input
            id="amount" type="number" inputMode="decimal" step="0.01" min="0.01"
            className={cn(errors.amount ? 'border-negative' : '')}
            style={{
              flex: 1, height: '44px', padding: '0.625rem 0.75rem', background: 'var(--surface)',
              border: `1px solid ${errors.amount ? 'var(--negative)' : 'var(--border)'}`,
              borderLeft: 'none', borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              color: type === 'ingreso' ? 'var(--positive)' : 'var(--negative)',
              fontWeight: 700, fontSize: '1.125rem', outline: 'none', width: '100%'
            }}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>
        {errors.amount && <span className="field-error">{errors.amount.message}</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label htmlFor="frequency" className="label">Frecuencia *</label>
          <select id="frequency" className={cn('input', errors.frequency && 'border-negative')} {...register('frequency')}>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>
        </div>
        
        <div className="field">
          <label htmlFor="start_date" className="label">A partir de *</label>
          <input id="start_date" type="date" className={cn('input', errors.start_date && 'border-negative')} {...register('start_date')} />
        </div>
      </div>
      
      {['mensual', 'quincenal'].includes(frequency) && (
        <div className="field">
          <label htmlFor="day_of_month" className="label">Día de cobro/pago (1-31)</label>
          <input 
            id="day_of_month" 
            type="number" 
            min="1" 
            max="31"
            className={cn('input', errors.day_of_month && 'border-negative')} 
            {...register('day_of_month', { valueAsNumber: true })} 
          />
        </div>
      )}

      {type === 'ingreso' ? (
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
          <select id="category_id" className="input" {...register('category_id')} disabled={isLoadingCat}>
            <option value="">Sin categoría</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div className="field">
        <label htmlFor="account_id" className="label">Cuenta destino/origen</label>
        <select id="account_id" className="input" {...register('account_id')} disabled={isLoadingAcc}>
          <option value="">Efectivo / Sin cuenta</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border">
        {onCancel && <button type="button" onClick={onCancel} className="btn btn-ghost" disabled={createRecurring.isPending}>Cancelar</button>}
        <button type="submit" className="btn btn-primary" disabled={createRecurring.isPending}>
          {createRecurring.isPending ? 'Guardando...' : 'Crear Recurrente'}
        </button>
      </div>
    </form>
  )
}
