'use client'
// components/shared/ConfirmDialog.tsx
// Reusable confirmation dialog before destructive actions

import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  dangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title = '¿Confirmar acción?',
  description = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  dangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Keyboard: Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <>
      <div
        aria-hidden
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 70,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="fade-in"
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 75,
          padding: '1rem',
          pointerEvents: 'none',
        }}
      >
        <div
          className="slide-up"
          style={{
            pointerEvents: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '420px',
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            {dangerous && (
              <div
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full"
                style={{ background: 'var(--negative-light)' }}
              >
                <AlertTriangle size={20} style={{ color: 'var(--negative)' }} />
              </div>
            )}
            <div>
              <h2 id="confirm-title" className="font-semibold text-base mb-1" style={{ color: 'var(--foreground)' }}>
                {title}
              </h2>
              <p id="confirm-desc" className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {description}
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`btn ${dangerous ? 'btn-danger' : 'btn-primary'}`}
              style={{ flex: 1 }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
