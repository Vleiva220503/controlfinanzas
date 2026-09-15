import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { RecurringTransaction } from '@/types/database'

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ['recurring'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select(`
          *,
          category:categories(name),
          account:accounts(name)
        `)
        .order('start_date', { ascending: false })

      if (error) throw error
      return data as RecurringTransaction[]
    },
  })
}

export function useCreateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: Omit<RecurringTransaction, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'category' | 'account'>) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('recurring_transactions')
        .insert({ ...values, created_by: user?.id })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      toast.success('Movimiento recurrente creado')
    },
    onError: () => toast.error('Error al crear recurrente'),
  })
}

export function useDeleteRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('recurring_transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      toast.success('Movimiento recurrente eliminado')
    },
  })
}
