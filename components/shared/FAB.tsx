'use client'
// components/shared/FAB.tsx
// Floating Action Button — always visible on mobile
// Opens a quick-add menu: ingreso / gasto / transferencia

import { useState, useRef, useEffect } from 'react'
import { Plus, X, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import { MovementModal } from '@/components/movements/MovementModal'
import { TransferModal } from '@/components/movements/TransferModal'

type ActionType = 'ingreso' | 'gasto' | 'transferencia' | null

export function FAB() {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<ActionType>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSelect(type: ActionType) {
    setAction(type)
    setOpen(false)
  }

  return (
    <>
      {/* FAB + quick-action menu */}
      <div ref={menuRef} style={{ position: 'fixed', bottom: 'calc(72px + env(safe-area-inset-bottom))', right: '1rem', zIndex: 40 }}>

        {/* Quick action options */}
        {open && (
          <div
            className="flex flex-col items-end gap-2 mb-3 fade-in"
            role="menu"
            aria-label="Agregar movimiento"
          >
            <FabOption
              icon={<TrendingUp size={18} />}
              label="Ingreso"
              color="var(--positive)"
              onClick={() => handleSelect('ingreso')}
            />
            <FabOption
              icon={<TrendingDown size={18} />}
              label="Gasto"
              color="var(--negative)"
              onClick={() => handleSelect('gasto')}
            />
            <FabOption
              icon={<ArrowLeftRight size={18} />}
              label="Transferencia"
              color="var(--warning)"
              onClick={() => handleSelect('transferencia')}
            />
          </div>
        )}

        {/* Main FAB button */}
        <button
          type="button"
          className="fab"
          aria-label={open ? 'Cerrar menú' : 'Agregar movimiento'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          style={{ position: 'relative', bottom: 'auto', right: 'auto' }}
        >
          <span
            style={{
              display: 'flex',
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            {open ? <X size={24} /> : <Plus size={24} />}
          </span>
        </button>
      </div>

      {/* Modals */}
      {(action === 'ingreso' || action === 'gasto') && (
        <MovementModal
          defaultType={action}
          onClose={() => setAction(null)}
        />
      )}
      {action === 'transferencia' && (
        <TransferModal onClose={() => setAction(null)} />
      )}
    </>
  )
}

function FabOption({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full shadow-card text-white text-sm font-semibold slide-up"
      style={{ background: color, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {icon}
      {label}
    </button>
  )
}
