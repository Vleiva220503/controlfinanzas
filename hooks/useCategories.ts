// hooks/useCategories.ts
// React Query hooks for categories CRUD

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Category } from '@/types/database'
import type { CategoryFormValues } from '@/lib/finance/validators'

const QUERY_KEY = ['categories']

export function useCategories(type?: 'ingreso' | 'gasto') {
  const supabase = createClient()

  return useQuery({
    queryKey: type ? [...QUERY_KEY, type] : QUERY_KEY,
    queryFn: async () => {
      let q = supabase.from('categories').select('*').order('name')
      if (type) q = q.eq('type', type)
      const { data, error } = await q
      if (error) throw error
      return data as Category[]
    },
  })
}

export function useCreateCategory() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('categories')
        .insert({ ...values, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoría creada')
    },
    onError: () => toast.error('Error al crear la categoría'),
  })
}

export function useUpdateCategory() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<CategoryFormValues> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(values)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Category
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoría actualizada')
    },
    onError: () => toast.error('Error al actualizar la categoría'),
  })
}

export function useDeleteCategory() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Categoría eliminada')
    },
    onError: () => toast.error('Error al eliminar la categoría'),
  })
}
