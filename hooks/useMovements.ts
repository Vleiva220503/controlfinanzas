// hooks/useMovements.ts
// React Query hooks for movements CRUD + filters

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Movement, MovementFilters } from '@/types/database'
import type { MovementFormValues } from '@/lib/finance/validators'

export function movementsQueryKey(filters?: MovementFilters) {
  return ['movements', filters ?? {}]
}

export function useMovements(filters: MovementFilters = {}) {
  const supabase = createClient()

  return useQuery({
    queryKey: movementsQueryKey(filters),
    queryFn: async () => {
      let q = supabase
        .from('movements')
        .select(`
          *,
          category:categories(*),
          payment_method:payment_methods(*),
          account:accounts(id, name),
          tags:movement_tags(tag:tags(*))
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters.month) q = q.eq('month', filters.month)
      if (filters.startDate) q = q.gte('date', filters.startDate)
      if (filters.endDate) q = q.lte('date', filters.endDate)
      if (filters.type && filters.type !== 'all') q = q.eq('type', filters.type)
      if (filters.categoryId) q = q.eq('category_id', filters.categoryId)
      if (filters.accountId) q = q.eq('account_id', filters.accountId)
      if (filters.paymentMethodId) q = q.eq('payment_method_id', filters.paymentMethodId)
      if (filters.search) {
        q = q.or(`description.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
      }

      const { data, error } = await q
      if (error) throw error

      // Flatten tags
      return (data as Movement[]).map(m => ({
        ...m,
        tags: (m.tags as unknown as { tag: { id: string; name: string; color?: string } }[])
          ?.map(t => t.tag) ?? [],
      }))
    },
  })
}

export function useCreateMovement() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: MovementFormValues & { tag_ids?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser()

      const { tag_ids, ...rest } = values

      const { data, error } = await supabase
        .from('movements')
        .insert({
          ...rest,
          account_id: rest.account_id || null,
          category_id: rest.category_id || null,
          payment_method_id: rest.payment_method_id || null,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) throw error

      // Insert tags
      if (tag_ids?.length && data) {
        await supabase.from('movement_tags').insert(
          tag_ids.map(tid => ({ movement_id: data.id, tag_id: tid }))
        )
      }

      return data as Movement
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Movimiento registrado')
    },
    onError: (err) => {
      console.error(err)
      toast.error('Error al registrar el movimiento')
    },
  })
}

export function useUpdateMovement() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: Partial<MovementFormValues> & { tag_ids?: string[] }
    }) => {
      const { tag_ids, ...rest } = values

      const { data, error } = await supabase
        .from('movements')
        .update({
          ...rest,
          account_id: rest.account_id || null,
          category_id: rest.category_id || null,
          payment_method_id: rest.payment_method_id || null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Replace tags
      if (tag_ids !== undefined) {
        await supabase.from('movement_tags').delete().eq('movement_id', id)
        if (tag_ids.length > 0) {
          await supabase.from('movement_tags').insert(
            tag_ids.map(tid => ({ movement_id: id, tag_id: tid }))
          )
        }
      }

      return data as Movement
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Movimiento actualizado')
    },
    onError: () => toast.error('Error al actualizar el movimiento'),
  })
}

export function useDeleteMovement() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('movements').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Movimiento eliminado')
    },
    onError: () => toast.error('Error al eliminar el movimiento'),
  })
}

export function useDeleteMovements() {
  const supabase = createClient()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('movements').delete().in('id', ids)
      if (error) throw error
    },
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: ['movements'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`${ids.length} movimiento(s) eliminado(s)`)
    },
    onError: () => toast.error('Error al eliminar movimientos'),
  })
}
