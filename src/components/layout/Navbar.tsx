'use client'

import { useRouter, usePathname } from 'next/navigation'
import GlobalSearch from './GlobalSearch'

const MODULES = [
  { href: '/dashboard', label: 'Kanban', match: ['/dashboard', '/kanban'] },
  { href: '/financeiro', label: 'Financeiro', match: ['/financeiro'] },
  { href: '/agencia', label: 'Agência', match: ['/agencia'] },
  { href: '/propostas', label: 'Propostas', match: ['/propostas'] },
  { href: '/planner', label: 'Planejador', match: ['/planner'] },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  function isActive(mod: typeof MODULES[0]) {
    return mod.match.some(m => pathname === m || pathname.startsWith(m + '/'))
  }

  return (
    <>
      <header style={{ borderBottom: '1px solid #1e293b', background: '#0d1117' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-black tracking-tight">R</div>
              <span className="text-base font-bold hidden sm:inline tracking-wide">RECRIE</span>
            </button>

            <div className="h-5 w-px hidden sm:block" style={{ background: '#1e293b' }} />

            <nav className="flex items-center gap-0.5">
              {MODULES.map(mod => (
                <button
                  key={mod.href}
                  onClick={() => router.push(mod.href)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive(mod) ? 'bg-primary/20 text-primary' : 'text-muted hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {mod.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors hover:bg-white/5"
              style={{ border: '1px solid #1e293b', color: '#64748b' }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden sm:inline rounded px-1 py-0.5 text-[10px]" style={{ border: '1px solid #1e293b' }}>Ctrl+K</kbd>
            </button>
          </div>
        </div>
      </header>
      <GlobalSearch />
    </>
  )
}
