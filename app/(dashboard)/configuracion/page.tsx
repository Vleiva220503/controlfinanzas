'use client'
// app/(dashboard)/configuracion/page.tsx
// Página de configuración general: Categorías, Métodos de pago, Preferencias

import { useState } from 'react'
import { Plus, Tag, CreditCard, Edit2, Trash2, Check, X } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { usePaymentMethods, useCreatePaymentMethod, useUpdatePaymentMethod, useDeletePaymentMethod } from '@/hooks/usePaymentMethods'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import type { Category, PaymentMethod, MovementType } from '@/types/database'
import type { CategoryFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<'gastos' | 'ingresos' | 'pagos' | 'general'>('gastos')
  
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

  // Payment Methods
  const { data: paymentMethods = [], isLoading: isLoadingPM } = usePaymentMethods()
  const createPM = useCreatePaymentMethod()
  const updatePM = useUpdatePaymentMethod()
  const deletePM = useDeletePaymentMethod()

  const [newPMName, setNewPMName] = useState('')
  const [editingPM, setEditingPM] = useState<{ id: string; name: string } | null>(null)
  const [pmToDelete, setPmToDelete] = useState<PaymentMethod | null>(null)

  const handleCreatePM = async () => {
    if (!newPMName.trim()) return
    await createPM.mutateAsync(newPMName.trim())
    setNewPMName('')
  }

  const handleUpdatePM = async () => {
    if (!editingPM || !editingPM.name.trim()) return
    await updatePM.mutateAsync({ id: editingPM.id, name: editingPM.name.trim() })
    setEditingPM(null)
  }

  const confirmDeletePM = async () => {
    if (pmToDelete) {
      await deletePM.mutateAsync(pmToDelete.id)
      setPmToDelete(null)
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

  const tabs = [
    { key: 'gastos', label: 'Cats. Gasto' },
    { key: 'ingresos', label: 'Cats. Ingreso' },
    { key: 'pagos', label: 'Métodos Pago' },
    { key: 'general', label: 'General' },
  ] as const

  return (
    <div className="flex flex-col gap-6 fade-in max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Configuración</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
          Administra categorías, métodos de pago y preferencias.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-subtle border border-border overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
              activeTab === t.key ? "bg-surface shadow-sm text-foreground" : "text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="card overflow-hidden">
        
        {/* Tab: Gastos */}
        {activeTab === 'gastos' && (
          <div>
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Categorías de Gasto</h2>
              <button onClick={handleOpenCreateCategory} className="btn btn-primary" style={{ minHeight: '36px', padding: '0 0.75rem', fontSize: '0.875rem' }}>
                <Plus size={14} /> Nueva
              </button>
            </div>
            {renderCategoriesTable(expenseCategories, isLoadingExpenses, 'gasto')}
          </div>
        )}

        {/* Tab: Ingresos */}
        {activeTab === 'ingresos' && (
          <div>
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Categorías de Ingreso</h2>
              <button onClick={handleOpenCreateCategory} className="btn btn-primary" style={{ minHeight: '36px', padding: '0 0.75rem', fontSize: '0.875rem' }}>
                <Plus size={14} /> Nueva
              </button>
            </div>
            {renderCategoriesTable(incomeCategories, isLoadingIncomes, 'ingreso')}
          </div>
        )}

        {/* Tab: Métodos de Pago */}
        {activeTab === 'pagos' && (
          <div>
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border">
              <h2 className="font-semibold" style={{ color: 'var(--foreground)' }}>Métodos de Pago</h2>
            </div>

            {/* Inline create form */}
            <div className="p-4 sm:p-5 border-b border-border bg-surface-subtle">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nombre del método (ej: Tarjeta BDF, Efectivo...)"
                  value={newPMName}
                  onChange={(e) => setNewPMName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePM() }}
                  className="input flex-1 bg-surface"
                />
                <button
                  onClick={handleCreatePM}
                  className="btn btn-primary"
                  disabled={!newPMName.trim() || createPM.isPending}
                >
                  <Plus size={18} />
                  {createPM.isPending ? '...' : 'Agregar'}
                </button>
              </div>
            </div>

            {/* List */}
            {isLoadingPM ? (
              <div className="p-4"><TableSkeleton rows={3} /></div>
            ) : paymentMethods.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="Sin métodos de pago"
                description="Agrega métodos de pago como Efectivo, Tarjeta de crédito, etc."
              />
            ) : (
              <div className="divide-y divide-border">
                {paymentMethods.map(pm => (
                  <div key={pm.id} className="px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-surface-subtle transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
                      <CreditCard size={16} className="text-accent" />
                    </div>
                    
                    {editingPM?.id === pm.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingPM.name}
                          onChange={(e) => setEditingPM({ ...editingPM, name: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdatePM(); if (e.key === 'Escape') setEditingPM(null) }}
                          className="input flex-1 bg-surface"
                          style={{ minHeight: '36px', padding: '0.375rem 0.625rem' }}
                          autoFocus
                        />
                        <button onClick={handleUpdatePM} className="btn btn-primary" style={{ minHeight: '36px', padding: '0 0.5rem' }}>
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingPM(null)} className="btn btn-ghost" style={{ minHeight: '36px', padding: '0 0.5rem' }}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-foreground flex-1">{pm.name}</span>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setEditingPM({ id: pm.id, name: pm.name })}
                            className="btn btn-ghost"
                            style={{ minHeight: '32px', padding: '0 0.5rem', color: 'var(--foreground-muted)' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setPmToDelete(pm)}
                            className="btn btn-ghost hover:bg-negative-light"
                            style={{ minHeight: '32px', padding: '0 0.5rem', color: 'var(--negative)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-surface-subtle">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">💰</span>
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Moneda</h4>
                </div>
                <p className="text-foreground-muted text-sm">Córdoba Nicaragüense</p>
                <p className="text-accent font-bold text-lg">C$ (NIO)</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-surface-subtle">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📅</span>
                  <h4 className="font-medium" style={{ color: 'var(--foreground)' }}>Formato de fecha</h4>
                </div>
                <p className="text-foreground-muted text-sm">Día/Mes/Año</p>
                <p className="text-accent font-bold text-lg">DD/MM/YYYY</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Categoría */}
      {isCategoryModalOpen && (
        <div className="overlay z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <div 
            className="w-full max-w-sm rounded-2xl p-6 slide-up relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
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

      {/* Dialogo Eliminar Método de Pago */}
      <ConfirmDialog 
        open={!!pmToDelete}
        title="Eliminar Método de Pago"
        description={`¿Deseas eliminar el método "${pmToDelete?.name}"? Los movimientos asociados quedarán sin método de pago.`}
        dangerous
        confirmLabel={deletePM.isPending ? 'Eliminando...' : 'Sí, eliminar'}
        onConfirm={confirmDeletePM}
        onCancel={() => setPmToDelete(null)}
      />
    </div>
  )
}
