'use client'
// app/(dashboard)/reportes/page.tsx
import { PieChart } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function ReportesPage() {
  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Reportes</h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Análisis financiero avanzado</p>
      </div>
      <div className="card p-8">
        <EmptyState 
          icon={PieChart}
          title="Reportes (Próximamente)" 
          description="En la siguiente fase podrás ver reportes detallados y gráficos interactivos."
        />
      </div>
    </div>
  )
}
