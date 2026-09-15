// hooks/useBudgets.ts
// React Query hooks for budgets CRUD

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Budget } from '@/types/database'
import type { BudgetFormValues } from '@/lib/finance/validators'

export function useBudgets(month: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['budgets', month],
    queryFn: async () => {
      const { data: budgets, error: bErr } = await supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('month', month)
        .order('created_at')

      if (bErr) throw bErr

      // Get spent amounts per category this month
      const { data: spent, error: sErr } = await supabase
        .from('movements')
        .select('category_id, amount')
        .eq('month', month)
        .eq('type', 'gasto')

      if (sErr) throw sErr

      // Map spent per category
      const spentMap: Record<string, number> = {}
      for (const m of spent) {
        if (m.category_id) {
          spentMap[m.category_id] = (spentMap[m.category_id] ?? 0) + Number(m.amount)
        }
      }

      return (budgets as Budget[]).map(b => ({
        ...b,
        spent: spentMap[b.category_id] ?? 0,
      }))
    },
    staleTime: 1000 * 60,
  })
}

export function useCreateBudget() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: BudgetFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('budgets')
        .upsert({ ...values, created_by: user?.id }, { onConflict: 'category_id,month' })
        .select()
        .single()
      if (error) throw error
      return data as Budget
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['budgets', v.month] })
      toast.success('Presupuesto guardado')
    },
    onError: () => toast.error('Error al guardar el presupuesto'),
  })
}

export function useDeleteBudget() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, month }: { id: string; month: string }) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
      return month
    },
    onSuccess: (month) => {
      qc.invalidateQueries({ queryKey: ['budgets', month] })
      toast.success('Presupuesto eliminado')
    },
    onError: () => toast.error('Error al eliminar el presupuesto'),
  })
}

export function useCopyBudgets() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ fromMonth, toMonth }: { fromMonth: string; toMonth: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('budgets')
        .select('category_id, amount')
        .eq('month', fromMonth)

      if (error) throw error
      if (!data?.length) throw new Error('No hay presupuestos en el mes origen')

      const newBudgets = data.map(b => ({
        category_id: b.category_id,
        month: toMonth,
        amount: b.amount,
        created_by: user?.id,
      }))

      const { error: insertErr } = await supabase
        .from('budgets')
        .upsert(newBudgets, { onConflict: 'category_id,month' })

      if (insertErr) throw insertErr
    },
    onSuccess: (_, { toMonth }) => {
      qc.invalidateQueries({ queryKey: ['budgets', toMonth] })
      toast.success('Presupuestos copiados del mes anterior')
    },
    onError: (err: Error) => toast.error(err.message || 'Error al copiar presupuestos'),
  })
}
