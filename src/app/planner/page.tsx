'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as store from '@/lib/store'
import type { PlannerCard } from '@/lib/store'
import Navbar from '@/components/layout/Navbar'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function PlannerPage() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [cards, setCards] = useState<PlannerCard[]>([])
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  const loadCards = useCallback(() => {
    setCards(store.getCardsWithDueDate())
  }, [])

  useEffect(() => {
    loadCards()
    return store.subscribe(loadCards)
  }, [loadCards])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function goToday() {
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  function getCardsForDay(day: number): PlannerCard[] {
    return cards.filter(c => {
      const d = new Date(c.card.due_date!)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  // List view: group by date
  const upcomingCards = cards.filter(c => {
    const d = new Date(c.card.due_date!)
    return d >= new Date(new Date().setHours(0, 0, 0, 0))
  })

  const overdueCards = cards.filter(c => {
    const d = new Date(c.card.due_date!)
    return d < new Date(new Date().setHours(0, 0, 0, 0))
  })

  return (
    <div className="min-h-full bg-background flex flex-col">
      <Navbar />

      {/* Sub-header with view toggle */}
      <div className="border-b border-border bg-card-bg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <h2 className="text-lg font-semibold">Planejador</h2>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'calendar' ? 'bg-primary text-white' : 'hover:bg-list-bg'}`}
            >
              Calendário
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === 'list' ? 'bg-primary text-white' : 'hover:bg-list-bg'}`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {view === 'calendar' ? (
        <main className="mx-auto w-full max-w-6xl px-6 py-6 flex-1">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="rounded-lg border border-border p-2 hover:bg-list-bg transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold min-w-[200px] text-center">
                {MONTH_NAMES[month]} {year}
              </h2>
              <button onClick={nextMonth} className="rounded-lg border border-border p-2 hover:bg-list-bg transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button onClick={goToday} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-list-bg transition-colors">
              Hoje
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 border-l border-t border-border rounded-xl overflow-hidden">
            {DAY_NAMES.map(d => (
              <div key={d} className="bg-list-bg border-r border-b border-border px-2 py-2 text-center text-xs font-semibold text-muted">
                {d}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-border bg-list-bg/30" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayCards = getCardsForDay(day)
              return (
                <div
                  key={day}
                  className={`min-h-[100px] border-r border-b border-border p-1.5 ${
                    isToday(day) ? 'bg-primary/5' : 'bg-card-bg hover:bg-list-bg/50'
                  } transition-colors`}
                >
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday(day) ? 'bg-primary text-white' : ''
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayCards.slice(0, 3).map(pc => (
                      <button
                        key={pc.card.id}
                        onClick={() => router.push(`/kanban/${pc.boardId}`)}
                        className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white transition-opacity hover:opacity-80"
                        style={{ backgroundColor: pc.boardColor }}
                        title={`${pc.card.title} (${pc.listName})`}
                      >
                        {pc.card.title}
                      </button>
                    ))}
                    {dayCards.length > 3 && (
                      <p className="text-[10px] text-muted px-1.5">+{dayCards.length - 3} mais</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-3xl px-6 py-6 flex-1 space-y-8">
          {/* Overdue */}
          {overdueCards.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-danger mb-3">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Atrasados ({overdueCards.length})
              </h3>
              <div className="space-y-2">
                {overdueCards.map(pc => (
                  <PlannerCardRow key={pc.card.id} pc={pc} router={router} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Próximos ({upcomingCards.length})
            </h3>
            {upcomingCards.length === 0 ? (
              <p className="text-sm text-muted">Nenhum card com prazo futuro</p>
            ) : (
              <div className="space-y-2">
                {upcomingCards.map(pc => (
                  <PlannerCardRow key={pc.card.id} pc={pc} router={router} />
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  )
}

function PlannerCardRow({ pc, router }: { pc: PlannerCard; router: ReturnType<typeof useRouter> }) {
  const due = new Date(pc.card.due_date!)
  const isOverdue = due < new Date()

  return (
    <button
      onClick={() => router.push(`/kanban/${pc.boardId}`)}
      className="flex w-full items-center gap-4 rounded-xl border border-border bg-card-bg p-4 text-left hover:shadow-md transition-shadow"
    >
      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: pc.boardColor }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{pc.card.title}</p>
        <p className="text-xs text-muted mt-0.5">{pc.boardName} &middot; {pc.listName}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {pc.labels.map(l => (
          <span key={l.id} className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: l.color }}>
            {l.name}
          </span>
        ))}
        <span className={`text-xs font-medium px-2 py-1 rounded ${isOverdue ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
          {due.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </button>
  )
}
