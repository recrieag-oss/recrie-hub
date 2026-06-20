import { v4 as uuid } from 'uuid'
import type { Workspace, Board, List, Card, Label, Profile, ChecklistItem, Attachment } from './types'

const STORAGE_KEY = 'recrie-kanban-data'

interface StoreData {
  profile: Profile
  workspaces: Workspace[]
  boards: Board[]
  lists: List[]
  cards: Card[]
  labels: Label[]
}

const DEFAULT_LISTS = [
  'Ideias',
  'Em Produção',
  'Produzindo',
  'Programado',
  'Postado',
  'Finalizado',
]

function createSeedData(): StoreData {
  const userId = uuid()
  const workspaceId = uuid()
  const boardId = uuid()

  const labels: Label[] = [
    { id: uuid(), board_id: boardId, name: 'Carrossel', color: '#3b82f6' },
    { id: uuid(), board_id: boardId, name: 'Vídeo', color: '#ef4444' },
    { id: uuid(), board_id: boardId, name: 'Post', color: '#22c55e' },
    { id: uuid(), board_id: boardId, name: 'Urgente', color: '#f59e0b' },
    { id: uuid(), board_id: boardId, name: 'Reels', color: '#8b5cf6' },
  ]

  const lists: List[] = DEFAULT_LISTS.map((name, i) => ({
    id: uuid(),
    board_id: boardId,
    name,
    position: i,
    color: null,
    created_at: new Date().toISOString(),
  }))

  const sampleCards: Card[] = [
    { listIndex: 0, title: 'Roteiro carrossel PL 1234', desc: 'Elaborar roteiro para carrossel sobre o projeto de lei.', labelIdx: [0] },
    { listIndex: 0, title: 'Pauta sessão legislativa 12/06', desc: null, labelIdx: [2] },
    { listIndex: 0, title: 'Ideia: vídeo institucional gabinete', desc: 'Gravar tour pelo gabinete com narração IA.', labelIdx: [1] },
    { listIndex: 1, title: 'Arte post agenda semanal', desc: 'Post com agenda da semana no Instagram.', labelIdx: [2] },
    { listIndex: 1, title: 'Vídeo Kling - inauguração praça', desc: 'Animação com Kling da inauguração da praça central.', labelIdx: [1, 3] },
    { listIndex: 2, title: 'Carrossel conquistas 2024', desc: 'Arte em produção no Midjourney.', labelIdx: [0] },
    { listIndex: 4, title: 'Reels sessão 05/06', desc: 'Postado no Instagram e TikTok.', labelIdx: [4] },
    { listIndex: 4, title: 'Post ata sessão extraordinária', desc: null, labelIdx: [2] },
    { listIndex: 5, title: 'Carrossel mês do trabalhador', desc: 'Finalizado e aprovado pelo cliente.', labelIdx: [0] },
  ].map((item, i) => ({
    id: uuid(),
    list_id: lists[item.listIndex].id,
    title: item.title,
    description: item.desc,
    position: i,
    due_date: item.listIndex < 3
      ? new Date(Date.now() + (Math.random() * 14 - 3) * 86400000).toISOString()
      : null,
    cover_url: null,
    archived: false,
    created_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    label_ids: (item.labelIdx || []).map(idx => labels[idx].id),
    checklist: item.listIndex === 2 ? [
      { id: uuid(), text: 'Roteiro aprovado', checked: true },
      { id: uuid(), text: 'Arte gerada no Midjourney', checked: true },
      { id: uuid(), text: 'Revisão do cliente', checked: false },
      { id: uuid(), text: 'Postagem agendada', checked: false },
    ] : undefined,
    attachments: [],
  }) as Card)

  const posCounters: Record<string, number> = {}
  for (const card of sampleCards) {
    posCounters[card.list_id] = (posCounters[card.list_id] || 0)
    card.position = posCounters[card.list_id]++
  }

  return {
    profile: {
      id: userId,
      full_name: 'Usuário RECRIE',
      avatar_url: null,
      created_at: new Date().toISOString(),
    },
    workspaces: [{
      id: workspaceId,
      name: 'Mesaque Padilha',
      slug: 'mesaque-padilha',
      color: '#6366f1',
      owner_id: userId,
      created_at: new Date().toISOString(),
    }],
    boards: [{
      id: boardId,
      workspace_id: workspaceId,
      name: 'Conteúdo Político',
      color: '#6366f1',
      position: 0,
      created_at: new Date().toISOString(),
    }],
    lists,
    cards: sampleCards,
    labels,
  }
}

function load(): StoreData {
  if (typeof window === 'undefined') return createSeedData()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
  return JSON.parse(raw)
}

function save(data: StoreData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

type Listener = () => void
const listeners: Set<Listener> = new Set()
export function subscribe(fn: Listener) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
function notify() { listeners.forEach(fn => fn()) }

// ============================================
// PROFILE
// ============================================

export function getProfile(): Profile {
  return load().profile
}

// ============================================
// WORKSPACES
// ============================================

export function getWorkspaces(): Workspace[] {
  return load().workspaces
}

export function createWorkspace(name: string): Workspace {
  const data = load()
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36)
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
  const ws: Workspace = {
    id: uuid(),
    name,
    slug,
    color: colors[Math.floor(Math.random() * colors.length)],
    owner_id: data.profile.id,
    created_at: new Date().toISOString(),
  }
  data.workspaces.push(ws)
  save(data)
  notify()
  return ws
}

export function renameWorkspace(id: string, name: string) {
  const data = load()
  const ws = data.workspaces.find(w => w.id === id)
  if (ws) ws.name = name
  save(data)
  notify()
}

export function updateWorkspaceColor(id: string, color: string) {
  const data = load()
  const ws = data.workspaces.find(w => w.id === id)
  if (ws) ws.color = color
  save(data)
  notify()
}

export function duplicateWorkspace(id: string): Workspace | null {
  const data = load()
  const original = data.workspaces.find(w => w.id === id)
  if (!original) return null

  const newWsId = uuid()
  const newWs: Workspace = {
    ...original,
    id: newWsId,
    name: `${original.name} (cópia)`,
    slug: `${original.slug}-copy-${Date.now().toString(36)}`,
    created_at: new Date().toISOString(),
  }
  data.workspaces.push(newWs)

  const originalBoards = data.boards.filter(b => b.workspace_id === id)
  for (const board of originalBoards) {
    const newBoardId = uuid()
    data.boards.push({ ...board, id: newBoardId, workspace_id: newWsId, created_at: new Date().toISOString() })

    const originalLists = data.lists.filter(l => l.board_id === board.id)
    for (const list of originalLists) {
      const newListId = uuid()
      data.lists.push({ ...list, id: newListId, board_id: newBoardId, created_at: new Date().toISOString() })

      const originalCards = data.cards.filter(c => c.list_id === list.id)
      for (const card of originalCards) {
        data.cards.push({
          ...card,
          id: uuid(),
          list_id: newListId,
          checklist: card.checklist?.map(ci => ({ ...ci, id: uuid() })),
          attachments: card.attachments ? [...card.attachments] : [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }

    const originalLabels = data.labels.filter(l => l.board_id === board.id)
    for (const label of originalLabels) {
      data.labels.push({ ...label, id: uuid(), board_id: newBoardId })
    }
  }

  save(data)
  notify()
  return newWs
}

export function deleteWorkspace(id: string) {
  const data = load()
  const boardIds = data.boards.filter(b => b.workspace_id === id).map(b => b.id)
  const listIds = data.lists.filter(l => boardIds.includes(l.board_id)).map(l => l.id)
  data.cards = data.cards.filter(c => !listIds.includes(c.list_id))
  data.lists = data.lists.filter(l => !boardIds.includes(l.board_id))
  data.labels = data.labels.filter(l => !boardIds.includes(l.board_id))
  data.boards = data.boards.filter(b => b.workspace_id !== id)
  data.workspaces = data.workspaces.filter(w => w.id !== id)
  save(data)
  notify()
}

// ============================================
// BOARDS
// ============================================

export function getBoards(workspaceId: string): Board[] {
  return load().boards
    .filter(b => b.workspace_id === workspaceId)
    .sort((a, b) => a.position - b.position)
}

export function getBoard(id: string): Board | null {
  return load().boards.find(b => b.id === id) || null
}

export function createBoard(workspaceId: string, name: string): Board {
  const data = load()
  const existing = data.boards.filter(b => b.workspace_id === workspaceId)
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
  const board: Board = {
    id: uuid(),
    workspace_id: workspaceId,
    name,
    color: colors[Math.floor(Math.random() * colors.length)],
    position: existing.length,
    created_at: new Date().toISOString(),
  }
  data.boards.push(board)

  DEFAULT_LISTS.forEach((listName, i) => {
    data.lists.push({
      id: uuid(),
      board_id: board.id,
      name: listName,
      position: i,
      color: null,
      created_at: new Date().toISOString(),
    })
  })

  save(data)
  notify()
  return board
}

export function renameBoard(id: string, name: string) {
  const data = load()
  const board = data.boards.find(b => b.id === id)
  if (board) board.name = name
  save(data)
  notify()
}

export function duplicateBoard(id: string): Board | null {
  const data = load()
  const original = data.boards.find(b => b.id === id)
  if (!original) return null

  const newBoardId = uuid()
  const newBoard: Board = {
    ...original,
    id: newBoardId,
    name: `${original.name} (cópia)`,
    position: data.boards.filter(b => b.workspace_id === original.workspace_id).length,
    created_at: new Date().toISOString(),
  }
  data.boards.push(newBoard)

  const originalLists = data.lists.filter(l => l.board_id === id)
  const labelMap: Record<string, string> = {}

  const originalLabels = data.labels.filter(l => l.board_id === id)
  for (const label of originalLabels) {
    const newLabelId = uuid()
    labelMap[label.id] = newLabelId
    data.labels.push({ ...label, id: newLabelId, board_id: newBoardId })
  }

  for (const list of originalLists) {
    const newListId = uuid()
    data.lists.push({ ...list, id: newListId, board_id: newBoardId, created_at: new Date().toISOString() })

    const originalCards = data.cards.filter(c => c.list_id === list.id)
    for (const card of originalCards) {
      data.cards.push({
        ...card,
        id: uuid(),
        list_id: newListId,
        label_ids: card.label_ids?.map(lid => labelMap[lid] || lid),
        checklist: card.checklist?.map(ci => ({ ...ci, id: uuid() })),
        attachments: card.attachments ? [...card.attachments] : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  save(data)
  notify()
  return newBoard
}

export function deleteBoard(id: string) {
  const data = load()
  const listIds = data.lists.filter(l => l.board_id === id).map(l => l.id)
  data.cards = data.cards.filter(c => !listIds.includes(c.list_id))
  data.lists = data.lists.filter(l => l.board_id !== id)
  data.labels = data.labels.filter(l => l.board_id !== id)
  data.boards = data.boards.filter(b => b.id !== id)
  save(data)
  notify()
}

// ============================================
// LISTS
// ============================================

export function getLists(boardId: string): List[] {
  return load().lists
    .filter(l => l.board_id === boardId)
    .sort((a, b) => a.position - b.position)
}

export function createList(boardId: string, name: string): List {
  const data = load()
  const existing = data.lists.filter(l => l.board_id === boardId)
  const list: List = {
    id: uuid(),
    board_id: boardId,
    name,
    position: existing.length,
    color: null,
    created_at: new Date().toISOString(),
  }
  data.lists.push(list)
  save(data)
  notify()
  return list
}

export function updateList(id: string, updates: Partial<Pick<List, 'name' | 'position' | 'color'>>) {
  const data = load()
  const list = data.lists.find(l => l.id === id)
  if (list) Object.assign(list, updates)
  save(data)
  notify()
}

export function deleteList(id: string) {
  const data = load()
  data.cards = data.cards.filter(c => c.list_id !== id)
  data.lists = data.lists.filter(l => l.id !== id)
  save(data)
  notify()
}

// ============================================
// CARDS
// ============================================

export function getCards(listId: string): Card[] {
  return load().cards
    .filter(c => c.list_id === listId && !c.archived)
    .sort((a, b) => a.position - b.position)
}

export function getCardsByBoard(boardId: string): Card[] {
  const data = load()
  const listIds = data.lists.filter(l => l.board_id === boardId).map(l => l.id)
  return data.cards
    .filter(c => listIds.includes(c.list_id) && !c.archived)
    .sort((a, b) => a.position - b.position)
}

export function createCard(listId: string, title: string): Card {
  const data = load()
  const existing = data.cards.filter(c => c.list_id === listId && !c.archived)
  const card: Card = {
    id: uuid(),
    list_id: listId,
    title,
    description: null,
    position: existing.length,
    due_date: null,
    cover_url: null,
    archived: false,
    created_by: data.profile.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    label_ids: [],
    checklist: [],
    attachments: [],
  }
  data.cards.push(card)
  save(data)
  notify()
  return card
}

export function updateCard(id: string, updates: Partial<Pick<Card, 'title' | 'description' | 'due_date' | 'cover_url' | 'list_id' | 'position' | 'archived' | 'label_ids' | 'checklist' | 'attachments'>>): Card | null {
  const data = load()
  const card = data.cards.find(c => c.id === id)
  if (!card) return null
  Object.assign(card, updates, { updated_at: new Date().toISOString() })
  save(data)
  notify()
  return { ...card }
}

export function deleteCard(id: string) {
  const data = load()
  data.cards = data.cards.filter(c => c.id !== id)
  save(data)
  notify()
}

export function moveCard(cardId: string, toListId: string, toPosition: number) {
  const data = load()
  const card = data.cards.find(c => c.id === cardId)
  if (!card) return
  card.list_id = toListId
  card.position = toPosition
  card.updated_at = new Date().toISOString()
  save(data)
}

export function reorderCards(listId: string, orderedIds: string[]) {
  const data = load()
  orderedIds.forEach((id, index) => {
    const card = data.cards.find(c => c.id === id)
    if (card) {
      card.list_id = listId
      card.position = index
    }
  })
  save(data)
}

// ============================================
// LABELS
// ============================================

export function getLabels(boardId: string): Label[] {
  return load().labels.filter(l => l.board_id === boardId)
}

export function createLabel(boardId: string, name: string, color: string): Label {
  const data = load()
  const label: Label = { id: uuid(), board_id: boardId, name, color }
  data.labels.push(label)
  save(data)
  notify()
  return label
}

export function deleteLabel(id: string) {
  const data = load()
  data.cards.forEach(c => {
    if (c.label_ids) c.label_ids = c.label_ids.filter(lid => lid !== id)
  })
  data.labels = data.labels.filter(l => l.id !== id)
  save(data)
  notify()
}

// ============================================
// CHECKLIST HELPERS
// ============================================

export function addChecklistItem(cardId: string, text: string): ChecklistItem | null {
  const data = load()
  const card = data.cards.find(c => c.id === cardId)
  if (!card) return null
  if (!card.checklist) card.checklist = []
  const item: ChecklistItem = { id: uuid(), text, checked: false }
  card.checklist.push(item)
  card.updated_at = new Date().toISOString()
  save(data)
  notify()
  return item
}

export function toggleChecklistItem(cardId: string, itemId: string) {
  const data = load()
  const card = data.cards.find(c => c.id === cardId)
  if (!card?.checklist) return
  const item = card.checklist.find(i => i.id === itemId)
  if (item) item.checked = !item.checked
  card.updated_at = new Date().toISOString()
  save(data)
  notify()
}

export function deleteChecklistItem(cardId: string, itemId: string) {
  const data = load()
  const card = data.cards.find(c => c.id === cardId)
  if (!card?.checklist) return
  card.checklist = card.checklist.filter(i => i.id !== itemId)
  card.updated_at = new Date().toISOString()
  save(data)
  notify()
}

// ============================================
// ATTACHMENT HELPERS
// ============================================

export function addAttachment(cardId: string, file: { name: string; url: string; type: string; size: number }): Attachment | null {
  const data = load()
  const card = data.cards.find(c => c.id === cardId)
  if (!card) return null
  if (!card.attachments) card.attachments = []
  const att: Attachment = { id: uuid(), ...file, created_at: new Date().toISOString() }
  card.attachments.push(att)
  card.updated_at = new Date().toISOString()
  save(data)
  notify()
  return att
}

export function deleteAttachment(cardId: string, attachmentId: string) {
  const data = load()
  const card = data.cards.find(c => c.id === cardId)
  if (!card?.attachments) return
  card.attachments = card.attachments.filter(a => a.id !== attachmentId)
  card.updated_at = new Date().toISOString()
  save(data)
  notify()
}

// ============================================
// SEARCH
// ============================================

export interface SearchResult {
  card: Card
  boardId: string
  boardName: string
  listName: string
  workspaceName: string
}

export function searchCards(query: string): SearchResult[] {
  if (!query.trim()) return []
  const data = load()
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  for (const card of data.cards) {
    if (card.archived) continue
    const matchTitle = card.title.toLowerCase().includes(q)
    const matchDesc = card.description?.toLowerCase().includes(q)
    if (!matchTitle && !matchDesc) continue

    const list = data.lists.find(l => l.id === card.list_id)
    if (!list) continue
    const board = data.boards.find(b => b.id === list.board_id)
    if (!board) continue
    const workspace = data.workspaces.find(w => w.id === board.workspace_id)
    if (!workspace) continue

    results.push({
      card,
      boardId: board.id,
      boardName: board.name,
      listName: list.name,
      workspaceName: workspace.name,
    })
  }
  return results
}

// ============================================
// PLANNER (calendar data)
// ============================================

export interface PlannerCard {
  card: Card
  boardId: string
  boardName: string
  boardColor: string
  listName: string
  labels: Label[]
}

export function getCardsWithDueDate(): PlannerCard[] {
  const data = load()
  const results: PlannerCard[] = []

  for (const card of data.cards) {
    if (card.archived || !card.due_date) continue

    const list = data.lists.find(l => l.id === card.list_id)
    if (!list) continue
    const board = data.boards.find(b => b.id === list.board_id)
    if (!board) continue

    const boardLabels = data.labels.filter(l => l.board_id === board.id)
    const cardLabels = boardLabels.filter(l => card.label_ids?.includes(l.id))

    results.push({
      card,
      boardId: board.id,
      boardName: board.name,
      boardColor: board.color,
      listName: list.name,
      labels: cardLabels,
    })
  }

  return results.sort((a, b) => new Date(a.card.due_date!).getTime() - new Date(b.card.due_date!).getTime())
}

// ============================================
// RESET
// ============================================

export function resetStore() {
  const seed = createSeedData()
  save(seed)
  notify()
}
