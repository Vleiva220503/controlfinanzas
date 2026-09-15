'use client'
// app/(dashboard)/recurrentes/page.tsx
import { RefreshCw } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function RecurrentesPage() {
  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Movimientos Recurrentes</h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Automatiza ingresos y gastos fijos</p>
      </div>
      <div className="card p-8">
        <EmptyState 
          icon={RefreshCw}
          title="Recurrentes (Próximamente)" 
          description="En la siguiente fase podrás configurar movimientos que se generan automáticamente cada mes o quincena."
        />
      </div>
    </div>
  )
}
