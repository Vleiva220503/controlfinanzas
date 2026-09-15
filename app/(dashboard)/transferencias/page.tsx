'use client'
// app/(dashboard)/transferencias/page.tsx
// Historial de Transferencias — usando React Query en lugar de useEffect manual

import { useState } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/finance/formatters'
import { EmptyState } from '@/components/shared/EmptyState'
import { TransferModal } from '@/components/movements/TransferModal'
import { TableSkeleton } from '@/components/shared/Skeleton'

function useTransfers() {
  return useQuery({
    queryKey: ['transfers'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('transfers')
        .select('*, from_account:accounts!from_account_id(name), to_account:accounts!to_account_id(name)')
        .order('date', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export default function TransferenciasPage() {
  const { data: transfers, isLoading } = useTransfers()
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Transferencias</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Movimientos de dinero entre tus cuentas
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn desktop-only"
          style={{ background: 'var(--warning)', color: 'white' }}
        >
          <Plus size={18} />
          Nueva Transferencia
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : !transfers || transfers.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No hay transferencias"
            description="Aquí aparecerán los movimientos entre tus cuentas."
            action={
              <button onClick={() => setModalOpen(true)} className="btn btn-secondary mt-4">
                Registrar Transferencia
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th className="px-5 py-3 font-medium text-foreground-muted">Fecha</th>
                  <th className="px-5 py-3 font-medium text-foreground-muted">Origen</th>
                  <th className="px-5 py-3 font-medium text-foreground-muted">Destino</th>
                  <th className="px-5 py-3 font-medium text-foreground-muted">Notas</th>
                  <th className="px-5 py-3 font-medium text-right text-foreground-muted">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transfers.map(t => (
                  <tr key={t.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-5 py-4 text-foreground-muted">{formatDate(t.date)}</td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {(t.from_account as { name?: string } | null)?.name ?? '—'}
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {(t.to_account as { name?: string } | null)?.name ?? '—'}
                    </td>
                    <td
                      className="px-5 py-4 text-foreground-muted truncate max-w-[200px]"
                    >
                      {t.notes ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold" style={{ color: 'var(--warning)' }}>
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <TransferModal
          onClose={() => {
            setModalOpen(false)
            qc.invalidateQueries({ queryKey: ['transfers'] })
          }}
        />
      )}
    </div>
  )
}
