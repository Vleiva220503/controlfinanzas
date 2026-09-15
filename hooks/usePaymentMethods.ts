// hooks/usePaymentMethods.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { PaymentMethod } from '@/types/database'

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment_methods'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data as PaymentMethod[]
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({ name, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data as PaymentMethod
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_methods'] })
      toast.success('Método de pago creado')
    },
    onError: () => toast.error('Error al crear método de pago'),
  })
}

export function useUpdatePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('payment_methods')
        .update({ name })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as PaymentMethod
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_methods'] })
      toast.success('Método de pago actualizado')
    },
    onError: () => toast.error('Error al actualizar'),
  })
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('payment_methods').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment_methods'] })
      toast.success('Método de pago eliminado')
    },
    onError: () => toast.error('Error al eliminar'),
  })
}
