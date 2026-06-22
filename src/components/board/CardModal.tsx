'use client'

import { useState, useEffect, useRef } from 'react'
import type { Card, Label } from '@/lib/types'
import * as store from '@/lib/db/kanban'

interface CardModalProps {
  card: Card
  boardId: string
  onClose: () => void
  onUpdate: (card: Card) => void
  onDelete: (cardId: string) => void
}

export default function CardModal({ card, boardId, onClose, onUpdate, onDelete }: CardModalProps) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dueDate, setDueDate] = useState(card.due_date ? card.due_date.slice(0, 16) : '')
  const [coverUrl, setCoverUrl] = useState(card.cover_url || '')
  const [checklist, setChecklist] = useState(card.checklist || [])
  const [newCheckItem, setNewCheckItem] = useState('')
  const [attachments, setAttachments] = useState(card.attachments || [])
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(card.label_ids || [])
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    store.getLabels(boardId).then(setAllLabels)
  }, [boardId])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showLabelPicker) setShowLabelPicker(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose, showLabelPicker])

  async function handleSave() {
    const updated = await store.updateCard(card.id, {
      title: title.trim() || card.title,
      description: description.trim() || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      cover_url: coverUrl.trim() || null,
      label_ids: selectedLabelIds,
      checklist,
      attachments,
    })
    if (updated) onUpdate(updated)
    onClose()
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este card?')) return
    await store.deleteCard(card.id)
    onDelete(card.id)
    onClose()
  }

  function addCheckItem(e: React.FormEvent) {
    e.preventDefault()
    if (!newCheckItem.trim()) return
    const item = { id: crypto.randomUUID(), text: newCheckItem.trim(), checked: false }
    setChecklist(prev => [...prev, item])
    setNewCheckItem('')
  }

  function toggleCheck(id: string) {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  }

  function removeCheckItem(id: string) {
    setChecklist(prev => prev.filter(i => i.id !== id))
  }

  function toggleLabel(labelId: string) {
    setSelectedLabelIds(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    )
  }

  async function addNewLabel(e: React.FormEvent) {
    e.preventDefault()
    if (!newLabelName.trim()) return
    const label = await store.createLabel(boardId, newLabelName.trim(), newLabelColor)
    if (!label) return
    setAllLabels(prev => [...prev, label])
    setSelectedLabelIds(prev => [...prev, label.id])
    setNewLabelName('')
  }

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCoverUrl(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const att = {
          id: crypto.randomUUID(),
          name: file.name,
          url: reader.result as string,
          type: file.type,
          size: file.size,
          created_at: new Date().toISOString(),
        }
        setAttachments(prev => [...prev, att])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const checkedCount = checklist.filter(i => i.checked).length
  const LABEL_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[5vh] px-4 overflow-y-auto pb-10"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl rounded-xl bg-card-bg shadow-2xl">
        {/* Cover preview */}
        {coverUrl && (
          <div className="overflow-hidden rounded-t-xl bg-black/30">
            <img src={coverUrl} alt="" className="w-full object-contain max-h-64" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-lg font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 -mx-1"
          />
          <button onClick={onClose} className="ml-4 rounded p-1 text-muted hover:bg-list-bg hover:text-foreground transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-[1fr_180px] gap-0">
          {/* Main content */}
          <div className="space-y-5 p-5 border-r border-border">
            {/* Labels */}
            {selectedLabelIds.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Etiquetas</label>
                <div className="flex flex-wrap gap-1.5">
                  {allLabels.filter(l => selectedLabelIds.includes(l.id)).map(label => (
                    <span key={label.id} className="rounded-full px-2.5 py-1 text-xs font-semibold text-white" style={{ backgroundColor: label.color }}>
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Due date */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Prazo</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Capa</label>
              <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              {coverUrl ? (
                <div className="relative rounded-lg overflow-hidden h-32" style={{ background: '#000' }}>
                  <img src={coverUrl} alt="Capa" className="w-full object-contain max-h-48" />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <button type="button" onClick={() => coverInputRef.current?.click()}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-semibold text-white" style={{ background: '#00000099' }}>
                      Trocar
                    </button>
                    <button type="button" onClick={() => setCoverUrl('')}
                      className="rounded-lg px-2.5 py-1 text-[10px] font-semibold" style={{ background: '#00000099', color: '#f87171' }}>
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => coverInputRef.current?.click()}
                  className="w-full rounded-lg py-6 text-center border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-colors">
                  <svg className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-medium">Upload de capa</p>
                </button>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Adicione uma descrição..."
                className="w-full resize-y rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted">
                  Checklist {checklist.length > 0 && `(${checkedCount}/${checklist.length})`}
                </label>
              </div>
              {checklist.length > 0 && (
                <div className="mb-2 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${checklist.length > 0 ? (checkedCount / checklist.length) * 100 : 0}%` }}
                  />
                </div>
              )}
              <div className="space-y-1 mb-2">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 group/check">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted' : ''}`}>{item.text}</span>
                    <button
                      onClick={() => removeCheckItem(item.id)}
                      className="opacity-0 group-hover/check:opacity-100 rounded p-0.5 text-muted hover:text-danger transition-all"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={addCheckItem} className="flex gap-2">
                <input
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  placeholder="Novo item..."
                  className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" className="rounded-lg bg-list-bg px-3 py-1.5 text-sm font-medium hover:bg-border transition-colors">
                  Adicionar
                </button>
              </form>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Anexos</label>
              {attachments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-3 rounded-lg border border-border p-2 group/att">
                      {att.type.startsWith('image/') ? (
                        <img src={att.url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-list-bg text-xs font-medium text-muted">
                          {att.name.split('.').pop()?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{att.name}</p>
                        <p className="text-xs text-muted">{formatSize(att.size)}</p>
                      </div>
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="opacity-0 group-hover/att:opacity-100 rounded p-1 text-muted hover:text-danger transition-all"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary transition-colors w-full"
              >
                + Anexar arquivo
              </button>
            </div>

            <div className="text-xs text-muted">
              Criado em {new Date(card.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="p-4 space-y-2">
            <p className="text-xs font-medium text-muted mb-2">Ações</p>

            <button
              onClick={() => setShowLabelPicker(!showLabelPicker)}
              className="flex w-full items-center gap-2 rounded-lg bg-list-bg px-3 py-2 text-sm hover:bg-border transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Etiquetas
            </button>

            {showLabelPicker && (
              <div className="rounded-lg border border-border bg-card-bg p-3 shadow-lg space-y-2">
                {allLabels.map(label => (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-list-bg transition-colors"
                  >
                    <div className="h-4 w-4 rounded border-2 flex items-center justify-center" style={{ borderColor: label.color, backgroundColor: selectedLabelIds.includes(label.id) ? label.color : 'transparent' }}>
                      {selectedLabelIds.includes(label.id) && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: label.color }}>
                      {label.name}
                    </span>
                  </button>
                ))}
                <hr className="border-border" />
                <form onSubmit={addNewLabel} className="space-y-2">
                  <input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Nova etiqueta..."
                    className="w-full rounded border border-border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex flex-wrap gap-1">
                    {LABEL_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewLabelColor(c)}
                        className={`h-5 w-5 rounded-full ${newLabelColor === c ? 'ring-2 ring-offset-1 ring-foreground' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button type="submit" className="w-full rounded bg-primary px-2 py-1 text-xs font-medium text-white hover:bg-primary-hover transition-colors">
                    Criar etiqueta
                  </button>
                </form>
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-2 rounded-lg bg-list-bg px-3 py-2 text-sm hover:bg-border transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Anexar
            </button>

            <button
              onClick={async () => {
                const updated = await store.updateCard(card.id, { archived: true })
                if (updated) { onDelete(card.id); onClose() }
              }}
              className="flex w-full items-center gap-2 rounded-lg bg-list-bg px-3 py-2 text-sm hover:bg-border transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Arquivar
            </button>

            <hr className="border-border" />

            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border p-5">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-list-bg transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
