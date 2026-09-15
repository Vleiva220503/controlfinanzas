'use client'
// app/(dashboard)/historial/page.tsx
import { History } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function HistorialPage() {
  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Historial Completo</h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Registro de todo el tiempo</p>
      </div>
      <div className="card p-8">
        <EmptyState 
          icon={History}
          title="Historial (Próximamente)" 
          description="En la siguiente fase podrás ver y exportar el historial completo sin filtros mensuales."
        />
      </div>
    </div>
  )
}
