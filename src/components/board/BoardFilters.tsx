'use client'

import { useState } from 'react'
import type { Label } from '@/lib/types'

export interface FilterState {
  labelIds: string[]
  dueDateFilter: 'all' | 'overdue' | 'upcoming' | 'none'
  search: string
}

interface BoardFiltersProps {
  labels: Label[]
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export const DEFAULT_FILTERS: FilterState = {
  labelIds: [],
  dueDateFilter: 'all',
  search: '',
}

export function isFiltered(filters: FilterState): boolean {
  return filters.labelIds.length > 0 || filters.dueDateFilter !== 'all' || filters.search.trim() !== ''
}

export default function BoardFilters({ labels, filters, onChange }: BoardFiltersProps) {
  const [expanded, setExpanded] = useState(false)

  function toggleLabel(id: string) {
    const next = filters.labelIds.includes(id)
      ? filters.labelIds.filter(l => l !== id)
      : [...filters.labelIds, id]
    onChange({ ...filters, labelIds: next })
  }

  function clearFilters() {
    onChange(DEFAULT_FILTERS)
  }

  const active = isFiltered(filters)

  return (
    <div className="flex items-center gap-2">
      {/* Search within board */}
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Filtrar cards..."
          className="w-44 rounded-lg border border-border py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-list-bg'
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filtros
        {active && <span className="rounded-full bg-primary px-1.5 text-[10px] text-white">{filters.labelIds.length + (filters.dueDateFilter !== 'all' ? 1 : 0)}</span>}
      </button>

      {active && (
        <button onClick={clearFilters} className="text-xs text-muted hover:text-foreground">
          Limpar
        </button>
      )}

      {expanded && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 rounded-xl border border-border bg-card-bg p-4 shadow-lg space-y-4">
          {/* Label filter */}
          <div>
            <p className="text-xs font-medium text-muted mb-2">Etiquetas</p>
            <div className="flex flex-wrap gap-1.5">
              {labels.map(label => (
                <button
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold text-white transition-opacity ${
                    filters.labelIds.length > 0 && !filters.labelIds.includes(label.id) ? 'opacity-40' : ''
                  }`}
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          {/* Due date filter */}
          <div>
            <p className="text-xs font-medium text-muted mb-2">Prazo</p>
            <div className="space-y-1">
              {([
                ['all', 'Todos'],
                ['overdue', 'Atrasados'],
                ['upcoming', 'Próximos 7 dias'],
                ['none', 'Sem prazo'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => onChange({ ...filters, dueDateFilter: value })}
                  className={`block w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                    filters.dueDateFilter === value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-list-bg'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function applyFilters(cards: { [listId: string]: import('@/lib/types').Card[] }, filters: FilterState): { [listId: string]: import('@/lib/types').Card[] } {
  if (!isFiltered(filters)) return cards

  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 86400000)
  const result: { [listId: string]: import('@/lib/types').Card[] } = {}

  for (const [listId, listCards] of Object.entries(cards)) {
    result[listId] = listCards.filter(card => {
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase()
        if (!card.title.toLowerCase().includes(q) && !card.description?.toLowerCase().includes(q)) return false
      }

      if (filters.labelIds.length > 0) {
        if (!card.label_ids || !filters.labelIds.some(id => card.label_ids!.includes(id))) return false
      }

      if (filters.dueDateFilter === 'overdue') {
        if (!card.due_date || new Date(card.due_date) >= now) return false
      } else if (filters.dueDateFilter === 'upcoming') {
        if (!card.due_date) return false
        const due = new Date(card.due_date)
        if (due < now || due > weekFromNow) return false
      } else if (filters.dueDateFilter === 'none') {
        if (card.due_date) return false
      }

      return true
    })
  }

  return result
}
