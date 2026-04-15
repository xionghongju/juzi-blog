import { supabase } from '@/lib/supabase'

export const getTags = async () => {
  return supabase.from('tags').select('*').order('name')
}

export const createTag = async (name: string, slug: string) => {
  return supabase.from('tags').insert({ name, slug }).select().single()
}

export const deleteTag = async (id: number) => {
  return supabase.from('tags').delete().eq('id', id)
}
