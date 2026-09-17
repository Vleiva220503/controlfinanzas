// lib/finance/formatters.ts
// Funciones de formato: moneda, fechas, porcentajes

import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

export interface CurrencyConfig {
  symbol: string
  code: string
}

const DEFAULT_CURRENCY: CurrencyConfig = { symbol: 'C$', code: 'NIO' }

/**
 * Formatea un número como moneda
 * Ejemplo: formatCurrency(1500.5, { symbol: 'C$' }) → "C$ 1,500.50"
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY
): string {
  const formatted = new Intl.NumberFormat('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${currency.symbol} ${formatted}`
}

/**
 * Formatea un número como moneda compacta (para KPIs en móvil)
 * Ejemplo: 1500000 → "C$ 1.5M", 25000 → "C$ 25K"
 */
export function formatCurrencyCompact(
  amount: number,
  currency: CurrencyConfig = DEFAULT_CURRENCY
): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `${currency.symbol} ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `${currency.symbol} ${(amount / 1_000).toFixed(1)}K`
  }
  return formatCurrency(amount, currency)
}

/**
 * Formatea un porcentaje con signo y un decimal
 */
export function formatPercent(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

/**
 * Formatea una variación porcentual (con colores implícitos por el signo)
 */
export function formatVariation(value: number | null): string {
  if (value === null) return '—'
  return formatPercent(value, true)
}

/**
 * Formatea una fecha ISO o date string al formato de la app
 * Por defecto: "15 sep 2025"
 */
export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    return format(date, fmt, { locale: es })
  } catch {
    return dateStr
  }
}

/**
 * Formatea un mes YYYY-MM como "Septiembre 2025"
 */
export function formatMonth(month: string): string {
  try {
    const [year, mon] = month.split('-')
    const date = new Date(Number(year), Number(mon) - 1, 1)
    return format(date, 'MMMM yyyy', { locale: es })
  } catch {
    return month
  }
}

/**
 * Formatea un mes YYYY-MM como "Sep 25" (abreviado para gráficos)
 */
export function formatMonthShort(month: string): string {
  try {
    const [year, mon] = month.split('-')
    const date = new Date(Number(year), Number(mon) - 1, 1)
    return format(date, 'MMM yy', { locale: es })
  } catch {
    return month
  }
}

/**
 * Retorna el mes actual en formato YYYY-MM
 */
export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

/**
 * Avanza o retrocede un mes desde un YYYY-MM dado
 */
export function shiftMonth(month: string, delta: number): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(year, mon - 1 + delta, 1)
  return format(date, 'yyyy-MM')
}

/**
 * Días transcurridos en el mes actual (para cálculo de promedio diario)
 */
export function daysElapsedInMonth(month: string): number {
  const [year, mon] = month.split('-').map(Number)
  const now = new Date()

  // Si es el mes actual, devolver el día actual
  if (
    now.getFullYear() === year &&
    now.getMonth() === mon - 1
  ) {
    return now.getDate()
  }

  // Si es un mes pasado, devolver todos los días del mes
  const lastDay = new Date(year, mon, 0)
  return lastDay.getDate()
}

/**
 * Clasifica el monto como "positivo" o "negativo" para estilos
 */
export function amountSign(amount: number): 'positive' | 'negative' | 'neutral' {
  if (amount > 0) return 'positive'
  if (amount < 0) return 'negative'
  return 'neutral'
}

/**
 * Mapea nombre de usuario a email interno de Supabase Auth
 */
export const USER_EMAIL_MAP: Record<string, string> = {
  jade: 'jade@localfinance.app',
  victor: 'victor@localfinance.app',
  sol: 'sol@localfinance.app',
}

export function usernameToEmail(username: string): string | null {
  return USER_EMAIL_MAP[username.toLowerCase()] ?? null
}
