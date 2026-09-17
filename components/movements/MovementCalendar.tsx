'use client'
// components/movements/MovementCalendar.tsx
// Vista de calendario por mes para los movimientos

import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday, parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMonth } from '@/components/providers/MonthProvider'
import { groupByDay } from '@/lib/finance/calculations'
import { formatCurrency } from '@/lib/finance/formatters'
import { MovementDetailSheet } from './MovementDetailSheet'
import { MonthSelector } from '../layout/MonthSelector'
import type { Movement } from '@/types/database'
import { MovementCard } from './MovementCard'

interface MovementCalendarProps {
  movements: Movement[]
  onEdit?: (m: Movement) => void
  onDelete?: (m: Movement) => void
}

export function MovementCalendar({ movements, onEdit, onDelete }: MovementCalendarProps) {
  const { selectedMonth } = useMonth()
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  
  // Date-fns usa objetos Date
  const monthDate = new Date(`${selectedMonth}-01T00:00:00`)
  
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }) // Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  const groupedMovements = groupByDay(movements)

  // Obtener movimientos del día seleccionado (si lo hay)
  const selectedDayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null
  const selectedDayData = selectedDayKey ? groupedMovements.get(selectedDayKey) : null
  const selectedDayMovements = selectedDayData?.movements || []

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera del calendario */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg capitalize" style={{ color: 'var(--foreground)' }}>
          {format(monthDate, 'MMMM yyyy', { locale: es })}
        </h2>
        {/* Usamos el mismo MonthSelector del dashboard pero en modo compacto si se desea, o normal */}
        <div className="mobile-only">
          <MonthSelector compact />
        </div>
        <div className="desktop-only">
          <MonthSelector />
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="card overflow-hidden">
        {/* Días de la semana */}
        <div 
          className="grid grid-cols-7 border-b border-border"
          style={{ background: 'var(--surface-subtle)' }}
        >
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d, i) => (
            <div key={i} className="py-2 text-center text-xs font-semibold text-foreground-muted">
              {d}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayData = groupedMovements.get(dateKey)
            const isCurrentMonth = isSameMonth(day, monthStart)
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
            const isDayToday = isToday(day)
            
            const hasIncome = (dayData?.income ?? 0) > 0
            const hasExpense = (dayData?.expenses ?? 0) > 0

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDay(day)}
                className={`
                  relative min-h-[64px] sm:min-h-[84px] p-1 sm:p-2 border-r border-b border-border cursor-pointer transition-colors
                  ${!isCurrentMonth ? 'opacity-40 bg-surface-subtle/50' : 'bg-surface'}
                  ${isSelected ? 'ring-2 ring-accent ring-inset' : 'hover:bg-surface-subtle'}
                  ${idx % 7 === 6 ? 'border-r-0' : ''} // Sin borde derecho en domingo
                `}
                style={{
                  borderBottom: idx >= days.length - 7 ? 'none' : '1px solid var(--border)'
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span 
                    className={`
                      text-xs sm:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                      ${isDayToday ? 'bg-accent text-white' : 'text-foreground'}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Indicadores de ingresos y gastos */}
                {(hasIncome || hasExpense) && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {/* Desktop: texto completo / Móvil: texto si cabe o puntos */}
                    {hasIncome && (
                      <div className="text-[10px] sm:text-xs font-semibold truncate px-1 rounded-sm bg-positive-light/50 text-positive">
                        <span className="hidden sm:inline">+</span>
                        {formatCurrency(dayData?.income ?? 0)}
                      </div>
                    )}
                    {hasExpense && (
                      <div className="text-[10px] sm:text-xs font-semibold truncate px-1 rounded-sm bg-negative-light/50 text-negative">
                        <span className="hidden sm:inline">-</span>
                        {formatCurrency(dayData?.expenses ?? 0)}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Indicador ultra-compacto para pantallas muy pequeñas (se usaría en CSS si el contenedor es muy pequeño) */}
                <div className="flex gap-1 mt-1 sm:hidden px-1 overflow-hidden" style={{ display: 'none' }}>
                  {hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-positive" />}
                  {hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-negative" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Panel inferior para el día seleccionado */}
      {selectedDay && (
        <div className="slide-up">
          <div className="flex items-center justify-between mb-3 mt-2">
            <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
              Movimientos del {format(selectedDay, 'd de MMMM', { locale: es })}
            </h3>
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-xs text-foreground-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          
          {selectedDayMovements.length === 0 ? (
            <div className="card p-6 text-center text-foreground-muted text-sm border-dashed">
              No hay movimientos en este día.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedDayMovements.map(mov => (
                <MovementCard 
                  key={mov.id} 
                  movement={mov} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
