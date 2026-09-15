'use client'
// app/(dashboard)/cuentas/page.tsx
// Gestión de Cuentas (CRUD)

import { useState } from 'react'
import { Plus, Wallet, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts'
import { AccountForm } from '@/components/forms/AccountForm'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { formatCurrency } from '@/lib/finance/formatters'
import type { Account } from '@/types/database'
import type { AccountFormValues } from '@/lib/finance/validators'

// Radix Dropdown para el menú de opciones (necesitaremos instalarlo si no está, o usar un simple div relativo)
// Para no depender de componentes complejos sin instalarlos, haremos un menú simple con estado local

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const handleOpenCreate = () => {
    setEditingAccount(null)
    setIsModalOpen(true)
    setActiveMenuId(null)
  }

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account)
    setIsModalOpen(true)
    setActiveMenuId(null)
  }

  const handleDeleteRequest = (account: Account) => {
    setAccountToDelete(account)
    setActiveMenuId(null)
  }

  const handleSubmit = async (values: AccountFormValues) => {
    if (editingAccount) {
      await updateAccount.mutateAsync({ id: editingAccount.id, values })
    } else {
      await createAccount.mutateAsync(values)
    }
    setIsModalOpen(false)
  }

  const confirmDelete = async () => {
    if (accountToDelete) {
      await deleteAccount.mutateAsync(accountToDelete.id)
      setAccountToDelete(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Cuentas</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Administra tus cuentas bancarias, efectivo y tarjetas
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={18} />
          Nueva Cuenta
        </button>
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : !accounts || accounts.length === 0 ? (
          <EmptyState 
            icon={Wallet}
            title="No tienes cuentas" 
            description="Crea tu primera cuenta para empezar a registrar movimientos."
            action={
              <button onClick={handleOpenCreate} className="btn btn-secondary mt-4">
                Crear Cuenta
              </button>
            }
          />
        ) : (
          <>
            {/* Vista Móvil (Tarjetas) */}
            <div className="mobile-only flex flex-col gap-3">
              {accounts.map(account => (
                <div key={account.id} className="card p-4 flex flex-col gap-3 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent-light text-accent flex-shrink-0">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{account.name}</h3>
                        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{account.type}</span>
                      </div>
                    </div>
                    
                    {/* Botón de opciones (Móvil) */}
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === account.id ? null : account.id)}
                      className="btn btn-ghost"
                      style={{ minHeight: '32px', width: '32px', padding: 0 }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {/* Menú Móvil */}
                    {activeMenuId === account.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                        <div 
                          className="absolute right-4 top-10 z-50 rounded-lg shadow-modal py-1 min-w-[140px] slide-up"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                        >
                          <button
                            onClick={() => handleOpenEdit(account)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-subtle transition-colors"
                            style={{ color: 'var(--foreground)' }}
                          >
                            <Edit2 size={14} /> Editar
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(account)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-negative-light transition-colors"
                            style={{ color: 'var(--negative)' }}
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Saldo Actual</span>
                    <span className="text-lg font-bold" style={{ color: account.current_balance < 0 ? 'var(--negative)' : 'var(--foreground)' }}>
                      {formatCurrency(account.current_balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Desktop (Tabla) */}
            <div className="desktop-only w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th className="px-5 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Nombre</th>
                    <th className="px-5 py-3 font-medium" style={{ color: 'var(--foreground-muted)' }}>Tipo</th>
                    <th className="px-5 py-3 font-medium text-right" style={{ color: 'var(--foreground-muted)' }}>Saldo Actual</th>
                    <th className="px-5 py-3 font-medium text-right" style={{ color: 'var(--foreground-muted)' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts.map(account => (
                    <tr key={account.id} className="hover:bg-surface-subtle transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-light text-accent">
                            <Wallet size={16} />
                          </div>
                          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{account.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4" style={{ color: 'var(--foreground-muted)' }}>
                        {account.type}
                      </td>
                      <td className="px-5 py-4 text-right font-medium" style={{ color: account.current_balance < 0 ? 'var(--negative)' : 'var(--foreground)' }}>
                        {formatCurrency(account.current_balance)}
                      </td>
                      <td className="px-5 py-4 text-right relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === account.id ? null : account.id)}
                          className="btn btn-ghost"
                          style={{ minHeight: '32px', width: '32px', padding: 0 }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu Simple */}
                        {activeMenuId === account.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div 
                              className="absolute right-5 top-12 z-50 rounded-lg shadow-modal py-1 min-w-[140px] slide-up"
                              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                            >
                              <button
                                onClick={() => handleOpenEdit(account)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-subtle transition-colors"
                                style={{ color: 'var(--foreground)' }}
                              >
                                <Edit2 size={14} /> Editar
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(account)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-negative-light transition-colors"
                                style={{ color: 'var(--negative)' }}
                              >
                                <Trash2 size={14} /> Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="overlay z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md rounded-2xl p-6 slide-up relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
            </h2>
            <AccountForm 
              defaultValues={editingAccount || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsModalOpen(false)}
              isSubmitting={createAccount.isPending || updateAccount.isPending}
            />
          </div>
        </div>
      )}

      {/* Dialogo Confirmar Eliminación */}
      <ConfirmDialog 
        open={!!accountToDelete}
        title="Eliminar Cuenta"
        description={`¿Estás seguro de que deseas eliminar la cuenta "${accountToDelete?.name}"? Esta acción eliminará también todos los movimientos asociados a esta cuenta.`}
        dangerous
        confirmLabel={deleteAccount.isPending ? 'Eliminando...' : 'Sí, eliminar'}
        onConfirm={confirmDelete}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  )
}
