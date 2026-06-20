'use client'

import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import * as ag from '@/lib/agencia-store'

type Tab = 'referencias' | 'prompts'
type Modal = 'edit-prompt' | 'edit-ref' | null

const C = { bg: '#0a0a0f', surface: '#111827', border: '#1e293b', muted: '#64748b', pink: '#ec4899', text: '#e2e8f0' }

export default function AgenciaPage() {
  const [tab, setTab] = useState<Tab>('referencias')
  const [categories, setCategories] = useState<ag.Category[]>([])
  const [references, setReferences] = useState<ag.Reference[]>([])
  const [prompts, setPrompts] = useState<ag.Prompt[]>([])
  const [selectedCat, setSelectedCat] = useState<string | 'all'>('all')
  const [selectedRef, setSelectedRef] = useState<ag.Reference | null>(null)
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [ver, setVer] = useState(0)

  useEffect(() => {
    setCategories(ag.getCategories())
    setReferences(ag.getAllReferences())
    setPrompts(ag.getPrompts())
  }, [ver])

  function reload() { setVer(v => v + 1) }

  const filteredRefs = references.filter(r => {
    if (selectedCat !== 'all' && r.category_id !== (selectedCat === 'none' ? null : selectedCat)) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const filteredPrompts = prompts.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.content.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function getCat(id: string | null) {
    return id ? categories.find(c => c.id === id) : null
  }

  function delPrompt(id: string) { if (confirm('Excluir este prompt?')) { ag.deletePrompt(id); reload() } }
  function delRef(id: string) { if (confirm('Excluir esta referência?')) { ag.deleteReference(id); setSelectedRef(null); reload() } }

  return (
    <div className="min-h-full" style={{ background: C.bg, color: C.text }}>
      <Navbar />

      <div style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">Agência</h2>
            <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              <button onClick={() => setTab('referencias')} className="px-4 py-1.5 text-xs font-semibold transition-colors"
                style={tab === 'referencias' ? { background: C.pink, color: '#fff' } : {}}>
                Referências ({references.length})
              </button>
              <button onClick={() => setTab('prompts')} className="px-4 py-1.5 text-xs font-semibold transition-colors"
                style={tab === 'prompts' ? { background: C.pink, color: '#fff' } : {}}>
                Prompts ({prompts.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: C.muted }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                className="w-48 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                style={{ background: C.surface, border: `1px solid ${C.border}` }} />
            </div>
            <button onClick={() => { setEditId(null); setModal(tab === 'prompts' ? 'edit-prompt' : 'edit-ref') }}
              className="rounded-lg px-3 py-2 text-xs font-bold text-white" style={{ background: C.pink }}>
              + {tab === 'prompts' ? 'Prompt' : 'Referência'}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {tab === 'referencias' && (
          <>
            <div className="flex gap-2 mb-6 flex-wrap">
              <button onClick={() => setSelectedCat('all')} className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
                style={selectedCat === 'all' ? { background: C.pink, color: '#fff' } : { background: C.border, color: '#94a3b8' }}>
                Todas ({references.length})
              </button>
              {categories.map(cat => {
                const count = references.filter(r => r.category_id === cat.id).length
                return (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
                    style={selectedCat === cat.id ? { background: cat.color, color: '#fff' } : { background: C.border, color: '#94a3b8' }}>
                    {cat.name} ({count})
                  </button>
                )
              })}
              <button onClick={() => setSelectedCat('none')} className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
                style={selectedCat === 'none' ? { background: C.muted, color: '#fff' } : { background: C.border, color: '#94a3b8' }}>
                Sem categoria ({references.filter(r => !r.category_id).length})
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredRefs.map(ref => {
                const cat = getCat(ref.category_id)
                return (
                  <div key={ref.id} onClick={() => setSelectedRef(ref)}
                    className="group cursor-pointer rounded-xl overflow-hidden transition-transform hover:scale-[1.02]"
                    style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="aspect-square overflow-hidden relative">
                      <img src={ref.thumbnail_url || ref.image_url} alt={ref.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/1e293b/64748b?text=${encodeURIComponent(ref.title)}` }} />
                      {cat && (
                        <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: cat.color + 'cc' }}>
                          {cat.name}
                        </span>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); ag.toggleFavoriteRef(ref.id); reload() }}
                          className="p-1 rounded-full" style={{ background: '#00000066' }}>
                          <svg className="h-4 w-4" fill={ref.is_favorite ? '#f59e0b' : 'none'} viewBox="0 0 24 24" stroke={ref.is_favorite ? '#f59e0b' : '#fff'} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-bold truncate">{ref.title}</h4>
                      {ref.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: C.muted }}>{ref.description}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredRefs.length === 0 && <p className="text-center py-16 text-sm" style={{ color: C.muted }}>Nenhuma referência encontrada</p>}
          </>
        )}

        {tab === 'prompts' && (
          <div className="space-y-4">
            {filteredPrompts.map(p => (
              <div key={p.id} className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold" style={{ color: C.pink }}>{p.title}</h4>
                    <button onClick={() => { ag.toggleFavoritePrompt(p.id); reload() }}>
                      <svg className="h-4 w-4" fill={p.is_favorite ? '#f59e0b' : 'none'} viewBox="0 0 24 24" stroke={p.is_favorite ? '#f59e0b' : C.muted} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copy(p.content, p.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      style={{ background: copied === p.id ? '#10b98120' : C.border, color: copied === p.id ? '#10b981' : '#94a3b8' }}>
                      {copied === p.id ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button onClick={() => { setEditId(p.id); setModal('edit-prompt') }}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: C.border, color: '#94a3b8' }}>
                      Editar
                    </button>
                    <button onClick={() => delPrompt(p.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: C.border, color: '#f87171' }}>
                      ×
                    </button>
                  </div>
                </div>
                <div className="text-xs leading-relaxed whitespace-pre-wrap cursor-pointer" style={{ color: '#94a3b8' }}
                  onClick={() => setExpandedPrompt(expandedPrompt === p.id ? null : p.id)}>
                  {expandedPrompt === p.id ? p.content : p.content.slice(0, 250) + (p.content.length > 250 ? '...' : '')}
                </div>
                {p.content.length > 250 && (
                  <button onClick={() => setExpandedPrompt(expandedPrompt === p.id ? null : p.id)}
                    className="text-[11px] mt-2 font-semibold" style={{ color: C.pink }}>
                    {expandedPrompt === p.id ? 'Ver menos' : 'Ver mais'}
                  </button>
                )}
              </div>
            ))}
            {filteredPrompts.length === 0 && <p className="text-center py-16 text-sm" style={{ color: C.muted }}>Nenhum prompt encontrado</p>}
          </div>
        )}
      </main>

      {/* Reference detail modal */}
      {selectedRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={e => { if (e.target === e.currentTarget) setSelectedRef(null) }}>
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="relative">
              <img src={selectedRef.image_url} alt={selectedRef.title}
                className="w-full max-h-[50vh] object-contain rounded-t-2xl" style={{ background: '#000' }}
                onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/800x600/1e293b/64748b?text=${encodeURIComponent(selectedRef.title)}` }} />
              <button onClick={() => setSelectedRef(null)} className="absolute top-3 right-3 rounded-full p-2" style={{ background: '#000000aa' }}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold">{selectedRef.title}</h3>
                  {getCat(selectedRef.category_id) && (
                    <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: getCat(selectedRef.category_id)!.color }}>
                      {getCat(selectedRef.category_id)!.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditId(selectedRef.id); setSelectedRef(null); setModal('edit-ref') }}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: C.border, color: '#94a3b8' }}>
                    Editar
                  </button>
                  <button onClick={() => delRef(selectedRef.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: C.border, color: '#f87171' }}>
                    Excluir
                  </button>
                </div>
              </div>
              {selectedRef.description && (
                <>
                  <p className="text-xs font-semibold mb-1" style={{ color: C.muted }}>Prompt / Descrição</p>
                  <div className="rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap mb-4" style={{ background: C.bg, color: '#94a3b8' }}>
                    {selectedRef.description}
                  </div>
                  <button onClick={() => copy(selectedRef.description!, selectedRef.id)}
                    className="rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                    style={{ background: copied === selectedRef.id ? '#10b981' : C.pink, color: '#fff' }}>
                    {copied === selectedRef.id ? 'Copiado!' : 'Copiar prompt'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Prompt Modal */}
      {modal === 'edit-prompt' && (
        <PromptModal
          editId={editId}
          prompts={prompts}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={reload}
        />
      )}

      {/* Edit Reference Modal */}
      {modal === 'edit-ref' && (
        <ReferenceModal
          editId={editId}
          references={references}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={reload}
        />
      )}
    </div>
  )
}

function PromptModal({ editId, prompts, categories, onClose, onSave }: {
  editId: string | null; prompts: ag.Prompt[]; categories: ag.Category[]
  onClose: () => void; onSave: () => void
}) {
  const existing = prompts.find(p => p.id === editId)
  const [title, setTitle] = useState(existing?.title || '')
  const [content, setContent] = useState(existing?.content || '')
  const [categoryId, setCategoryId] = useState(existing?.category_id || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    if (editId && existing) {
      ag.updatePrompt(editId, { title, content, category_id: categoryId || null })
    } else {
      ag.createPrompt({ title, content, category_id: categoryId || null, tags: null })
    }
    onSave(); onClose()
  }

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-xl p-6 space-y-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-lg font-bold">{editId ? 'Editar Prompt' : 'Novo Prompt'}</h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do prompt" required
          className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }}>
          <option value="">Sem categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Conteúdo do prompt..." required rows={12}
          className={`${inputCls} resize-y`} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm" style={{ border: `1px solid ${C.border}` }}>Cancelar</button>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: C.pink }}>{editId ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>
    </div>
  )
}

function ReferenceModal({ editId, references, categories, onClose, onSave }: {
  editId: string | null; references: ag.Reference[]; categories: ag.Category[]
  onClose: () => void; onSave: () => void
}) {
  const existing = references.find(r => r.id === editId)
  const [title, setTitle] = useState(existing?.title || '')
  const [description, setDescription] = useState(existing?.description || '')
  const [imageUrl, setImageUrl] = useState(existing?.image_url || '')
  const [categoryId, setCategoryId] = useState(existing?.category_id || '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(reader.result as string)
      setUploading(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    if (editId && existing) {
      ag.updateReference(editId, { title, description: description || null, image_url: imageUrl, thumbnail_url: imageUrl, category_id: categoryId || null })
    } else {
      ag.createReference({ title, description: description || null, image_url: imageUrl, thumbnail_url: imageUrl, category_id: categoryId || null, tags: null })
    }
    onSave(); onClose()
  }

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={handleSubmit} className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl p-6 space-y-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-lg font-bold">{editId ? 'Editar Referência' : 'Nova Referência'}</h3>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" required
          className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }}>
          <option value="">Sem categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Image upload */}
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden" style={{ background: '#000' }}>
              <img src={imageUrl} alt="Preview" className="w-full max-h-48 object-contain" />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: '#00000099' }}>
                  Trocar imagem
                </button>
                <button type="button" onClick={() => setImageUrl('')}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: '#00000099', color: '#f87171' }}>
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full rounded-lg py-8 text-center transition-colors"
              style={{ border: `2px dashed ${C.border}`, color: C.muted }}>
              {uploading ? (
                <span>Carregando...</span>
              ) : (
                <div className="space-y-2">
                  <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Clique para fazer upload da imagem</p>
                  <p className="text-xs">PNG, JPG, WEBP</p>
                </div>
              )}
            </button>
          )}
        </div>

        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Prompt / Descrição" rows={8}
          className={`${inputCls} resize-y`} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm" style={{ border: `1px solid ${C.border}` }}>Cancelar</button>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: C.pink }}>{editId ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>
    </div>
  )
}
