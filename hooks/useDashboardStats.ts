// hooks/useDashboardStats.ts
// Fetches and computes all stats needed for the Dashboard
// El availableBalance usa saldo acumulado de todos los meses anteriores (carry-over)

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  calculateDashboardStats,
  calculateCarryOverBalance,
  totalAccountsBalance,
} from '@/lib/finance/calculations'
import { shiftMonth } from '@/lib/finance/formatters'
import type { Movement, Account } from '@/types/database'

export function useDashboardStats(month: string) {
  const supabase = createClient()
  const prevMonth = shiftMonth(month, -1)

  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: async () => {
      // Parallel fetches: mes actual, mes anterior, cuentas, movimientos recientes, y
      // todos los movimientos históricos (solo month/type/amount) para el carry-over
      const [currentRes, prevRes, accountsRes, recentRes, historicalRes] = await Promise.all([
        supabase
          .from('movements')
          .select('*')
          .eq('month', month),
        supabase
          .from('movements')
          .select('*')
          .eq('month', prevMonth),
        supabase
          .from('accounts')
          .select('*')
          .order('created_at'),
        supabase
          .from('movements')
          .select(`
            *,
            category:categories(id, name, color, icon),
            account:accounts(id, name)
          `)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(8),
        // Solo los campos necesarios para calcular el carry-over
        supabase
          .from('movements')
          .select('month, type, amount')
          .lt('month', month), // Solo meses ANTERIORES al seleccionado
      ])

      if (currentRes.error) throw currentRes.error
      if (prevRes.error) throw prevRes.error
      if (accountsRes.error) throw accountsRes.error
      if (recentRes.error) throw recentRes.error
      if (historicalRes.error) throw historicalRes.error

      const accounts = accountsRes.data as Account[]
      const currentMovements = currentRes.data as Movement[]
      const previousMovements = prevRes.data as Movement[]
      const recentMovements = recentRes.data as Movement[]
      const historicalMovements = historicalRes.data as Pick<Movement, 'month' | 'type' | 'amount'>[]

      const balance = totalAccountsBalance(accounts)
      // Saldo arrastrado = suma neta de todos los meses anteriores al seleccionado
      const carryOver = calculateCarryOverBalance(historicalMovements, month)
      const stats = calculateDashboardStats(currentMovements, previousMovements, balance, carryOver)

      return {
        stats,
        accounts,
        recentMovements,
        currentMovements,
        carryOver,
      }
    },
    staleTime: 1000 * 60,
  })
}

export function useHistoricalData(months: number = 12) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['movements-historical', months],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movements')
        .select('month, type, amount')
        .order('month', { ascending: true })

      if (error) throw error
      return data as Pick<Movement, 'month' | 'type' | 'amount'>[]
    },
    staleTime: 1000 * 60 * 5,
  })
}
