import { getSupabase } from '@/lib/supabase/hooks'

const sb = () => getSupabase()

export interface Workspace { id: string; name: string; slug: string; color: string; logo_url?: string | null; owner_id: string; created_at: string }
export interface Board { id: string; workspace_id: string; name: string; color: string; position: number; created_at: string }
export interface List { id: string; board_id: string; name: string; position: number; color: string | null; created_at: string }
export interface Card { id: string; list_id: string; title: string; description: string | null; position: number; due_date: string | null; cover_url: string | null; archived: boolean; label_ids: string[]; checklist: { id: string; text: string; checked: boolean }[]; attachments: { id: string; name: string; url: string; type: string; size: number; created_at: string }[]; created_by: string | null; created_at: string; updated_at: string }
export interface Label { id: string; board_id: string; name: string; color: string }

async function userId() { return (await sb().auth.getUser()).data.user?.id }

// ============ WORKSPACES ============

export async function getWorkspaces(): Promise<Workspace[]> {
  const { data } = await sb().from('workspaces').select('*').order('created_at')
  return data || []
}

export async function createWorkspace(name: string) {
  const uid = await userId()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36)
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
  const { data } = await sb().from('workspaces').insert({ name, slug, color: colors[Math.floor(Math.random() * colors.length)], owner_id: uid }).select().single()
  return data
}

export async function renameWorkspace(id: string, name: string) {
  await sb().from('workspaces').update({ name }).eq('id', id)
}

export async function updateWorkspace(id: string, updates: { name?: string; color?: string; logo_url?: string | null }) {
  await sb().from('workspaces').update(updates).eq('id', id)
}

export async function deleteWorkspace(id: string) {
  await sb().from('workspaces').delete().eq('id', id)
}

// ============ BOARDS ============

export async function getBoards(workspaceId: string): Promise<Board[]> {
  const { data } = await sb().from('boards').select('*').eq('workspace_id', workspaceId).order('position')
  return data || []
}

export async function getBoard(id: string): Promise<Board | null> {
  const { data } = await sb().from('boards').select('*').eq('id', id).single()
  return data
}

export async function createBoard(workspaceId: string, name: string) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
  const boards = await getBoards(workspaceId)
  const { data } = await sb().from('boards').insert({ workspace_id: workspaceId, name, color: colors[Math.floor(Math.random() * colors.length)], position: boards.length }).select().single()
  return data
}

export async function renameBoard(id: string, name: string) {
  await sb().from('boards').update({ name }).eq('id', id)
}

export async function deleteBoard(id: string) {
  await sb().from('boards').delete().eq('id', id)
}

// ============ LISTS ============

export async function getLists(boardId: string): Promise<List[]> {
  const { data } = await sb().from('lists').select('*').eq('board_id', boardId).order('position')
  return data || []
}

export async function createList(boardId: string, name: string) {
  const lists = await getLists(boardId)
  const { data } = await sb().from('lists').insert({ board_id: boardId, name, position: lists.length }).select().single()
  return data
}

// ============ CARDS ============

export async function getCards(listId: string): Promise<Card[]> {
  const { data } = await sb().from('cards').select('*').eq('list_id', listId).eq('archived', false).order('position')
  return (data || []).map(c => ({ ...c, label_ids: c.label_ids || [], checklist: c.checklist || [], attachments: c.attachments || [] }))
}

export async function createCard(listId: string, title: string) {
  const uid = await userId()
  const cards = await getCards(listId)
  const { data } = await sb().from('cards').insert({ list_id: listId, title, position: cards.length, created_by: uid }).select().single()
  return data ? { ...data, label_ids: data.label_ids || [], checklist: data.checklist || [], attachments: data.attachments || [] } : null
}

export async function updateCard(id: string, updates: Partial<Card>) {
  const allowed: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const fields = ['title', 'description', 'due_date', 'cover_url', 'list_id', 'position', 'archived', 'label_ids', 'checklist', 'attachments'] as const
  for (const f of fields) {
    if (f in updates) allowed[f] = (updates as Record<string, unknown>)[f]
  }
  const { data, error } = await sb().from('cards').update(allowed).eq('id', id).select().single()
  if (error) console.error('updateCard error:', error.message)
  return data ? { ...data, label_ids: data.label_ids || [], checklist: data.checklist || [], attachments: data.attachments || [] } : null
}

export async function deleteCard(id: string) {
  await sb().from('cards').delete().eq('id', id)
}

export async function reorderCards(listId: string, orderedIds: string[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    await sb().from('cards').update({ list_id: listId, position: i }).eq('id', orderedIds[i])
  }
}

// ============ LABELS ============

export async function getLabels(boardId: string): Promise<Label[]> {
  const { data } = await sb().from('labels').select('*').eq('board_id', boardId)
  return data || []
}

export async function createLabel(boardId: string, name: string, color: string) {
  const { data } = await sb().from('labels').insert({ board_id: boardId, name, color }).select().single()
  return data
}

// ============ SEARCH ============

export interface SearchResult { card: Card; boardId: string; boardName: string; listName: string; workspaceName: string }

export async function searchCards(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const workspaces = await getWorkspaces()
  const results: SearchResult[] = []

  for (const ws of workspaces) {
    const boards = await getBoards(ws.id)
    for (const board of boards) {
      const lists = await getLists(board.id)
      for (const list of lists) {
        const cards = await getCards(list.id)
        for (const card of cards) {
          if (card.title.toLowerCase().includes(q) || card.description?.toLowerCase().includes(q)) {
            results.push({ card, boardId: board.id, boardName: board.name, listName: list.name, workspaceName: ws.name })
          }
        }
      }
    }
  }
  return results
}
