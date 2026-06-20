'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as store from '@/lib/db/kanban'
import type { SearchResult } from '@/lib/db/kanban'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else { setQuery(''); setResults([]) }
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => { store.searchCards(query).then(setResults) }, 150)
    return () => clearTimeout(timer)
  }, [query])

  function goToCard(result: SearchResult) {
    router.push(`/kanban/${result.boardId}`)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 pt-[15vh] px-4"
      onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl" style={{ background: '#111827', border: '1px solid #1e293b' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #1e293b' }}>
          <svg className="h-5 w-5" style={{ color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar cards em todos os quadros..."
            className="flex-1 bg-transparent text-sm focus:outline-none" />
          <kbd className="hidden sm:inline rounded px-1.5 py-0.5 text-[10px]" style={{ border: '1px solid #1e293b', color: '#64748b' }}>ESC</kbd>
        </div>

        {query.trim() && (
          <div className="max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm" style={{ color: '#64748b' }}>Nenhum resultado para &quot;{query}&quot;</p>
            ) : (
              <div className="py-1">
                {results.map(r => (
                  <button key={r.card.id} onClick={() => goToCard(r)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.card.title}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#64748b' }}>
                        {r.workspaceName} &middot; {r.boardName} &middot; {r.listName}
                      </p>
                    </div>
                    {r.card.due_date && (
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
                        new Date(r.card.due_date) < new Date() ? 'text-danger' : 'text-success'
                      }`} style={{ background: new Date(r.card.due_date) < new Date() ? '#f8717120' : '#10b98120' }}>
                        {new Date(r.card.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <p className="px-4 py-6 text-center text-xs" style={{ color: '#64748b' }}>Digite para buscar em todos os workspaces e quadros</p>
        )}
      </div>
    </div>
  )
}
