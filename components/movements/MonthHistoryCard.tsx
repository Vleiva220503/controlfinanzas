'use client'
// components/movements/MonthHistoryCard.tsx
// Tarjeta acordeón por mes en el Historial con desglose diario

import { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { formatCurrency, formatMonth } from '@/lib/finance/formatters'
import type { Movement } from '@/types/database'
import { groupByDay } from '@/lib/finance/calculations'
import { MovementCard } from './MovementCard'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface MonthHistoryCardProps {
  monthKey: string // YYYY-MM
  income: number
  expenses: number
  savings: number
  movements: Movement[]
  defaultOpen?: boolean
}

export function MonthHistoryCard({
  monthKey,
  income,
  expenses,
  savings,
  movements,
  defaultOpen = false
}: MonthHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  // Agrupar movimientos por día
  const groupedByDay = groupByDay(movements)
  // Ordenar días de más reciente a más antiguo
  const sortedDays = Array.from(groupedByDay.entries()).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div className="card overflow-hidden transition-all duration-300">
      {/* Header del Acordeón */}
      <div 
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-subtle transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <Calendar size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-lg capitalize" style={{ color: 'var(--foreground)' }}>
              {formatMonth(monthKey)}
            </h3>
            <p className="text-sm text-foreground-muted flex gap-2">
              <span>{movements.length} movimientos</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 flex-1">
          {/* Resumen */}
          <div className="flex gap-4 sm:gap-6 text-right">
            <div className="flex flex-col">
              <span className="text-xs text-foreground-muted">Ingresos</span>
              <span className="font-semibold text-positive">+{formatCurrency(income)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-foreground-muted">Gastos</span>
              <span className="font-semibold text-negative">-{formatCurrency(expenses)}</span>
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-xs text-foreground-muted">Ahorro</span>
              <span className="font-semibold" style={{ color: savings >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {formatCurrency(savings)}
              </span>
            </div>
          </div>
          
          {/* Icono de expansión */}
          <div className="text-foreground-muted flex-shrink-0">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Body del Acordeón (Desglose diario) */}
      {isOpen && (
        <div className="border-t border-border bg-surface-subtle/30 pb-2">
          {sortedDays.length === 0 ? (
            <div className="p-8 text-center text-foreground-muted">
              No hay movimientos en este mes.
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-3 sm:p-5">
              {sortedDays.map(([date, data]) => {
                const dayDate = parseISO(date)
                
                return (
                  <div key={date} className="flex flex-col gap-2">
                    {/* Encabezado del día */}
                    <div className="flex items-center justify-between pb-1 border-b border-border/50">
                      <h4 className="font-medium text-sm capitalize" style={{ color: 'var(--foreground)' }}>
                        {format(dayDate, "EEEE d 'de' MMMM", { locale: es })}
                      </h4>
                      <div className="flex gap-3 text-xs font-medium">
                        {data.income > 0 && (
                          <span className="text-positive">+{formatCurrency(data.income)}</span>
                        )}
                        {data.expenses > 0 && (
                          <span className="text-negative">-{formatCurrency(data.expenses)}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Lista de movimientos de ese día */}
                    <div className="flex flex-col gap-2 pl-2 sm:pl-4 border-l-2 border-border/30">
                      {data.movements.map(mov => (
                        <MovementCard key={mov.id} movement={mov} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
