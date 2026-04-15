import { supabase } from '@/lib/supabase'
import { Moment } from '@/types'
import { PAGE_SIZE } from '@/lib/constants'

export const getMoments = async (page = 1) => {
  return supabase
    .from('moments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
}

export const createMoment = async (moment: Partial<Moment>) => {
  return supabase.from('moments').insert(moment).select().single()
}

export const updateMoment = async (id: number, moment: Partial<Moment>) => {
  return supabase.from('moments').update(moment).eq('id', id).select().single()
}

export const deleteMoment = async (id: number) => {
  return supabase.from('moments').delete().eq('id', id)
}

export const likeMoment = async (id: number) => {
  return supabase.rpc('increment_moment_likes', { moment_id: id })
}
