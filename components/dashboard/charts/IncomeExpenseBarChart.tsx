'use client'
// components/dashboard/charts/IncomeExpenseBarChart.tsx

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatMonthShort } from '@/lib/finance/formatters'
import { EmptyState } from '@/components/shared/EmptyState'

interface IncomeExpenseBarChartProps {
  data: { month: string; income: number; expenses: number }[]
}

// Tooltip declarado fuera del componente renderizante (fix ESLint react-hooks/static-components)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.75rem 1rem',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.875rem',
          minWidth: '150px',
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid var(--border)' }}>
          {formatMonthShort(label as string)}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any) => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--foreground-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, flexShrink: 0, display: 'inline-block' }} />
                {entry.name === 'income' ? 'Ingresos' : 'Gastos'}
              </span>
              <span style={{ fontWeight: 600, color: entry.color }}>
                {formatCurrency(entry.value as number)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function IncomeExpenseBarChart({ data }: IncomeExpenseBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <EmptyState title="Sin datos" description="Aún no hay movimientos registrados." />
      </div>
    )
  }

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthShort}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            tickFormatter={(value: number) => {
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
              if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
              return String(value)
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-subtle)' }} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(value) => (
              <span style={{ color: 'var(--foreground-muted)' }}>
                {value === 'income' ? 'Ingresos' : 'Gastos'}
              </span>
            )}
            iconType="circle"
          />
          <Bar dataKey="income" name="income" fill="var(--positive)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expenses" name="expenses" fill="var(--negative)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
