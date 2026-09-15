'use client'
// app/(dashboard)/page.tsx — Dashboard principal

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
import { groupByMonth } from '@/lib/finance/calculations'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { selectedMonth } = useMonth()
  const { data: dashboardData, isLoading: isLoadingStats, error: statsError } = useDashboardStats(selectedMonth)
  const { data: historicalData, isLoading: isLoadingHistorical } = useHistoricalData()
  const { data: budgets = [], isLoading: isLoadingBudgets } = useBudgets(selectedMonth)

  // Calcular datos históricos usando useMemo para evitar re-cálculo en cada render
  const chartData = useMemo(
    () => (historicalData ? groupByMonth(historicalData as Parameters<typeof groupByMonth>[0]) : []),
    [historicalData]
  )

  const balanceChartData = useMemo(() => {
    return chartData.reduce<{ month: string; balance: number }[]>((acc, d) => {
      const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
      acc.push({ month: d.month, balance: lastBalance + d.savings })
      return acc
    }, [])
  }, [chartData])

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
    <div className="flex flex-col gap-6 fade-in">

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
          <div className="card p-4 sm:p-5">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Ingresos vs Gastos</h3>
            {isLoadingHistorical ? <ChartSkeleton /> : <IncomeExpenseBarChart data={chartData} />}
          </div>

          <div className="card p-4 sm:p-5">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Evolución del Ahorro</h3>
            {isLoadingHistorical ? <ChartSkeleton /> : <BalanceLineChart data={balanceChartData} />}
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
