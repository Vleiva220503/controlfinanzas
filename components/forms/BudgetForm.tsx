'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { budgetSchema, type BudgetFormValues } from '@/lib/finance/validators'
import { useCategories } from '@/hooks/useCategories'
import { useCreateBudget } from '@/hooks/useBudgets'
import { useMonth } from '@/components/providers/MonthProvider'
import { cn } from '@/lib/utils'

export function BudgetForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  const { selectedMonth } = useMonth()
  const { data: categories = [], isLoading: isLoadingCat } = useCategories('gasto')
  const createBudget = useCreateBudget()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      month: selectedMonth,
      amount: 0 as unknown as number,
      category_id: '',
    },
  })

  const onSubmit = async (data: BudgetFormValues) => {
    await createBudget.mutateAsync(data)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="category_id" className="label">Categoría *</label>
        <select
          id="category_id"
          className={cn('input', errors.category_id && 'border-negative')}
          {...register('category_id')}
          disabled={isLoadingCat}
        >
          <option value="">Selecciona categoría</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {errors.category_id && <span className="field-error">{errors.category_id.message}</span>}
      </div>

      <div className="field">
        <label htmlFor="amount" className="label">Monto (Límite) *</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
              color: 'var(--accent)',
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

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost" disabled={createBudget.isPending}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={createBudget.isPending}>
          {createBudget.isPending ? 'Guardando...' : 'Guardar Presupuesto'}
        </button>
      </div>
    </form>
  )
}
