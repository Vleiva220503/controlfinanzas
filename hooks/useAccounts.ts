// hooks/useAccounts.ts
// React Query hooks for accounts CRUD

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Account } from '@/types/database'
import type { AccountFormValues } from '@/lib/finance/validators'

const QUERY_KEY = ['accounts']

export function useAccounts() {
  const supabase = createClient()

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Account[]
    },
  })
}

export function useCreateAccount() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: AccountFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...values,
          current_balance: values.initial_balance,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return data as Account
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Cuenta creada')
    },
    onError: () => toast.error('Error al crear la cuenta'),
  })
}

export function useUpdateAccount() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<AccountFormValues> }) => {
      const { data, error } = await supabase
        .from('accounts')
        .update(values)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Account
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Cuenta actualizada')
    },
    onError: () => toast.error('Error al actualizar la cuenta'),
  })
}

export function useDeleteAccount() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Cuenta eliminada')
    },
    onError: () => toast.error('Error al eliminar la cuenta'),
  })
}
