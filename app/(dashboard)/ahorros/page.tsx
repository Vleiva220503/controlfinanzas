'use client'
// app/(dashboard)/ahorros/page.tsx
import { Target } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function AhorrosPage() {
  return (
    <div className="flex flex-col gap-6 fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Ahorros</h1>
        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Tus metas financieras</p>
      </div>
      <div className="card p-8">
        <EmptyState 
          icon={Target}
          title="Metas de Ahorro (Próximamente)" 
          description="En la siguiente fase podrás configurar metas de ahorro y registrar tus aportes."
        />
      </div>
    </div>
  )
}
