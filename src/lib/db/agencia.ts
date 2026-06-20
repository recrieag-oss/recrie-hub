import { getSupabase } from '@/lib/supabase/hooks'

const sb = () => getSupabase()

export interface Category { id: string; name: string; color: string; icon: string }
export interface Reference { id: string; category_id: string | null; title: string; description: string | null; image_url: string; thumbnail_url: string; tags: string[] | null; is_favorite: boolean; created_at: string }
export interface Prompt { id: string; category_id: string | null; title: string; content: string; tags: string[] | null; is_favorite: boolean; created_at: string }

async function userId() { return (await sb().auth.getUser()).data.user?.id }

export async function getCategories(): Promise<Category[]> {
  const { data } = await sb().from('ag_categories').select('*').order('name')
  return data || []
}

export async function createCategory(name: string, color: string) {
  const uid = await userId()
  const { data } = await sb().from('ag_categories').insert({ user_id: uid, name, color }).select().single()
  return data
}

export async function deleteCategory(id: string) {
  await sb().from('ag_categories').delete().eq('id', id)
}

export async function getAllReferences(): Promise<Reference[]> {
  const { data } = await sb().from('ag_references').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function createReference(ref: { title: string; description: string | null; image_url: string; thumbnail_url: string; category_id: string | null; tags: string[] | null }) {
  const uid = await userId()
  const { data } = await sb().from('ag_references').insert({ ...ref, user_id: uid }).select().single()
  return data
}

export async function updateReference(id: string, updates: Partial<Reference>) {
  await sb().from('ag_references').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deleteReference(id: string) {
  await sb().from('ag_references').delete().eq('id', id)
}

export async function toggleFavoriteRef(id: string, current: boolean) {
  await sb().from('ag_references').update({ is_favorite: !current }).eq('id', id)
}

export async function getPrompts(): Promise<Prompt[]> {
  const { data } = await sb().from('ag_prompts').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function createPrompt(p: { title: string; content: string; category_id: string | null; tags: string[] | null }) {
  const uid = await userId()
  const { data } = await sb().from('ag_prompts').insert({ ...p, user_id: uid }).select().single()
  return data
}

export async function updatePrompt(id: string, updates: Partial<Prompt>) {
  await sb().from('ag_prompts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deletePrompt(id: string) {
  await sb().from('ag_prompts').delete().eq('id', id)
}

export async function toggleFavoritePrompt(id: string, current: boolean) {
  await sb().from('ag_prompts').update({ is_favorite: !current }).eq('id', id)
}
