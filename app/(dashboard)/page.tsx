'use client'
// app/(dashboard)/page.tsx — Dashboard principal

import { useState, useMemo } from 'react'
import { useMonth } from '@/components/providers/MonthProvider'
import { useDashboardStats, useHistoricalData } from '@/hooks/useDashboardStats'
import { useBudgets } from '@/hooks/useBudgets'
import { KPICard } from '@/components/dashboard/KPICard'
import { RecentMovements } from '@/components/dashboard/RecentMovements'
import { BudgetAlerts } from '@/components/dashboard/BudgetAlerts'
import { BalanceLineChart } from '@/components/dashboard/charts/BalanceLineChart'
import { IncomeExpenseBarChart } from '@/components/dashboard/charts/IncomeExpenseBarChart'
import { EmptyState } from '@/components/shared/EmptyState'
import { KPICardSkeleton, ChartSkeleton } from '@/components/shared/Skeleton'
import { Wallet, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { groupByMonth, groupByDay } from '@/lib/finance/calculations'
import { formatMonthShort } from '@/lib/finance/formatters'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type TimeRange = 'day' | 'month' | 'year'

export default function DashboardPage() {
  const { selectedMonth } = useMonth()
  const { data: dashboardData, isLoading: isLoadingStats, error: statsError } = useDashboardStats(selectedMonth)
  const { data: historicalData, isLoading: isLoadingHistorical } = useHistoricalData()
  const { data: budgets = [], isLoading: isLoadingBudgets } = useBudgets(selectedMonth)

  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  // Calcular datos para el gráfico de barras según el TimeRange seleccionado
  const chartData = useMemo(() => {
    if (timeRange === 'day') {
      if (!dashboardData?.currentMovements) return []
      const grouped = groupByDay(dashboardData.currentMovements)
      return Array.from(grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({
          label: format(parseISO(date), 'dd MMM', { locale: es }),
          income: data.income,
          expenses: data.expenses,
          savings: data.income - data.expenses,
        }))
    } else if (timeRange === 'month') {
      if (!historicalData) return []
      return groupByMonth(historicalData).map(d => ({
        label: formatMonthShort(d.month),
        income: d.income,
        expenses: d.expenses,
        savings: d.savings,
      }))
    } else {
      // year
      if (!historicalData) return []
      const map = new Map<string, { income: number; expenses: number }>()
      for (const m of historicalData) {
        const year = m.month.substring(0, 4)
        if (!map.has(year)) map.set(year, { income: 0, expenses: 0 })
        const entry = map.get(year)!
        if (m.type === 'ingreso') entry.income += Number(m.amount)
        else entry.expenses += Number(m.amount)
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, data]) => ({
          label: year,
          income: data.income,
          expenses: data.expenses,
          savings: data.income - data.expenses,
        }))
    }
  }, [timeRange, dashboardData?.currentMovements, historicalData])

  // Calcular datos para el gráfico de línea (saldo evolutivo)
  const balanceChartData = useMemo(() => {
    // Si estamos en 'Día', el saldo base es el carryOver (arrastre de meses previos).
    // Para 'Mes' o 'Año', empezamos desde 0 en esta visualización para ver la tendencia neta.
    let currentBalance = (timeRange === 'day' && dashboardData?.carryOver !== undefined) 
      ? dashboardData.carryOver 
      : 0
      
    return chartData.map(d => {
      currentBalance += d.savings
      return { label: d.label, balance: currentBalance }
    })
  }, [chartData, timeRange, dashboardData?.carryOver])

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <EmptyState
          title="Error al cargar el dashboard"
          description="Ocurrió un problema al obtener los datos. Por favor, intenta de nuevo."
        />
      </div>
    )
  }

  const stats = dashboardData?.stats
  const recentMovements = dashboardData?.recentMovements || []

  return (
    <div className="flex flex-col gap-6 fade-in max-w-6xl mx-auto">

      {/* ─── KPIs Grid ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {isLoadingStats || !stats ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          <>
            <KPICard
              title="Saldo Total"
              amount={stats.totalAccountsBalance}
              variation={null}
              type="neutral"
              icon={<Wallet size={48} strokeWidth={1.5} />}
            />
            <KPICard
              title="Ingresos"
              amount={stats.totalIncome}
              variation={stats.incomeVariation}
              type="positive"
              icon={<TrendingUp size={48} strokeWidth={1.5} />}
            />
            <KPICard
              title="Gastos"
              amount={stats.totalExpenses}
              variation={stats.expensesVariation}
              type="negative"
              icon={<TrendingDown size={48} strokeWidth={1.5} />}
            />
            <KPICard
              title="Ahorro Mensual"
              amount={stats.savings}
              variation={null}
              type={stats.savings >= 0 ? 'positive' : 'negative'}
              icon={<Target size={48} strokeWidth={1.5} />}
            />
          </>
        )}
      </section>

      {/* ─── Gráficos y Alertas ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gráficos — 2 columnas en desktop */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Controles de Gráficos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
            <h3 className="font-semibold text-foreground">Análisis Financiero</h3>
            
            <div className="flex bg-surface-subtle p-1 rounded-lg border border-border self-start sm:self-auto">
              <button
                onClick={() => setTimeRange('day')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  timeRange === 'day' ? "bg-surface shadow-sm text-foreground" : "text-foreground-muted hover:text-foreground"
                )}
              >
                Día (Este Mes)
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  timeRange === 'month' ? "bg-surface shadow-sm text-foreground" : "text-foreground-muted hover:text-foreground"
                )}
              >
                Mes (Histórico)
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  timeRange === 'year' ? "bg-surface shadow-sm text-foreground" : "text-foreground-muted hover:text-foreground"
                )}
              >
                Año (Histórico)
              </button>
            </div>
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="font-semibold mb-4 text-sm text-foreground-muted">Ingresos vs Gastos</h3>
            {isLoadingHistorical || isLoadingStats ? <ChartSkeleton /> : <IncomeExpenseBarChart data={chartData} />}
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="font-semibold mb-4 text-sm text-foreground-muted">Evolución del Saldo</h3>
            {isLoadingHistorical || isLoadingStats ? <ChartSkeleton /> : <BalanceLineChart data={balanceChartData} />}
          </div>
        </div>

        {/* Panel derecho — 1 columna en desktop */}
        <div className="flex flex-col gap-6 h-full">

          {!isLoadingBudgets && budgets.length > 0 && (
            <BudgetAlerts budgets={budgets} />
          )}

          <div className="flex-1 min-h-[300px]">
            {isLoadingStats ? (
              <div className="card h-full p-4 flex flex-col gap-4">
                <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Últimos Movimientos</h3>
                <div className="flex flex-col gap-3">
                  <ChartSkeleton height={40} />
                  <ChartSkeleton height={40} />
                  <ChartSkeleton height={40} />
                  <ChartSkeleton height={40} />
                </div>
              </div>
            ) : (
              <RecentMovements movements={recentMovements} />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
