'use client'
// components/providers/MonthProvider.tsx
// Global month/year state — shared across all dashboard pages

import { createContext, useContext, useState, useCallback } from 'react'
import { currentMonth, shiftMonth } from '@/lib/finance/formatters'

interface MonthContextType {
  selectedMonth: string // YYYY-MM
  setSelectedMonth: (month: string) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  isCurrentMonth: boolean
}

const MonthContext = createContext<MonthContextType | null>(null)

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)

  const goToPrevMonth = useCallback(() => {
    setSelectedMonth(m => shiftMonth(m, -1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setSelectedMonth(m => shiftMonth(m, 1))
  }, [])

  const isCurrentMonth = selectedMonth === currentMonth()

  return (
    <MonthContext.Provider
      value={{ selectedMonth, setSelectedMonth, goToPrevMonth, goToNextMonth, isCurrentMonth }}
    >
      {children}
    </MonthContext.Provider>
  )
}

export function useMonth() {
  const ctx = useContext(MonthContext)
  if (!ctx) throw new Error('useMonth must be used within MonthProvider')
  return ctx
}
