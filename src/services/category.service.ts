import { supabase } from '@/lib/supabase'

export const getCategories = async () => {
  return supabase.from('categories').select('*').order('name')
}

export const createCategory = async (name: string, slug: string) => {
  return supabase.from('categories').insert({ name, slug }).select().single()
}

export const deleteCategory = async (id: number) => {
  return supabase.from('categories').delete().eq('id', id)
}
