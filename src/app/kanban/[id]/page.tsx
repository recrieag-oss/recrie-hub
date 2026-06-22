'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Board, List, Card, Label } from '@/lib/types'
import * as store from '@/lib/db/kanban'
import KanbanList from '@/components/board/KanbanList'
import CardItem from '@/components/board/CardItem'
import CardModal from '@/components/board/CardModal'
import BoardFilters, { type FilterState, DEFAULT_FILTERS, applyFilters } from '@/components/board/BoardFilters'

export default function BoardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.id as string

  const [board, setBoard] = useState<Board | null>(null)
  const [lists, setLists] = useState<List[]>([])
  const [cardsByList, setCardsByList] = useState<Record<string, Card[]>>({})
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showAddList, setShowAddList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const loadBoard = useCallback(async () => {
    const boardData = await store.getBoard(boardId)
    if (!boardData) { router.push('/dashboard'); return }
    setBoard(boardData)

    const boardLists = await store.getLists(boardId)
    setLists(boardLists)

    const grouped: Record<string, Card[]> = {}
    await Promise.all(boardLists.map(async l => { grouped[l.id] = await store.getCards(l.id) }))
    setCardsByList(grouped)

    setLabels(await store.getLabels(boardId))
    setLoading(false)
  }, [boardId, router])

  useEffect(() => { loadBoard() }, [loadBoard])

  const filteredCards = useMemo(() => applyFilters(cardsByList, filters), [cardsByList, filters])

  async function addCard(listId: string, title: string) {
    const card = await store.createCard(listId, title)
    if (card) setCardsByList(prev => ({ ...prev, [listId]: [...(prev[listId] || []), card] }))
  }

  async function advanceCard(card: Card, currentListIndex: number) {
    const nextList = lists[currentListIndex + 1]
    if (!nextList) return
    await store.updateCard(card.id, { list_id: nextList.id, position: (cardsByList[nextList.id] || []).length } as Partial<Card>)
    setCardsByList(prev => ({
      ...prev,
      [card.list_id]: (prev[card.list_id] || []).filter(c => c.id !== card.id),
      [nextList.id]: [...(prev[nextList.id] || []), { ...card, list_id: nextList.id }],
    }))
  }

  async function addList(e: React.FormEvent) {
    e.preventDefault()
    if (!newListName.trim()) return
    const list = await store.createList(boardId, newListName.trim())
    if (!list) return
    setLists(prev => [...prev, list])
    setCardsByList(prev => ({ ...prev, [list.id]: [] }))
    setNewListName('')
    setShowAddList(false)
  }

  function handleDragStart(event: DragStartEvent) {
    const card = event.active.data.current?.card as Card | undefined
    if (card) setActiveCard(card)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const draggedCard = active.data.current?.card as Card | undefined
    if (!draggedCard) return

    const activeListId = draggedCard.list_id
    const overCard = over.data.current?.card as Card | undefined
    const overListId = overCard ? overCard.list_id : (over.id as string)

    if (activeListId === overListId) return

    setCardsByList(prev => {
      const sourceCards = [...(prev[activeListId] || [])]
      const destCards = [...(prev[overListId] || [])]
      const cardIndex = sourceCards.findIndex(c => c.id === draggedCard.id)
      if (cardIndex === -1) return prev

      const [movedCard] = sourceCards.splice(cardIndex, 1)
      movedCard.list_id = overListId

      if (overCard) {
        const overIndex = destCards.findIndex(c => c.id === overCard.id)
        destCards.splice(overIndex, 0, movedCard)
      } else {
        destCards.push(movedCard)
      }

      return { ...prev, [activeListId]: sourceCards, [overListId]: destCards }
    })

    draggedCard.list_id = overListId
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const draggedCard = active.data.current?.card as Card | undefined
    if (!draggedCard) return

    const overCard = over.data.current?.card as Card | undefined
    const overListId = overCard ? overCard.list_id : (over.id as string)

    setCardsByList(prev => {
      const listCards = [...(prev[overListId] || [])]
      const activeIndex = listCards.findIndex(c => c.id === draggedCard.id)
      const overIndex = overCard
        ? listCards.findIndex(c => c.id === overCard.id)
        : listCards.length - 1

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const reordered = arrayMove(listCards, activeIndex, overIndex)
        store.reorderCards(overListId, reordered.map(c => c.id))
        return { ...prev, [overListId]: reordered }
      }

      const ids = listCards.map(c => c.id)
      store.reorderCards(overListId, ids)
      return prev
    })
  }

  function handleCardUpdate(updatedCard: Card) {
    setCardsByList(prev => {
      const listCards = prev[updatedCard.list_id] || []
      return { ...prev, [updatedCard.list_id]: listCards.map(c => c.id === updatedCard.id ? updatedCard : c) }
    })
    store.getLabels(boardId).then(setLabels)
  }

  function handleCardDelete(cardId: string) {
    setCardsByList(prev => {
      const updated = { ...prev }
      for (const listId of Object.keys(updated)) {
        updated[listId] = updated[listId].filter(c => c.id !== cardId)
      }
      return updated
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border bg-sidebar-bg px-6 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="rounded p-1 text-muted hover:bg-list-bg hover:text-foreground transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="h-5 w-5 rounded" style={{ backgroundColor: board?.color }} />
          <h1 className="text-lg font-semibold">{board?.name}</h1>
        </div>

        <div className="relative">
          <BoardFilters labels={labels} filters={filters} onChange={setFilters} />
        </div>
      </header>

      <div className="flex-1 overflow-x-auto p-6 kanban-scroll">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start">
            {lists.map((list, listIndex) => (
              <KanbanList
                key={list.id}
                list={list}
                cards={filteredCards[list.id] || []}
                labels={labels}
                isLastList={listIndex === lists.length - 1}
                onAddCard={addCard}
                onCardClick={setSelectedCard}
                onAdvanceCard={(card) => advanceCard(card, listIndex)}
              />
            ))}

            {showAddList ? (
              <form onSubmit={addList} className="w-72 flex-shrink-0 rounded-xl bg-list-bg p-3">
                <input
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setShowAddList(false); setNewListName('') } }}
                  placeholder="Nome da lista..."
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="mt-2 flex gap-2">
                  <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">Adicionar lista</button>
                  <button type="button" onClick={() => { setShowAddList(false); setNewListName('') }} className="text-sm text-muted hover:text-foreground">Cancelar</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddList(true)} className="w-72 flex-shrink-0 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted hover:border-primary hover:text-primary transition-colors">
                + Adicionar lista
              </button>
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="rotate-3">
                <CardItem card={activeCard} labels={labels} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={boardId}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </div>
  )
}
