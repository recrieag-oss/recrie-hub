'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card, Label } from '@/lib/types'

interface CardItemProps {
  card: Card
  labels?: Label[]
  onClick: () => void
}

function getDueDateStatus(dueDate: string | null): 'ok' | 'overdue' | 'none' {
  if (!dueDate) return 'none'
  return new Date(dueDate) < new Date() ? 'overdue' : 'ok'
}

export default function CardItem({ card, labels = [], onClick }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const dueStatus = getDueDateStatus(card.due_date)
  const cardLabels = labels.filter(l => card.label_ids?.includes(l.id))
  const checklist = card.checklist || []
  const checkedCount = checklist.filter(i => i.checked).length
  const attachCount = card.attachments?.length || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-border bg-card-bg p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      {card.cover_url && (
        <div className="mb-2 -mx-3 -mt-3 overflow-hidden rounded-t-lg bg-black/20">
          <img src={card.cover_url} alt="" className="w-full object-contain max-h-60" />
        </div>
      )}

      {cardLabels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {cardLabels.map(label => (
            <span
              key={label.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm font-medium leading-snug">{card.title}</p>

      <div className="mt-2 flex items-center gap-2.5 flex-wrap">
        {card.due_date ? (
          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${
            dueStatus === 'overdue' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
          }`}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(card.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-muted">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(card.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </span>
        )}
        {card.description && (
          <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )}
        {checklist.length > 0 && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
            checkedCount === checklist.length ? 'text-success' : 'text-muted'
          }`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {checkedCount}/{checklist.length}
          </span>
        )}
        {attachCount > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {attachCount}
          </span>
        )}
      </div>
    </div>
  )
}
