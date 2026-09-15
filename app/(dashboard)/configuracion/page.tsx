'use client'
// app/(dashboard)/configuracion/page.tsx
// Página de configuración general: Categorías, Métodos de pago, Preferencias

import { useState } from 'react'
import { Plus, Tag, CreditCard, Edit2, Trash2 } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import type { Category, MovementType } from '@/types/database'
import type { CategoryFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<'gastos' | 'ingresos' | 'general'>('gastos')
  
  // Categorías
  const { data: expenseCategories, isLoading: isLoadingExpenses } = useCategories('gasto')
  const { data: incomeCategories, isLoading: isLoadingIncomes } = useCategories('ingreso')
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const handleOpenCreateCategory = () => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setIsCategoryModalOpen(true)
  }

  const handleSubmitCategory = async (values: CategoryFormValues) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, values })
    } else {
      await createCategory.mutateAsync(values)
    }
    setIsCategoryModalOpen(false)
  }

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      await deleteCategory.mutateAsync(categoryToDelete.id)
      setCategoryToDelete(null)
    }
  }

  // Renderizador de tabla de categorías
  const renderCategoriesTable = (categories: Category[] | undefined, isLoading: boolean, type: MovementType) => {
    if (isLoading) return <TableSkeleton rows={3} />
    
    if (!categories || categories.length === 0) {
      return (
        <EmptyState 
          icon={Tag}
          title={`No hay categorías de ${type}`}
          description={`Crea categorías para organizar tus ${type}s.`}
          action={
            <button onClick={handleOpenCreateCategory} className="btn btn-secondary mt-4">
              Crear Categoría
            </button>
          }
        />
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th className="px-5 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Categoría</th>
              <th className="px-5 py-3 font-medium text-right" style={{ color: 'var(--foreground-muted)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-surface-subtle transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: cat.color || 'var(--border)' }} 
                    />
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEditCategory(cat)}
                      className="btn btn-ghost"
                      style={{ minHeight: '32px', padding: '0 0.5rem', color: 'var(--foreground-muted)' }}
                      aria-label="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setCategoryToDelete(cat)}
                      className="btn btn-ghost hover:bg-negative-light"
                      style={{ minHeight: '32px', padding: '0 0.5rem', color: 'var(--negative)' }}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Configuración</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
          Administra categorías, métodos de pago y preferencias.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-subtle border border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('gastos')}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
            activeTab === 'gastos' ? "bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"
          )}
        >
          Categorías de Gasto
        </button>
        <button
          onClick={() => setActiveTab('ingresos')}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
            activeTab === 'ingresos' ? "bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"
          )}
        >
          Categorías de Ingreso
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
            activeTab === 'general' ? "bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"
          )}
        >
          General
        </button>
      </div>

      {/* Content Area */}
      <div className="card overflow-hidden">
        
        {/* Tab: Gastos */}
        {activeTab === 'gastos' && (
          <div>
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Gastos</h2>
              <button onClick={handleOpenCreateCategory} className="btn btn-primary h-8 px-3 text-xs">
                <Plus size={14} className="mr-1" /> Nueva Categoría
              </button>
            </div>
            {renderCategoriesTable(expenseCategories, isLoadingExpenses, 'gasto')}
          </div>
        )}

        {/* Tab: Ingresos */}
        {activeTab === 'ingresos' && (
          <div>
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Ingresos</h2>
              <button onClick={handleOpenCreateCategory} className="btn btn-primary h-8 px-3 text-xs">
                <Plus size={14} className="mr-1" /> Nueva Categoría
              </button>
            </div>
            {renderCategoriesTable(incomeCategories, isLoadingIncomes, 'ingreso')}
          </div>
        )}

        {/* Tab: General */}
        {activeTab === 'general' && (
          <div className="p-4 sm:p-6 flex flex-col gap-6">
            <div>
               <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--foreground)' }}>Preferencias de la aplicación</h3>
               <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                 Las configuraciones generales (moneda, formatos) se gestionan a nivel de base de datos en esta versión. 
                 Por defecto la moneda es <strong>C$ (NIO)</strong>.
               </p>
            </div>
            
            <div className="p-4 rounded-xl border border-border bg-surface-subtle">
               <div className="flex items-center gap-3 mb-2">
                 <CreditCard size={20} className="text-accent" />
                 <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Métodos de Pago</h4>
               </div>
               <p className="text-sm text-foreground-muted mb-4">
                 Gestión de métodos de pago (Efectivo, Tarjeta, etc.).
               </p>
               <button className="btn btn-secondary text-sm h-9" disabled>
                 Próximamente
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Categoría */}
      {isCategoryModalOpen && (
        <div className="overlay z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-sm rounded-2xl p-6 slide-up relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <CategoryForm 
              defaultValues={editingCategory || undefined}
              type={activeTab === 'ingresos' ? 'ingreso' : 'gasto'}
              onSubmit={handleSubmitCategory}
              onCancel={() => setIsCategoryModalOpen(false)}
              isSubmitting={createCategory.isPending || updateCategory.isPending}
            />
          </div>
        </div>
      )}

      {/* Dialogo Eliminar Categoría */}
      <ConfirmDialog 
        open={!!categoryToDelete}
        title="Eliminar Categoría"
        description={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Los movimientos asociados quedarán sin categoría.`}
        dangerous
        confirmLabel={deleteCategory.isPending ? 'Eliminando...' : 'Sí, eliminar'}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />

    </div>
  )
}
