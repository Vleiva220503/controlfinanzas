'use client'
// components/dashboard/KPICard.tsx
// Tarjeta de métrica clave (KPI) para el dashboard con indicador de variación

import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { formatCurrencyCompact, formatVariation } from '@/lib/finance/formatters'
import { cn } from '@/lib/utils'
import { KPICardSkeleton } from '@/components/shared/Skeleton'

interface KPICardProps {
  title: string
  amount: number
  variation: number | null
  type?: 'neutral' | 'positive' | 'negative' | 'warning'
  loading?: boolean
  icon?: React.ReactNode
}

export function KPICard({ title, amount, variation, type = 'neutral', loading, icon }: KPICardProps) {
  if (loading) return <KPICardSkeleton />

  // Determinar color base según el tipo
  let colorVar = 'var(--foreground)'
  if (type === 'positive') colorVar = 'var(--positive)'
  if (type === 'negative') colorVar = 'var(--negative)'
  if (type === 'warning') colorVar = 'var(--warning)'

  // Determinar color y flecha de la variación
  const isPositiveVar = variation !== null && variation > 0
  const isNegativeVar = variation !== null && variation < 0
  const varColor = isPositiveVar ? 'var(--positive)' : isNegativeVar ? 'var(--negative)' : 'var(--foreground-muted)'
  
  // Para gastos, una variación positiva (subió el gasto) es malo (rojo), 
  // pero mantendremos la lógica visual estandar: arriba verde, abajo rojo? 
  // En finanzas: ingreso sube = verde, gasto sube = rojo. 
  // Para simplificar en este componente genérico, si type="negative" (es un gasto) invertimos el color de la variación.
  let finalVarColor = varColor
  if (type === 'negative' && variation !== null) {
    finalVarColor = isPositiveVar ? 'var(--negative)' : isNegativeVar ? 'var(--positive)' : 'var(--foreground-muted)'
  }

  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-2 relative overflow-hidden group">
      {/* Icon background decorator */}
      {icon && (
        <div 
          className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110"
          style={{ color: colorVar }}
          aria-hidden
        >
          {icon}
        </div>
      )}

      <h3 className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
        {title}
      </h3>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: colorVar }}>
          {formatCurrencyCompact(amount)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 mt-1">
        {variation === null ? (
          <span className="flex items-center text-xs font-medium" style={{ color: 'var(--foreground-subtle)' }}>
            <Minus size={12} className="mr-0.5" /> Sin datos previos
          </span>
        ) : (
          <>
            <span 
              className={cn(
                "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md"
              )}
              style={{ 
                color: finalVarColor,
                background: `color-mix(in srgb, ${finalVarColor} 15%, transparent)`
              }}
            >
              {isPositiveVar ? <ArrowUpRight size={12} className="mr-0.5" /> : 
               isNegativeVar ? <ArrowDownRight size={12} className="mr-0.5" /> : 
               <Minus size={12} className="mr-0.5" />}
              {formatVariation(variation)}
            </span>
            <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
              vs mes anterior
            </span>
          </>
        )}
      </div>
    </div>
  )
}
