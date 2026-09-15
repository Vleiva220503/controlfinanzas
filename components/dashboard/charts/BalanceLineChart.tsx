
'use client'
// components/dashboard/charts/BalanceLineChart.tsx
// Gráfico de evolución de saldo histórico

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatMonthShort } from '@/lib/finance/formatters'
import { EmptyState } from '@/components/shared/EmptyState'

interface BalanceLineChartProps {
  data: { month: string; balance: number }[]
}

// Componente de tooltip declarado FUERA del componente renderizante (requerido por ESLint react-hooks/static-components)
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
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
          {formatMonthShort(label as string)}
        </p>
        <p>
          <span style={{ color: 'var(--foreground-muted)', marginRight: '0.5rem' }}>Saldo:</span>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
            {formatCurrency(payload[0].value as number)}
          </span>
        </p>
      </div>
    )
  }
  return null
}

export function BalanceLineChart({ data }: BalanceLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center">
        <EmptyState title="Sin datos históricos" description="Aún no hay suficiente historial para este gráfico." />
      </div>
    )
  }

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthShort}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground-muted)', fontSize: 12 }}
            dy={10}
            minTickGap={20}
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--accent)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
