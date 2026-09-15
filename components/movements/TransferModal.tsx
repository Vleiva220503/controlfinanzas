'use client'
// components/movements/TransferModal.tsx
// Modal for creating a transfer between accounts

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, ArrowLeftRight } from 'lucide-react'
import { format } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAccounts } from '@/hooks/useAccounts'
import { transferSchema, type TransferFormValues } from '@/lib/finance/validators'
import { cn } from '@/lib/utils'

interface TransferModalProps {
  onClose: () => void
}

export function TransferModal({ onClose }: TransferModalProps) {
  const { data: accounts = [] } = useAccounts()
  const qc = useQueryClient()

  const createTransfer = useMutation({
    mutationFn: async (values: TransferFormValues) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('transfers')
        .insert({ ...values, created_by: user?.id })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['movements'] })
      toast.success('Transferencia registrada')
      onClose()
    },
    onError: () => toast.error('Error al registrar la transferencia'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema) as any,
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-modal-title"
        className="fade-in"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 55,
          display: 'flex',
          alignItems: 'flex-end',
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
            maxWidth: '520px',
            maxHeight: '90dvh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Drag handle */}
          <div
            className="mobile-only"
            style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}
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
                  background: 'var(--warning-light)',
                  flexShrink: 0,
                }}
              >
                <ArrowLeftRight size={16} style={{ color: 'var(--warning)' }} />
              </div>
              <h2 id="transfer-modal-title" style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--foreground)', margin: 0 }}>
                Nueva transferencia
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
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

          {/* Form */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(v => createTransfer.mutate(v as any))} id="transfer-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 1.25rem', flex: 1 }}>

            {/* Amount — flex prefix, no overlap */}
            <div className="field">
              <label htmlFor="transfer-amount" className="label">Monto *</label>
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
                  id="transfer-amount"
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
                    color: 'var(--warning)',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && <span className="field-error">{errors.amount.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="from-account" className="label">Cuenta origen *</label>
              <select id="from-account" className={cn('input', errors.from_account_id && 'border-negative')} {...register('from_account_id')}>
                <option value="">Selecciona cuenta</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.from_account_id && <span className="field-error">{errors.from_account_id.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="to-account" className="label">Cuenta destino *</label>
              <select id="to-account" className={cn('input', errors.to_account_id && 'border-negative')} {...register('to_account_id')}>
                <option value="">Selecciona cuenta</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.to_account_id && <span className="field-error">{errors.to_account_id.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="transfer-date" className="label">Fecha *</label>
              <input id="transfer-date" type="date" className="input" {...register('date')} />
            </div>

            <div className="field">
              <label htmlFor="transfer-notes" className="label">Notas</label>
              <textarea id="transfer-notes" rows={2} className="input" style={{ resize: 'vertical' }} {...register('notes')} />
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
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            <button
              type="submit"
              form="transfer-form"
              disabled={isSubmitting || createTransfer.isPending}
              className="btn"
              style={{ flex: 2, background: 'var(--warning)', color: 'white' }}
            >
              {isSubmitting || createTransfer.isPending ? 'Guardando…' : 'Registrar transferencia'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
