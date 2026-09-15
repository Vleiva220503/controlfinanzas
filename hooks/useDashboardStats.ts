// hooks/useDashboardStats.ts
// Fetches and computes all stats needed for the Dashboard

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { calculateDashboardStats, totalAccountsBalance } from '@/lib/finance/calculations'
import { shiftMonth } from '@/lib/finance/formatters'
import type { Movement, Account } from '@/types/database'

export function useDashboardStats(month: string) {
  const supabase = createClient()
  const prevMonth = shiftMonth(month, -1)

  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: async () => {
      // Parallel fetches
      const [currentRes, prevRes, accountsRes, recentRes] = await Promise.all([
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
      ])

      if (currentRes.error) throw currentRes.error
      if (prevRes.error) throw prevRes.error
      if (accountsRes.error) throw accountsRes.error
      if (recentRes.error) throw recentRes.error

      const accounts = accountsRes.data as Account[]
      const currentMovements = currentRes.data as Movement[]
      const previousMovements = prevRes.data as Movement[]
      const recentMovements = recentRes.data as Movement[]

      const balance = totalAccountsBalance(accounts)
      const stats = calculateDashboardStats(currentMovements, previousMovements, balance)

      return {
        stats,
        accounts,
        recentMovements,
        currentMovements,
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
