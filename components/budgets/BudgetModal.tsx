'use client'
import { useEffect, useRef } from 'react'
import { X, PieChart } from 'lucide-react'
import { BudgetForm } from '@/components/forms/BudgetForm'

interface BudgetModalProps {
  onClose: () => void
}

export function BudgetModal({ onClose }: BudgetModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div 
      className="overlay flex items-center justify-center p-4 sm:p-6" 
      ref={overlayRef} 
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      style={{
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        backgroundColor: 'rgba(0,0,0,0.45)',
      }}
    >
      <div 
        className="w-full max-w-md bg-surface border border-border shadow-modal flex flex-col slide-up"
        style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <PieChart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-foreground m-0 leading-tight">Nuevo Presupuesto</h2>
              <p className="text-xs text-foreground-muted m-0 mt-0.5">Define límite para categoría</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-border text-foreground-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 sm:p-5">
          <BudgetForm onSuccess={onClose} onCancel={onClose} />
        </div>
      </div>
    </div>
  )
}
