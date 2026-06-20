'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import * as ps from '@/lib/propostas-store'
import ProposalPreview from '@/components/propostas/ProposalPreview'

type Tab = 'dashboard' | 'clientes' | 'propostas'
type Modal = 'client' | 'proposal' | null

const C = { bg: '#07090c', surface: '#0d1117', card: '#111827', border: '#1e293b', muted: '#64748b', blue: '#3b82f6', text: '#e2e8f0' }

export default function PropostasPage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [modal, setModal] = useState<Modal>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [ver, setVer] = useState(0)

  const stats = ps.getStats()
  const proposals = ps.getProposals()
  const clients = ps.getClients()
  const activities = ps.getActivities()

  function reload() { setVer(v => v + 1) }

  // Force re-render
  useEffect(() => {}, [ver])

  return (
    <div className="min-h-full" style={{ background: C.bg, color: C.text }}>
      <Navbar />

      <div style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">Propostas</h2>
            <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              {([['dashboard', 'Dashboard'], ['propostas', 'Propostas'], ['clientes', 'Clientes']] as const).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} className="px-4 py-1.5 text-xs font-semibold transition-colors"
                  style={tab === key ? { background: C.blue, color: '#fff' } : {}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { setEditId(null); setModal('proposal') }}
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition-colors" style={{ background: C.blue }}>
            Criar proposta →
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* ====== DASHBOARD ====== */}
        {tab === 'dashboard' && (
          <>
            {/* Hero */}
            <div className="rounded-xl p-6 mb-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <p className="text-sm mb-1"><span className="inline-block h-2 w-2 rounded-full mr-2" style={{ background: '#10b981' }} />Olá, Cleberson</p>
              <h2 className="text-2xl font-bold mb-1">Tudo pronto para sua próxima proposta</h2>
              <p className="text-sm mb-4" style={{ color: C.muted }}>Crie sua primeira proposta e veja o painel ganhar vida.</p>
              <div className="flex gap-3">
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: '#1e293b' }}>
                  📈 Em negociação <strong className="ml-1">{ps.fmtR(stats.negotiationTotal)}</strong>
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: '#1e293b' }}>
                  ✅ {stats.approvedCount} aprovadas <strong className="ml-1">{ps.fmtR(stats.approvedTotal)}</strong>
                </span>
              </div>
            </div>

            {/* Activity + Recent proposals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity */}
              <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm">🔔</span>
                  <h3 className="text-sm font-bold">Atividade recente</h3>
                  <span className="ml-auto h-2 w-2 rounded-full" style={{ background: '#10b981' }} />
                </div>
                <div className="space-y-4">
                  {activities.map(a => (
                    <div key={a.id} className="flex items-start gap-3">
                      <span className="mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs" style={{
                        background: a.type === 'viewed' ? '#f59e0b20' : a.type === 'created' ? '#3b82f620' : '#10b98120',
                        color: a.type === 'viewed' ? '#f59e0b' : a.type === 'created' ? '#3b82f6' : '#10b981',
                      }}>
                        {a.type === 'viewed' ? '👁' : a.type === 'created' ? '📝' : '✅'}
                      </span>
                      <div>
                        <p className="text-sm">{a.text}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{ps.timeAgo(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-sm" style={{ color: C.muted }}>Nenhuma atividade</p>}
                </div>
              </div>

              {/* Latest proposals */}
              <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📋</span>
                    <h3 className="text-sm font-bold">Últimas propostas</h3>
                  </div>
                  <button onClick={() => setTab('propostas')} className="text-xs font-medium" style={{ color: C.blue }}>
                    Ver todas →
                  </button>
                </div>
                <div className="space-y-3">
                  {proposals.slice(0, 5).map(p => {
                    const client = clients.find(c => c.id === p.client_id)
                    return (
                      <div key={p.id} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#1e293b' }}>
                            {(client?.name || p.title).charAt(0)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold">{client?.name || '—'}</p>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: ps.STATUS_COLORS[p.status] + '20', color: ps.STATUS_COLORS[p.status] }}>
                                {ps.STATUS_LABELS[p.status]}
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: C.muted }}>{p.title} · {ps.timeAgo(p.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold" style={{ color: '#10b981' }}>{ps.fmtR(p.total)}</span>
                          <button onClick={() => setPreviewId(p.id)} className="p-1 rounded hover:bg-white/5" style={{ color: C.blue }} title="Visualizar / PDF">📄</button>
                          <button onClick={() => { setEditId(p.id); setModal('proposal') }} className="p-1 rounded hover:bg-white/5" style={{ color: C.muted }}>✎</button>
                          <button onClick={() => { if (confirm('Excluir?')) { ps.deleteProposal(p.id); reload() } }} className="p-1 rounded hover:bg-white/5" style={{ color: '#f87171' }}>🗑</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ====== PROPOSTAS LIST ====== */}
        {tab === 'propostas' && (
          <>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                ['Total', proposals.length, '📄'],
                ['Rascunho', proposals.filter(p => p.status === 'rascunho').length, '📝'],
                ['Enviadas', proposals.filter(p => p.status === 'enviada' || p.status === 'negociacao').length, '📤'],
                ['Aprovadas', proposals.filter(p => p.status === 'aprovada').length, '✅'],
              ].map(([label, count, icon]) => (
                <div key={label as string} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-2 mb-1"><span>{icon}</span><span className="text-xs" style={{ color: C.muted }}>{label}</span></div>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Proposta</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Cliente</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Status</th>
                    <th className="text-right text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Valor</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Data</th>
                    <th className="text-center text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(p => {
                    const client = clients.find(c => c.id === p.client_id)
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-sm font-semibold">{p.title}</td>
                        <td className="py-3 px-4 text-sm">{client?.name || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: ps.STATUS_COLORS[p.status] + '20', color: ps.STATUS_COLORS[p.status] }}>
                            {ps.STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-right" style={{ color: '#10b981' }}>{ps.fmtR(p.total)}</td>
                        <td className="py-3 px-4 text-sm" style={{ color: C.muted }}>{ps.fmtDate(p.created_at)}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => setPreviewId(p.id)} className="px-1 hover:text-white" style={{ color: C.blue }} title="PDF">📄</button>
                          <button onClick={() => { setEditId(p.id); setModal('proposal') }} className="px-1 hover:text-white" style={{ color: C.muted }}>✎</button>
                          <button onClick={() => { if (confirm('Excluir?')) { ps.deleteProposal(p.id); reload() } }} className="px-1" style={{ color: '#f87171' }}>×</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {proposals.length === 0 && <p className="text-center py-8 text-sm" style={{ color: C.muted }}>Nenhuma proposta</p>}
            </div>
          </>
        )}

        {/* ====== CLIENTES ====== */}
        {tab === 'clientes' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Seus clientes</h3>
              <button onClick={() => { setEditId(null); setModal('client') }}
                className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>
                + Novo Cliente
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                ['Total', clients.length, '👥'],
                ['Pessoa Jurídica', clients.filter(c => c.type === 'pj').length, '🏢'],
                ['Pessoa Física', clients.filter(c => c.type === 'pf').length, '👤'],
                ['Últimos 30 dias', clients.filter(c => Date.now() - new Date(c.created_at).getTime() < 30 * 86400000).length, '🕐'],
              ].map(([label, count, icon]) => (
                <div key={label as string} className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center gap-2 mb-1"><span>{icon}</span><span className="text-xs" style={{ color: C.muted }}>{label}</span></div>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Cliente</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Contato</th>
                    <th className="text-center text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Tipo</th>
                    <th className="text-left text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Cadastrado em</th>
                    <th className="text-center text-[10px] uppercase tracking-wider font-semibold py-3 px-4" style={{ color: C.muted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 rounded-lg flex items-center justify-center text-xs" style={{
                            background: c.type === 'pj' ? '#3b82f620' : '#f59e0b20',
                            color: c.type === 'pj' ? '#3b82f6' : '#f59e0b',
                          }}>
                            {c.type === 'pj' ? '🏢' : '👤'}
                          </span>
                          <span className="text-sm font-bold">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: C.muted }}>📞 {c.contact}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{
                          background: c.type === 'pj' ? '#3b82f6' : '#f59e0b',
                        }}>
                          {c.type === 'pj' ? 'PJ' : 'PF'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: C.muted }}>{ps.fmtDate(c.created_at)}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => { setEditId(c.id); setModal('client') }} className="px-1 hover:text-white" style={{ color: C.muted }}>✎</button>
                        <button onClick={() => { if (confirm('Excluir?')) { ps.deleteClient(c.id); reload() } }} className="px-1" style={{ color: '#f87171' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-center py-3 text-xs" style={{ color: C.muted }}>{clients.length} clientes</p>
            </div>
          </>
        )}
      </main>

      {/* Client Modal */}
      {modal === 'client' && <ClientModal editId={editId} onClose={() => setModal(null)} onSave={reload} />}
      {/* Proposal Modal */}
      {modal === 'proposal' && <ProposalModal editId={editId} onClose={() => setModal(null)} onSave={reload} />}
      {/* Proposal Preview */}
      {previewId && (() => {
        const p = ps.getProposal(previewId)
        if (!p) return null
        const c = p.client_id ? ps.getClient(p.client_id) : null
        return <ProposalPreview proposal={p} client={c} onClose={() => setPreviewId(null)} />
      })()}
    </div>
  )
}

function ClientModal({ editId, onClose, onSave }: { editId: string | null; onClose: () => void; onSave: () => void }) {
  const existing = editId ? ps.getClient(editId) : null
  const [name, setName] = useState(existing?.name || '')
  const [contact, setContact] = useState(existing?.contact || '')
  const [email, setEmail] = useState(existing?.email || '')
  const [type, setType] = useState<ps.ClientType>(existing?.type || 'pf')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (editId) ps.updateClient(editId, { name, contact, email, type })
    else ps.createClient({ name, contact, email, type })
    onSave(); onClose()
  }

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl p-6 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-lg font-bold">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do cliente" required className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
        <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Telefone / WhatsApp" className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
        <div className="flex gap-3">
          <button type="button" onClick={() => setType('pf')} className="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors" style={{ background: type === 'pf' ? '#f59e0b' : '#1e293b', color: type === 'pf' ? '#000' : '#94a3b8' }}>Pessoa Física</button>
          <button type="button" onClick={() => setType('pj')} className="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors" style={{ background: type === 'pj' ? '#3b82f6' : '#1e293b', color: type === 'pj' ? '#fff' : '#94a3b8' }}>Pessoa Jurídica</button>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm" style={{ border: `1px solid ${C.border}` }}>Cancelar</button>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>{editId ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>
    </div>
  )
}

function ProposalModal({ editId, onClose, onSave }: { editId: string | null; onClose: () => void; onSave: () => void }) {
  const existing = editId ? ps.getProposal(editId) : null
  const clients = ps.getClients()
  const [clientId, setClientId] = useState(existing?.client_id || '')
  const [title, setTitle] = useState(existing?.title || '')
  const [status, setStatus] = useState<ps.ProposalStatus>(existing?.status || 'rascunho')
  const [items, setItems] = useState<ps.ProposalItem[]>(existing?.items || [{ id: Math.random().toString(36).slice(2), description: '', quantity: 1, unit_price: 0 }])

  function addItem() {
    setItems(prev => [...prev, { id: Math.random().toString(36).slice(2), description: '', quantity: 1, unit_price: 0 }])
  }

  function updateItem(id: string, field: string, value: string | number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  function removeItem(id: string) {
    if (items.length <= 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const total = items.reduce((s, i) => s + (i.quantity * i.unit_price), 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const data = { client_id: clientId, title, description: '', items, status, total }
    if (editId) ps.updateProposal(editId, data)
    else ps.createProposal(data)
    onSave(); onClose()
  }

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 overflow-y-auto py-10" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-xl p-6 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-lg font-bold">{editId ? 'Editar Proposta' : 'Nova Proposta'}</h3>

        <div className="grid grid-cols-2 gap-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da proposta" required className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
          <select value={clientId} onChange={e => setClientId(e.target.value)} className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }}>
            <option value="">Selecionar cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <select value={status} onChange={e => setStatus(e.target.value as ps.ProposalStatus)} className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }}>
          {Object.entries(ps.STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold" style={{ color: C.muted }}>Itens da proposta</label>
            <button type="button" onClick={addItem} className="text-xs font-semibold" style={{ color: C.blue }}>+ Adicionar item</button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={item.id} className="grid gap-2" style={{ gridTemplateColumns: '1fr 80px 120px 30px' }}>
                <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder={`Item ${idx + 1}`} className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
                <input type="number" step="0.01" min="0" value={item.unit_price} onChange={e => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="R$" className={inputCls} style={{ background: '#0a0a0f', border: `1px solid ${C.border}` }} />
                <button type="button" onClick={() => removeItem(item.id)} className="text-sm rounded hover:bg-white/5" style={{ color: '#f87171' }}>×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-xs" style={{ color: C.muted }}>Total</p>
            <p className="text-2xl font-bold" style={{ color: '#10b981' }}>{ps.fmtR(total)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm" style={{ border: `1px solid ${C.border}` }}>Cancelar</button>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>{editId ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>
    </div>
  )
}
