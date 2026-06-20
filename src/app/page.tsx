'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

const MODULES = [
  {
    name: 'Kanban',
    description: 'Gestão de produção de conteúdo',
    href: '/dashboard',
    color: '#6366f1',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    name: 'Financeiro',
    description: 'Controle de receitas, gastos e metas',
    href: '/financeiro',
    color: '#f0b429',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Agência',
    description: 'Referências visuais e prompts de IA',
    href: '/agencia',
    color: '#ec4899',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Propostas',
    description: 'Orçamentos e propostas comerciais',
    href: '/propostas',
    color: '#3b82f6',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Planejador',
    description: 'Calendário de prazos consolidado',
    href: '/planner',
    color: '#10b981',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function HomePage() {
  const router = useRouter()
  const [seeding, setSeeding] = useState(false)
  const [seedDone, setSeedDone] = useState(false)

  async function seedData() {
    setSeeding(true)
    const res = await fetch('/api/seed', { method: 'POST' })
    if (res.ok) setSeedDone(true)
    setSeeding(false)
  }

  return (
    <div className="min-h-full bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white text-2xl font-black">R</div>
            <span className="text-3xl font-bold tracking-wide">RECRIE</span>
          </div>
          <p className="text-muted">Todas as ferramentas da agência em um só lugar</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MODULES.map(mod => (
            <button
              key={mod.href}
              onClick={() => router.push(mod.href)}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card-bg p-6 text-left transition-all hover:shadow-lg hover:scale-[1.01]"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: mod.color }}
              >
                {mod.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{mod.name}</h3>
                <p className="text-sm text-muted mt-0.5">{mod.description}</p>
              </div>
            </button>
          ))}
        </div>

        {!seedDone && (
          <div className="mt-10 text-center">
            <button onClick={seedData} disabled={seeding}
              className="rounded-xl px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors">
              {seeding ? 'Importando...' : '📥 Importar dados (Financeiro, Agência, Propostas)'}
            </button>
            <p className="text-xs text-muted mt-2">Importa os dados existentes para o banco de dados</p>
          </div>
        )}
        {seedDone && (
          <div className="mt-10 text-center">
            <p className="text-sm text-success font-medium">✅ Dados importados com sucesso! Navegue pelos módulos.</p>
          </div>
        )}
      </main>
    </div>
  )
}
