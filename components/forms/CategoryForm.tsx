'use client'
// components/forms/CategoryForm.tsx
// Formulario para crear/editar Categorías

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'
import type { Category, MovementType } from '@/types/database'

interface CategoryFormProps {
  defaultValues?: Partial<Category>
  type: MovementType
  onSubmit: (data: CategoryFormValues) => void
  onCancel: () => void
  isSubmitting?: boolean
}

// Opciones predefinidas de colores
const PRESET_COLORS = [
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', 
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#64748b'
]

export function CategoryForm({ defaultValues, type, onSubmit, onCancel, isSubmitting }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? type,
      color: defaultValues?.color ?? PRESET_COLORS[0],
    },
  })

  const selectedColor = watch('color')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="name" className="label">Nombre de la categoría *</label>
        <input
          id="name"
          type="text"
          placeholder="Ej: Alimentación"
          className={cn('input', errors.name && 'border-negative')}
          {...register('name')}
        />
        {errors.name && <span className="field-error">{errors.name.message}</span>}
      </div>

      <div className="field">
        <label className="label">Color</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={cn(
                "w-8 h-8 rounded-full cursor-pointer transition-transform",
                selectedColor === color ? "scale-110 ring-2 ring-offset-2" : "hover:scale-105"
              )}
              style={{ 
                backgroundColor: color,
                '--tw-ring-color': color,
                '--tw-ring-offset-color': 'var(--surface)'
              } as React.CSSProperties}
              onClick={() => setValue('color', color)}
              aria-label={`Seleccionar color ${color}`}
            />
          ))}
        </div>
        <input type="hidden" {...register('color')} />
      </div>

      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
        <button type="button" onClick={onCancel} className="btn btn-secondary flex-1">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
          {isSubmitting ? 'Guardando...' : 'Guardar Categoría'}
        </button>
      </div>
    </form>
  )
}
