'use client'
import { useMonth } from '@/components/providers/MonthProvider'
import { useDashboardStats, useHistoricalData } from '@/hooks/useDashboardStats'
import { IncomeExpenseBarChart } from '@/components/dashboard/charts/IncomeExpenseBarChart'
import { BalanceLineChart } from '@/components/dashboard/charts/BalanceLineChart'
import { CategoryPieChart } from '@/components/dashboard/charts/CategoryPieChart'
import type { Movement } from '@/types/database'
import { groupByMonth } from '@/lib/finance/calculations'
import { formatCurrency, formatMonthShort } from '@/lib/finance/formatters'
import { ChartSkeleton } from '@/components/shared/Skeleton'
import { useMemo } from 'react'

export default function ReportesPage() {
  const { selectedMonth } = useMonth()
  const { data: dashboardData, isLoading: isLoadingStats } = useDashboardStats(selectedMonth)
  const { data: historicalData, isLoading: isLoadingHistorical } = useHistoricalData(12)

  const chartData = useMemo(
    () => {
      if (!historicalData) return []
      return groupByMonth(historicalData).map(d => ({
        label: formatMonthShort(d.month),
        income: d.income,
        expenses: d.expenses,
        savings: d.savings,
      }))
    },
    [historicalData]
  )

  const balanceChartData = useMemo(() => {
    return chartData.reduce<{ label: string; balance: number }[]>((acc, d) => {
      const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
      acc.push({ label: d.label, balance: lastBalance + d.savings })
      return acc
    }, [])
  }, [chartData])

  // Process category data from current month movements
  const categoryData = useMemo(() => {
    if (!dashboardData?.currentMovements) return []
    const expenses = dashboardData.currentMovements.filter(m => m.type === 'gasto')
    
    const catMap = new Map<string, { name: string; value: number; color?: string }>()
    expenses.forEach(m => {
      if (m.category) {
        const existing = catMap.get(m.category.id)
        if (existing) {
          existing.value += m.amount
        } else {
          catMap.set(m.category.id, { 
            name: m.category.name, 
            value: m.amount, 
            color: m.category.color || undefined 
          })
        }
      }
    })
    
    return Array.from(catMap.values()).sort((a, b) => b.value - a.value)
  }, [dashboardData?.currentMovements])

  return (
    <div className="flex flex-col gap-6 fade-in max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Reportes y Análisis</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Desglose detallado de tus finanzas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gastos por categoría */}
        <div className="card p-4 sm:p-6 flex flex-col h-full">
          <h3 className="font-semibold mb-4 text-foreground">Gastos por Categoría ({selectedMonth})</h3>
          {isLoadingStats ? <ChartSkeleton /> : (
            <div className="flex-1 min-h-[300px]">
              <CategoryPieChart data={categoryData} />
            </div>
          )}
        </div>

        {/* Top Categorías */}
        <div className="card p-4 sm:p-6 flex flex-col h-full">
          <h3 className="font-semibold mb-4 text-foreground">Top Categorías ({selectedMonth})</h3>
          {isLoadingStats ? (
            <div className="flex flex-col gap-4"><ChartSkeleton height={40}/><ChartSkeleton height={40}/></div>
          ) : categoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-foreground-muted text-sm border border-dashed border-border rounded-xl">No hay gastos este mes</div>
          ) : (
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2">
              {categoryData.slice(0, 5).map((cat, i) => {
                const total = categoryData.reduce((acc, c) => acc + c.value, 0)
                const percent = Math.round((cat.value / total) * 100)
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className="font-bold text-foreground">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="progress flex-1" style={{ height: '6px' }}>
                        <div className="progress-bar" style={{ width: `${percent}%`, backgroundColor: cat.color || 'var(--accent)' }} />
                      </div>
                      <span className="text-xs text-foreground-muted font-medium w-8 text-right">{percent}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Histórico Ingresos vs Gastos */}
        <div className="card p-4 sm:p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4 text-foreground">Histórico Ingresos vs Gastos</h3>
          <div className="min-h-[300px]">
            {isLoadingHistorical ? <ChartSkeleton /> : <IncomeExpenseBarChart data={chartData} />}
          </div>
        </div>

        {/* Evolución Ahorro/Saldo */}
        <div className="card p-4 sm:p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4 text-foreground">Evolución de Flujo Neto (Ahorro Mensual)</h3>
          <div className="min-h-[300px]">
            {isLoadingHistorical ? <ChartSkeleton /> : <BalanceLineChart data={balanceChartData} />}
          </div>
        </div>

      </div>
    </div>
  )
}
