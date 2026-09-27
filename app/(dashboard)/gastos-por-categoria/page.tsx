'use client'
// app/(dashboard)/gastos-por-categoria/page.tsx
// Página "Gastos por Categoría" — muestra un grid de tarjetas por categoría
// basado en el mes actualmente seleccionado en el MonthProvider.
// Usa useMovements (no useDashboardStats) porque éste hace el JOIN completo
// con categories, mientras que currentMovements de useDashboardStats solo usa select('*').

import { useState, useMemo } from 'react'
import { LayoutGrid, TrendingDown, ChevronRight } from 'lucide-react'
import { useMonth } from '@/components/providers/MonthProvider'
import { useMovements } from '@/hooks/useMovements'
import { CategoryExpensesPanel } from '@/components/categories/CategoryExpensesPanel'
import { ChartSkeleton } from '@/components/shared/Skeleton'
import { formatCurrency, formatMonth } from '@/lib/finance/formatters'
import type { Category } from '@/types/database'

// ─── Types ─────────────────────────────────────────────────────────────────

interface CategorySummary {
  id: string
  name: string
  color?: string | null
  icon?: string | null
  total: number
  percent: number
  count: number
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function GastosPorCategoriaPage() {
  const { selectedMonth } = useMonth()

  // useMovements hace el JOIN completo: category:categories(*), payment_method, etc.
  // useDashboardStats.currentMovements usa select('*') sin JOIN, por eso m.category sería null.
  const { data: movements, isLoading } = useMovements({ month: selectedMonth, type: 'gasto' })

  const [selectedCategory, setSelectedCategory] = useState<{
    id: string
    name: string
    color?: string | null
    icon?: string | null
    total: number
  } | null>(null)

  // Build category summaries from expense movements of the selected month
  const categories = useMemo<CategorySummary[]>(() => {
    if (!movements) return []

    const grandTotal = movements.reduce((sum, m) => sum + m.amount, 0)

    const catMap = new Map<
      string,
      { category: Category; total: number; count: number }
    >()

    movements.forEach(m => {
      if (!m.category) return
      const existing = catMap.get(m.category.id)
      if (existing) {
        existing.total += m.amount
        existing.count += 1
      } else {
        catMap.set(m.category.id, {
          category: m.category,
          total: m.amount,
          count: 1,
        })
      }
    })

    return Array.from(catMap.values())
      .map(({ category, total, count }) => ({
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        total,
        percent: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
        count,
      }))
      .sort((a, b) => b.total - a.total)
  }, [movements])

  const grandTotal = useMemo(
    () => categories.reduce((sum, c) => sum + c.total, 0),
    [categories]
  )

  const maxTotal = categories[0]?.total ?? 1

  return (
    <div className="flex flex-col gap-6 fade-in max-w-6xl mx-auto pb-12">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--negative-light)' }}
          >
            <LayoutGrid size={20} style={{ color: 'var(--negative)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Gastos por Categoría
            </h1>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {formatMonth(selectedMonth)} · {categories.length} categor{categories.length !== 1 ? 'ías' : 'ía'}
            </p>
          </div>
        </div>

        {/* Grand total pill */}
        {!isLoading && grandTotal > 0 && (
          <div
            className="card px-4 py-2 flex items-center gap-2 self-start sm:self-auto"
            style={{ borderColor: 'var(--negative)', borderLeftWidth: '3px' }}
          >
            <TrendingDown size={16} style={{ color: 'var(--negative)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
              Total del mes:
            </span>
            <span className="text-base font-bold" style={{ color: 'var(--negative)' }}>
              {formatCurrency(grandTotal)}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <ChartSkeleton height={100} />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState month={selectedMonth} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              maxTotal={maxTotal}
              rank={index + 1}
              onClick={() =>
                setSelectedCategory({
                  id: cat.id,
                  name: cat.name,
                  color: cat.color,
                  icon: cat.icon,
                  total: cat.total,
                })
              }
            />
          ))}
        </div>
      )}

      {/* ── Detail panel ────────────────────────────────────────── */}
      {selectedCategory && (
        <CategoryExpensesPanel
          category={{
            id: selectedCategory.id,
            name: selectedCategory.name,
            color: selectedCategory.color,
            icon: selectedCategory.icon,
          }}
          month={selectedMonth}
          totalAmount={selectedCategory.total}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  )
}

// ─── Category Card ──────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: CategorySummary
  maxTotal: number
  rank: number
  onClick: () => void
}

function CategoryCard({ category, maxTotal, rank, onClick }: CategoryCardProps) {
  const catColor = category.color ?? 'var(--negative)'
  const catBg = category.color
    ? `color-mix(in srgb, ${category.color} 14%, transparent)`
    : 'var(--negative-light)'
  const barWidth = maxTotal > 0 ? (category.total / maxTotal) * 100 : 0

  return (
    <button
      type="button"
      onClick={onClick}
      id={`category-card-${category.id}`}
      aria-label={`Ver movimientos de ${category.name}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        padding: '0',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.borderColor = catColor
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Color accent bar at top */}
      <div
        style={{
          height: '3px',
          background: catColor,
          width: '100%',
          opacity: 0.7,
        }}
      />

      {/* Card body */}
      <div style={{ padding: '1rem 1.125rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Top row: icon + name + rank + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-lg)',
              background: catBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {category.icon
              ? <span style={{ fontSize: '1.125rem' }}>{category.icon}</span>
              : <TrendingDown size={18} style={{ color: catColor }} />
            }
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'var(--foreground)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                margin: 0,
              }}
            >
              {category.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', margin: 0 }}>
              {category.count} movimiento{category.count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rank badge */}
          {rank <= 3 && (
            <span
              style={{
                width: '22px',
                height: '22px',
                borderRadius: 'var(--radius-full)',
                background: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : '#b45309',
                color: 'white',
                fontSize: '0.6875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {rank}
            </span>
          )}

          <ChevronRight size={16} style={{ color: 'var(--foreground-subtle)', flexShrink: 0 }} />
        </div>

        {/* Amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: catColor,
              letterSpacing: '-0.02em',
            }}
          >
            {formatCurrency(category.total)}
          </span>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--foreground-muted)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: catBg,
            }}
          >
            {category.percent}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: '6px',
            background: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${barWidth}%`,
              background: catColor,
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    </button>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ month }: { month: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '4rem 2rem',
        border: '1px dashed var(--border)',
        borderRadius: 'var(--radius-xl)',
        color: 'var(--foreground-muted)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LayoutGrid size={28} style={{ opacity: 0.4 }} />
      </div>
      <div>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
          Sin gastos categorizados
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', maxWidth: '320px' }}>
          No se encontraron gastos con categoría asignada en {formatMonth(month)}.
          Asegúrate de categorizar tus gastos al registrarlos.
        </p>
      </div>
    </div>
  )
}
