'use client'
import { useState, useMemo } from 'react'
import { History, Download, Search } from 'lucide-react'
import { useMovements } from '@/hooks/useMovements'
import { MonthHistoryCard } from '@/components/movements/MonthHistoryCard'
import { TableSkeleton, MovementCardSkeleton } from '@/components/shared/Skeleton'
import type { Movement, MovementFilters } from '@/types/database'
import { format } from 'date-fns'

export default function HistorialPage() {
  // Sin month, traemos TODO
  const [filters, setFilters] = useState<MovementFilters>({ type: 'all' })
  const [search, setSearch] = useState('')
  
  // Custom hook usage with no month limit
  const { data: movements, isLoading } = useMovements(filters)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (val.length > 2 || val.length === 0) {
      setFilters(prev => ({ ...prev, search: val || undefined }))
    }
  }

  const exportCSV = () => {
    if (!movements || movements.length === 0) return

    const headers = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Cuenta', 'Monto']
    const csvContent = movements.map(m => {
      return [
        format(new Date(m.date), 'dd/MM/yyyy'),
        m.type === 'ingreso' ? 'Ingreso' : 'Gasto',
        `"${m.description.replace(/"/g, '""')}"`,
        m.category?.name || 'Sin categoría',
        m.account?.name || 'Efectivo',
        m.amount.toString()
      ].join(',')
    })
    
    const csvString = [headers.join(','), ...csvContent].join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `historial_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  // Agrupar movimientos por mes
  const groupedByMonth = useMemo(() => {
    if (!movements) return []
    const map = new Map<string, { income: number; expenses: number; movements: Movement[] }>()
    
    for (const m of movements) {
      if (!map.has(m.month)) map.set(m.month, { income: 0, expenses: 0, movements: [] })
      const entry = map.get(m.month)!
      if (m.type === 'ingreso') entry.income += Number(m.amount)
      else entry.expenses += Number(m.amount)
      entry.movements.push(m)
    }
    
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a)) // Sort by month desc (recent first)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.income - data.expenses,
        movements: data.movements
      }))
  }, [movements])

  return (
    <div className="flex flex-col gap-6 fade-in max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent-light">
            <History size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Historial Completo</h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Registro de todos tus movimientos</p>
          </div>
        </div>
        <button onClick={exportCSV} className="btn btn-secondary" disabled={isLoading || movements?.length === 0}>
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
        <div className="input-with-icon flex-1 w-full max-w-md">
          <span className="input-icon-left"><Search size={18} /></span>
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={search}
            onChange={handleSearch}
            className="input w-full bg-surface"
          />
        </div>
        <select 
          className="input w-full sm:w-48 bg-surface text-sm"
          value={filters.type || 'all'}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
        >
          <option value="all">Todos los tipos</option>
          <option value="ingreso">Solo ingresos</option>
          <option value="gasto">Solo gastos</option>
        </select>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <div className="mobile-only flex flex-col gap-3">
               <MovementCardSkeleton />
               <MovementCardSkeleton />
            </div>
            <div className="desktop-only"><TableSkeleton rows={8} /></div>
          </>
        ) : groupedByMonth.length === 0 ? (
           <div className="card p-8 text-center text-foreground-muted border border-dashed">
             No hay resultados para mostrar
           </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedByMonth.map((group, idx) => (
              <MonthHistoryCard
                key={group.month}
                monthKey={group.month}
                income={group.income}
                expenses={group.expenses}
                savings={group.savings}
                movements={group.movements}
                defaultOpen={idx === 0} // Abrir el más reciente por defecto
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

