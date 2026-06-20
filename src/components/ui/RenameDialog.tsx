'use client'

import { useState, useEffect } from 'react'

interface RenameDialogProps {
  title: string
  currentName: string
  onSave: (name: string) => void
  onClose: () => void
}

export default function RenameDialog({ title, currentName, onSave, onClose }: RenameDialogProps) {
  const [name, setName] = useState(currentName)

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onSave(name.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-card-bg p-6 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-list-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}
