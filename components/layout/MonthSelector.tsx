'use client'
// components/layout/MonthSelector.tsx
// Selector de mes/año — navegación rápida prev/next + input directo

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useMonth } from '@/components/providers/MonthProvider'
import { formatMonth, currentMonth } from '@/lib/finance/formatters'
import { cn } from '@/lib/utils'

interface MonthSelectorProps {
  compact?: boolean
}

export function MonthSelector({ compact = false }: MonthSelectorProps) {
  const { selectedMonth, goToPrevMonth, goToNextMonth, isCurrentMonth, setSelectedMonth } = useMonth()

  function handleMonthInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value // format: YYYY-MM from input[type=month]
    if (value) setSelectedMonth(value)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-xl',
        compact ? 'p-1' : 'p-1.5'
      )}
      style={{
        background: 'var(--surface-subtle)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Prev month */}
      <button
        type="button"
        onClick={goToPrevMonth}
        aria-label="Mes anterior"
        className="btn btn-ghost"
        style={{
          minHeight: '36px',
          width: '36px',
          padding: 0,
          borderRadius: 'var(--radius-md)',
        }}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Month display / input */}
      <div className="relative flex items-center">
        <button
          type="button"
          aria-label="Seleccionar mes"
          className="flex items-center gap-1.5 px-2 font-medium text-sm"
          style={{ color: 'var(--foreground)', minWidth: compact ? '100px' : '140px', justifyContent: 'center' }}
          onClick={() => {
            // Trigger the hidden input
            const input = document.getElementById('month-input') as HTMLInputElement
            input?.showPicker?.()
          }}
        >
          <Calendar size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span className={compact ? 'text-xs' : 'text-sm'}>
            {formatMonth(selectedMonth)}
          </span>
        </button>
        {/* Hidden native month input for mobile pickers */}
        <input
          id="month-input"
          type="month"
          value={selectedMonth}
          onChange={handleMonthInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label="Selector de mes"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Next month */}
      <button
        type="button"
        onClick={goToNextMonth}
        aria-label="Mes siguiente"
        className="btn btn-ghost"
        style={{
          minHeight: '36px',
          width: '36px',
          padding: 0,
          borderRadius: 'var(--radius-md)',
        }}
      >
        <ChevronRight size={16} />
      </button>

      {/* Ir al mes actual */}
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={() => setSelectedMonth(currentMonth())}
          className="text-xs px-2 py-1 rounded-md font-medium"
          style={{
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            marginLeft: '2px',
          }}
          aria-label="Ir al mes actual"
        >
          Hoy
        </button>
      )}
    </div>
  )
}
