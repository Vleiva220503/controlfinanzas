// lib/finance/calculations.ts
// Funciones puras de cálculo financiero — sin side effects, 100% testeables

import type { Movement, SavingsContribution, DashboardStats } from '@/types/database'

/**
 * Total de ingresos en una lista de movimientos
 */
export function totalIncome(movements: Movement[]): number {
  return movements
    .filter(m => m.type === 'ingreso')
    .reduce((sum, m) => sum + Number(m.amount), 0)
}

/**
 * Total de gastos en una lista de movimientos
 */
export function totalExpenses(movements: Movement[]): number {
  return movements
    .filter(m => m.type === 'gasto')
    .reduce((sum, m) => sum + Number(m.amount), 0)
}

/**
 * Ahorro del mes = ingresos - gastos
 */
export function monthlySavings(income: number, expenses: number): number {
  return income - expenses
}

/**
 * Porcentaje de ahorro = ahorro / ingresos × 100
 * Maneja división por cero
 */
export function savingsPercent(income: number, expenses: number): number {
  if (income <= 0) return 0
  return ((income - expenses) / income) * 100
}

/**
 * Dinero disponible = suma de todas las cuentas
 */
export function totalAccountsBalance(accounts: { current_balance: number }[]): number {
  return accounts.reduce((sum, a) => sum + Number(a.current_balance), 0)
}

/**
 * Variación porcentual entre dos valores
 * Retorna null si el valor anterior es 0 (no hay base de comparación)
 */
export function percentVariation(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

/**
 * Progreso de presupuesto = gastado / presupuestado × 100
 */
export function budgetProgress(spent: number, budgeted: number): number {
  if (budgeted <= 0) return 0
  return Math.min((spent / budgeted) * 100, 100)
}

/**
 * Estado del presupuesto
 */
export function budgetStatus(spent: number, budgeted: number): 'ok' | 'warning' | 'exceeded' {
  const pct = (spent / budgeted) * 100
  if (pct >= 100) return 'exceeded'
  if (pct >= 80) return 'warning'
  return 'ok'
}

/**
 * Total aportado a una meta de ahorro
 */
export function totalContributed(contributions: SavingsContribution[]): number {
  return contributions.reduce((sum, c) => sum + Number(c.amount), 0)
}

/**
 * Progreso de meta de ahorro = aportado / objetivo × 100
 */
export function savingsGoalProgress(contributed: number, target: number): number {
  if (target <= 0) return 0
  return Math.min((contributed / target) * 100, 100)
}

/**
 * Monto restante para alcanzar la meta
 */
export function savingsGoalRemaining(contributed: number, target: number): number {
  return Math.max(target - contributed, 0)
}

/**
 * Aporte mensual sugerido para alcanzar la meta antes de la fecha objetivo
 * Retorna null si no hay fecha objetivo o ya está alcanzada
 */
export function suggestedMonthlyContribution(
  contributed: number,
  target: number,
  targetDate: string | null | undefined
): number | null {
  if (!targetDate) return null
  const remaining = target - contributed
  if (remaining <= 0) return 0

  const now = new Date()
  const end = new Date(targetDate)
  const monthsDiff =
    (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())

  if (monthsDiff <= 0) return null
  return remaining / monthsDiff
}

/**
 * Calcula el saldo acumulado arrastrado de todos los meses ANTERIORES al mes objetivo.
 * Garantiza que el dinero se acumula mes a mes en lugar de reiniciarse a cero.
 *
 * @param allMovements - Lista completa de todos los movimientos históricos
 * @param targetMonth  - Mes objetivo en formato 'YYYY-MM'
 * @returns Saldo neto de todos los meses previos al targetMonth
 */
export function calculateCarryOverBalance(
  allMovements: Pick<Movement, 'month' | 'type' | 'amount'>[],
  targetMonth: string
): number {
  return allMovements
    .filter(m => m.month < targetMonth)
    .reduce((sum, m) => {
      return sum + (m.type === 'ingreso' ? Number(m.amount) : -Number(m.amount))
    }, 0)
}

/**
 * Calcula el saldo disponible acumulado hasta el mes objetivo (inclusive).
 * = saldo arrastrado de meses anteriores + ingresos del mes - gastos del mes
 *
 * @param allMovements  - Lista completa de todos los movimientos históricos
 * @param targetMonth   - Mes objetivo en formato 'YYYY-MM'
 * @returns Saldo disponible acumulado a fin del mes objetivo
 */
export function calculateCumulativeBalance(
  allMovements: Pick<Movement, 'month' | 'type' | 'amount'>[],
  targetMonth: string
): number {
  return allMovements
    .filter(m => m.month <= targetMonth)
    .reduce((sum, m) => {
      return sum + (m.type === 'ingreso' ? Number(m.amount) : -Number(m.amount))
    }, 0)
}

/**
 * Calcula las estadísticas completas del dashboard para un mes dado,
 * incluyendo saldo acumulado arrastrado de meses anteriores.
 *
 * @param currentMonthMovements  - Movimientos del mes seleccionado
 * @param previousMonthMovements - Movimientos del mes anterior (para variaciones)
 * @param accountsBalance        - Suma de saldos actuales de todas las cuentas
 * @param carryOver              - Saldo arrastrado de meses anteriores (calculateCarryOverBalance)
 */
export function calculateDashboardStats(
  currentMonthMovements: Movement[],
  previousMonthMovements: Movement[],
  accountsBalance: number,
  carryOver: number = 0
): DashboardStats {
  const totalInc = totalIncome(currentMonthMovements)
  const totalExp = totalExpenses(currentMonthMovements)
  const prevInc = totalIncome(previousMonthMovements)
  const prevExp = totalExpenses(previousMonthMovements)

  return {
    totalIncome: totalInc,
    totalExpenses: totalExp,
    savings: monthlySavings(totalInc, totalExp),
    savingsPercent: savingsPercent(totalInc, totalExp),
    availableBalance: carryOver + totalInc - totalExp,
    totalAccountsBalance: accountsBalance,
    previousMonthIncome: prevInc,
    previousMonthExpenses: prevExp,
    incomeVariation: percentVariation(totalInc, prevInc) ?? 0,
    expensesVariation: percentVariation(totalExp, prevExp) ?? 0,
  }
}

/**
 * Gasto total por categoría (para gráficos)
 */
export function expensesByCategory(movements: Movement[]): Record<string, number> {
  return movements
    .filter(m => m.type === 'gasto')
    .reduce<Record<string, number>>((acc, m) => {
      const key = m.category?.name ?? 'Sin categoría'
      acc[key] = (acc[key] ?? 0) + Number(m.amount)
      return acc
    }, {})
}

/**
 * Datos históricos por mes para gráficos de línea/barra
 * Agrupa una lista de movimientos por mes
 */
export function groupByMonth(movements: Pick<Movement, 'month' | 'type' | 'amount'>[]): {
  month: string
  income: number
  expenses: number
  savings: number
}[] {
  const map = new Map<string, { income: number; expenses: number }>()

  for (const m of movements) {
    if (!map.has(m.month)) map.set(m.month, { income: 0, expenses: 0 })
    const entry = map.get(m.month)!
    if (m.type === 'ingreso') entry.income += Number(m.amount)
    else entry.expenses += Number(m.amount)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { income, expenses }]) => ({
      month,
      income,
      expenses,
      savings: income - expenses,
    }))
}

/**
 * Agrupa movimientos por fecha (YYYY-MM-DD).
 * Útil para el calendario y el desglose diario del historial.
 *
 * @returns Mapa de fecha → { income, expenses, movements }
 */
export function groupByDay(movements: Movement[]): Map<string, {
  income: number
  expenses: number
  movements: Movement[]
}> {
  const map = new Map<string, { income: number; expenses: number; movements: Movement[] }>()

  for (const m of movements) {
    const date = m.date.substring(0, 10) // 'YYYY-MM-DD'
    if (!map.has(date)) map.set(date, { income: 0, expenses: 0, movements: [] })
    const entry = map.get(date)!
    if (m.type === 'ingreso') entry.income += Number(m.amount)
    else entry.expenses += Number(m.amount)
    entry.movements.push(m)
  }

  return map
}

/**
 * Promedio diario de gastos en un período
 */
export function averageDailyExpense(movements: Movement[], days: number): number {
  if (days <= 0) return 0
  return totalExpenses(movements) / days
}

/**
 * Clamp un valor entre min y max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
