// hooks/useSavings.ts
// React Query hooks for savings goals and contributions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
// import { totalContributed } from '@/lib/finance/calculations'
import type { SavingsGoal, SavingsContribution } from '@/types/database'
import type { SavingsGoalFormValues, SavingsContributionFormValues } from '@/lib/finance/validators'

export function useSavingsGoals() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['savings-goals'],
    queryFn: async () => {
      const { data: goals, error: gErr } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at')

      if (gErr) throw gErr

      const { data: contributions, error: cErr } = await supabase
        .from('savings_contributions')
        .select('goal_id, amount')

      if (cErr) throw cErr

      // Aggregate contributions per goal
      const contribMap: Record<string, number> = {}
      for (const c of contributions) {
        contribMap[c.goal_id] = (contribMap[c.goal_id] ?? 0) + Number(c.amount)
      }

      return (goals as SavingsGoal[]).map(g => ({
        ...g,
        total_contributed: contribMap[g.id] ?? 0,
        remaining: Math.max(g.target_amount - (contribMap[g.id] ?? 0), 0),
      }))
    },
  })
}

export function useSavingsContributions(goalId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['savings-contributions', goalId],
    queryFn: async () => {
      let q = supabase
        .from('savings_contributions')
        .select('*, goal:savings_goals(id, name)')
        .order('date', { ascending: false })

      if (goalId) q = q.eq('goal_id', goalId)

      const { data, error } = await q
      if (error) throw error
      return data as SavingsContribution[]
    },
    enabled: goalId !== undefined || !goalId,
  })
}

export function useCreateSavingsGoal() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: SavingsGoalFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({ ...values, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data as SavingsGoal
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] })
      toast.success('Meta de ahorro creada')
    },
    onError: () => toast.error('Error al crear la meta de ahorro'),
  })
}

export function useUpdateSavingsGoal() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<SavingsGoalFormValues> }) => {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(values)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as SavingsGoal
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] })
      toast.success('Meta actualizada')
    },
    onError: () => toast.error('Error al actualizar la meta'),
  })
}

export function useDeleteSavingsGoal() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] })
      toast.success('Meta eliminada')
    },
    onError: () => toast.error('Error al eliminar la meta'),
  })
}

export function useCreateContribution() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: SavingsContributionFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('savings_contributions')
        .insert({ ...values, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data as SavingsContribution
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] })
      qc.invalidateQueries({ queryKey: ['savings-contributions'] })
      toast.success('Aporte registrado')
    },
    onError: () => toast.error('Error al registrar el aporte'),
  })
}

export function useDeleteContribution() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('savings_contributions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] })
      qc.invalidateQueries({ queryKey: ['savings-contributions'] })
      toast.success('Aporte eliminado')
    },
    onError: () => toast.error('Error al eliminar el aporte'),
  })
}
