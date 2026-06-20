'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Workspace, Board } from '@/lib/types'
import * as store from '@/lib/store'
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

  const loadData = useCallback(() => {
    const ws = store.getWorkspaces()
    const withBoards = ws.map(w => ({ ...w, boards: store.getBoards(w.id) }))
    setWorkspaces(withBoards)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    return store.subscribe(loadData)
  }, [loadData])

  function createWorkspace(e: React.FormEvent) {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    store.createWorkspace(newWorkspaceName.trim())
    setNewWorkspaceName('')
    setShowNewWorkspace(false)
  }

  function createBoard(e: React.FormEvent, workspaceId: string) {
    e.preventDefault()
    if (!newBoardName.trim()) return
    store.createBoard(workspaceId, newBoardName.trim())
    setNewBoardName('')
    setShowNewBoard(null)
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
                <div className="h-6 w-6 rounded" style={{ backgroundColor: workspace.color }} />
                <h3 className="text-lg font-semibold">{workspace.name}</h3>
                <DropdownMenu items={[
                  {
                    label: 'Renomear',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                    onClick: () => setRenaming({ type: 'workspace', id: workspace.id, name: workspace.name }),
                  },
                  {
                    label: 'Duplicar',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
                    onClick: () => store.duplicateWorkspace(workspace.id),
                  },
                  {
                    label: 'Excluir',
                    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
                    danger: true,
                    onClick: () => { if (confirm(`Excluir workspace "${workspace.name}" e todos os seus quadros?`)) store.deleteWorkspace(workspace.id) },
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
                            onClick: () => store.duplicateBoard(board.id),
                          },
                          {
                            label: 'Excluir',
                            icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
                            danger: true,
                            onClick: () => { if (confirm(`Excluir quadro "${board.name}"?`)) store.deleteBoard(board.id) },
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
            if (renaming.type === 'workspace') store.renameWorkspace(renaming.id, name)
            else store.renameBoard(renaming.id, name)
            setRenaming(null)
          }}
        />
      )}
    </div>
  )
}
