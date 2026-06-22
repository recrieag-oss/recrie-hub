'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Workspace, Board } from '@/lib/types'
import * as store from '@/lib/db/kanban'
import DropdownMenu from '@/components/ui/DropdownMenu'
import RenameDialog from '@/components/ui/RenameDialog'
import Navbar from '@/components/layout/Navbar'

export default function DashboardPage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<(Workspace & { boards: Board[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [showNewBoard, setShowNewBoard] = useState<string | null>(null)
  const [newBoardName, setNewBoardName] = useState('')
  const [renaming, setRenaming] = useState<{ type: 'workspace' | 'board'; id: string; name: string } | null>(null)
  const [customizing, setCustomizing] = useState<string | null>(null)

  const [ver, setVer] = useState(0)

  const loadData = useCallback(async () => {
    const ws = await store.getWorkspaces()
    const withBoards = await Promise.all(ws.map(async w => ({ ...w, boards: await store.getBoards(w.id) })))
    setWorkspaces(withBoards)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData, ver])

  function reload() { setVer(v => v + 1) }

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    await store.createWorkspace(newWorkspaceName.trim())
    setNewWorkspaceName('')
    setShowNewWorkspace(false)
    reload()
  }

  async function createBoard(e: React.FormEvent, workspaceId: string) {
    e.preventDefault()
    if (!newBoardName.trim()) return
    await store.createBoard(workspaceId, newBoardName.trim())
    setNewBoardName('')
    setShowNewBoard(null)
    reload()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Seus Workspaces</h2>
          <button
            onClick={() => setShowNewWorkspace(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            + Novo Workspace
          </button>
        </div>

        {showNewWorkspace && (
          <form onSubmit={createWorkspace} className="mb-6 flex gap-2">
            <input
              autoFocus
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setShowNewWorkspace(false); setNewWorkspaceName('') } }}
              placeholder="Nome do workspace (ex: Mesaque Padilha)"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">Criar</button>
            <button type="button" onClick={() => { setShowNewWorkspace(false); setNewWorkspaceName('') }} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-list-bg transition-colors">Cancelar</button>
          </form>
        )}

        {workspaces.length === 0 && !showNewWorkspace && (
          <div className="rounded-xl border-2 border-dashed border-border py-16 text-center">
            <p className="text-muted mb-2">Nenhum workspace ainda</p>
            <button onClick={() => setShowNewWorkspace(true)} className="text-primary hover:underline text-sm font-medium">Crie seu primeiro workspace</button>
          </div>
        )}

        <div className="space-y-8">
          {workspaces.map((workspace) => (
            <div key={workspace.id}>
              <div className="flex items-center gap-3 mb-4">
                {workspace.logo_url ? (
                  <img src={workspace.logo_url} alt="" className="h-8 w-8 rounded object-contain" style={{ background: workspace.color }} />
                ) : (
                  <div className="h-6 w-6 rounded" style={{ backgroundColor: workspace.color }} />
                )}
                <h3 className="text-lg font-semibold">{workspace.name}</h3>
                <DropdownMenu items={[
                  {
                    label: 'Personalizar',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
                    onClick: () => setCustomizing(workspace.id),
                  },
                  {
                    label: 'Renomear',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                    onClick: () => setRenaming({ type: 'workspace', id: workspace.id, name: workspace.name }),
                  },
                  {
                    label: 'Excluir',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
                    danger: true,
                    onClick: () => { if (confirm(`Excluir workspace "${workspace.name}" e todos os seus quadros?`)) store.deleteWorkspace(workspace.id).then(reload) },
                  },
                ]} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {workspace.boards.map((board) => (
                  <div key={board.id} className="group relative">
                    <button
                      onClick={() => router.push(`/kanban/${board.id}`)}
                      className="w-full overflow-hidden rounded-xl p-6 text-left text-white transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: board.color }}
                    >
                      <h4 className="text-lg font-bold pr-6">{board.name}</h4>
                    </button>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu
                        trigger={
                          <svg className="h-4 w-4 text-white/80 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
                          </svg>
                        }
                        items={[
                          {
                            label: 'Renomear',
                            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                            onClick: () => setRenaming({ type: 'board', id: board.id, name: board.name }),
                          },
                          {
                            label: 'Duplicar',
                            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
                            onClick: () => { /* TODO: duplicate */ },
                          },
                          {
                            label: 'Excluir',
                            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
                            danger: true,
                            onClick: () => { if (confirm(`Excluir quadro "${board.name}"?`)) store.deleteBoard(board.id).then(reload) },
                          },
                        ]}
                      />
                    </div>
                  </div>
                ))}

                {showNewBoard === workspace.id ? (
                  <form onSubmit={(e) => createBoard(e, workspace.id)} className="rounded-xl border-2 border-dashed border-border p-4">
                    <input
                      autoFocus
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') { setShowNewBoard(null); setNewBoardName('') } }}
                      placeholder="Nome do quadro"
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">Criar</button>
                      <button type="button" onClick={() => { setShowNewBoard(null); setNewBoardName('') }} className="text-sm text-muted hover:text-foreground">Cancelar</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowNewBoard(workspace.id)} className="rounded-xl border-2 border-dashed border-border p-6 text-muted hover:border-primary hover:text-primary transition-colors">
                    + Novo Quadro
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {renaming && (
        <RenameDialog
          title={renaming.type === 'workspace' ? 'Renomear workspace' : 'Renomear quadro'}
          currentName={renaming.name}
          onClose={() => setRenaming(null)}
          onSave={(name) => {
            if (renaming.type === 'workspace') store.renameWorkspace(renaming.id, name).then(reload)
            else store.renameBoard(renaming.id, name).then(reload)
            setRenaming(null)
          }}
        />
      )}

      {customizing && (
        <WorkspaceCustomizeModal
          workspace={workspaces.find(w => w.id === customizing)!}
          onClose={() => setCustomizing(null)}
          onSave={reload}
        />
      )}
    </div>
  )
}

function WorkspaceCustomizeModal({ workspace, onClose, onSave }: { workspace: store.Workspace; onClose: () => void; onSave: () => void }) {
  const [color, setColor] = useState(workspace.color)
  const [logoUrl, setLogoUrl] = useState(workspace.logo_url || '')
  const [name, setName] = useState(workspace.name)
  const logoRef = React.useRef<HTMLInputElement>(null)

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#a855f7']

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const max = 200
      let w = img.width, h = img.height
      if (w > max || h > max) {
        if (w > h) { h = Math.round(h * max / w); w = max } else { w = Math.round(w * max / h); h = max }
      }
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      setLogoUrl(canvas.toDataURL('image/png', 0.8))
    }
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  async function handleSave() {
    await store.updateWorkspace(workspace.id, { name, color, logo_url: logoUrl || null })
    onSave(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-xl p-6 space-y-5" style={{ background: '#111827', border: '1px solid #1e293b' }}>
        <h3 className="text-lg font-bold">Personalizar Workspace</h3>

        <div>
          <label className="block text-xs font-medium text-muted mb-1">Nome</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-2">Cor</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-[#111827] ring-white scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted mb-2">Logo</label>
          <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: color }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-2xl font-black text-white">{name.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => logoRef.current?.click()}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ border: '1px solid #1e293b' }}>
                {logoUrl ? 'Trocar logo' : 'Upload logo'}
              </button>
              {logoUrl && (
                <button onClick={() => setLogoUrl('')} className="text-xs text-danger">Remover</button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm" style={{ border: '1px solid #1e293b' }}>Cancelar</button>
          <button onClick={handleSave} className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: color }}>Salvar</button>
        </div>
      </div>
    </div>
  )
}
