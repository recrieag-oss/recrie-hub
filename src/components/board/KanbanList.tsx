'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { List, Card, Label } from '@/lib/types'
import CardItem from './CardItem'

interface KanbanListProps {
  list: List
  cards: Card[]
  labels: Label[]
  onAddCard: (listId: string, title: string) => void
  onCardClick: (card: Card) => void
}

export default function KanbanList({ list, cards, labels, onAddCard, onCardClick }: KanbanListProps) {
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')

  const { setNodeRef, isOver } = useDroppable({ id: list.id })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    onAddCard(list.id, newCardTitle.trim())
    setNewCardTitle('')
    setShowAddCard(false)
  }

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-list-bg">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          {list.color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: list.color }} />}
          <h3 className="text-sm font-semibold">{list.name}</h3>
          <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">{cards.length}</span>
        </div>
        <button onClick={() => setShowAddCard(true)} className="rounded p-1 text-muted hover:bg-border hover:text-foreground transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto px-2 pb-2 list-scroll min-h-[40px] ${isOver ? 'bg-primary/5 rounded-lg' : ''}`}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem key={card.id} card={card} labels={labels} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      {showAddCard ? (
        <form onSubmit={handleSubmit} className="p-2">
          <textarea
            autoFocus
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
              if (e.key === 'Escape') { setShowAddCard(false); setNewCardTitle('') }
            }}
            placeholder="Título do card..."
            rows={2}
            className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="mt-2 flex gap-2">
            <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">Adicionar</button>
            <button type="button" onClick={() => { setShowAddCard(false); setNewCardTitle('') }} className="text-sm text-muted hover:text-foreground">Cancelar</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAddCard(true)} className="mx-2 mb-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-border/50 transition-colors">
          + Adicionar card
        </button>
      )}
    </div>
  )
}
