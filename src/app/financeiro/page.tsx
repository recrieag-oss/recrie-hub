'use client'

import { useState, useCallback, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import * as fin from '@/lib/db/financeiro'

type Tab = 'painel' | 'metas'
type ModalType = 'income' | 'expense-fixed' | 'expense-extra' | 'goal' | null

const C = {
  bg: '#07090c', surface: '#0d1117', card: '#111827', border: '#1e293b',
  amber: '#f0b429', green: '#10b981', red: '#f87171', blue: '#60a5fa',
  muted: '#64748b', text: '#e2e8f0', white: '#ffffff',
}

export default function FinanceiroPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [data, setData] = useState<fin.MonthData>({ income: [], expenses: [] })
  const [summary, setSummary] = useState<ReturnType<typeof fin.calcSummary> | null>(null)
  const [goals, setGoals] = useState<fin.Goal[]>([])
  const [tab, setTab] = useState<Tab>('painel')
  const [modal, setModal] = useState<ModalType>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [ver, setVer] = useState(0)

  const reload = useCallback(async () => {
    const [d, g] = await Promise.all([fin.loadMonth(year, month), fin.loadGoals()])
    setData(d)
    setSummary(fin.calcSummary(d))
    setGoals(g)
  }, [year, month])

  useEffect(() => { reload() }, [reload, ver])
  function save() { setVer(v => v + 1) }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  async function toggleReceived(id: string) {
    const item = data.income.find(i => i.id === id)
    if (!item) return
    item.received = !item.received
    item.realAmount = item.received ? item.amount : null
    await fin.saveMonth(year, month, data)
    save()
  }
  async function togglePaid(id: string) {
    const item = data.expenses.find(e => e.id === id)
    if (!item) return
    item.paid = !item.paid
    await fin.saveMonth(year, month, data)
    save()
  }
  async function delIncome(id: string) {
    if (!confirm('Excluir?')) return
    data.income = data.income.filter(i => i.id !== id)
    await fin.saveMonth(year, month, data)
    save()
  }
  async function delExpense(id: string) {
    if (!confirm('Excluir?')) return
    data.expenses = data.expenses.filter(e => e.id !== id)
    await fin.saveMonth(year, month, data)
    save()
  }
  async function delGoal(id: string) {
    if (!confirm('Excluir meta?')) return
    const updated = goals.filter(g => g.id !== id)
    await fin.saveGoals(updated)
    save()
  }

  const s = summary
  const alloc = { total: 0, avg: 0, allocations: goals.map(g => ({ goal: g, target: g.target, baseline: g.baseline || 0, autoAlloc: 0, emCaixa: 0, falta: g.target, pct: 0, done: false })) }

  const thStyle = `text-[10px] uppercase tracking-wider font-semibold py-2 px-3 text-left`
  const tdStyle = `py-2.5 px-3 text-sm font-mono`

  return (
    <div className="min-h-full" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', 'Geist Mono', monospace" }}>
      <Navbar />

      {/* Sub-header */}
      <div style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="rounded p-2 hover:bg-white/5 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-lg font-bold min-w-[200px] text-center">
              {fin.MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth} className="rounded p-2 hover:bg-white/5 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <button onClick={() => setTab('painel')} className="px-4 py-1.5 text-xs font-semibold transition-colors" style={tab === 'painel' ? { background: C.amber, color: '#000' } : {}}>Painel</button>
            <button onClick={() => setTab('metas')} className="px-4 py-1.5 text-xs font-semibold transition-colors" style={tab === 'metas' ? { background: C.amber, color: '#000' } : {}}>Metas</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {tab === 'painel' && s && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="rounded-lg p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Receita Prevista</p>
                <p className="text-xl font-bold" style={{ color: C.amber }}>{fin.fmtR(s.planned)}</p>
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>total previsto do mês</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Receita Confirmada</p>
                <p className="text-xl font-bold" style={{ color: C.green }}>{fin.fmtR(s.received)}</p>
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>{s.rcvCount} de {s.incCount} confirmados</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Total de Gastos</p>
                <p className="text-xl font-bold" style={{ color: C.red }}>{fin.fmtR(s.expTotal)}</p>
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>{s.paidCount} de {s.expCount} pagos</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Receita Líquida</p>
                <p className="text-xl font-bold" style={{ color: s.net >= 0 ? C.green : C.red }}>{fin.fmtR(s.net)}</p>
                <p className="text-[10px] mt-1" style={{ color: C.muted }}>recebido − gastos pagos</p>
              </div>
            </div>

            {/* ======= RECEITAS ======= */}
            <section className="rounded-lg mb-8 overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: C.green }} />
                  Receitas a Receber
                </h3>
                <button onClick={() => { setEditId(null); setModal('income') }}
                  className="rounded px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ border: `1px solid ${C.border}`, color: C.text }}>
                  + Adicionar Receita
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                    <th className={thStyle} style={{ color: C.muted }}>Descrição</th>
                    <th className={thStyle} style={{ color: C.muted }}>Categoria</th>
                    <th className={thStyle} style={{ color: C.muted }}>Valor Previsto</th>
                    <th className={thStyle} style={{ color: C.muted }}>Vencimento</th>
                    <th className={thStyle} style={{ color: C.muted }}>Observações</th>
                    <th className={`${thStyle} text-center`} style={{ color: C.muted }}>Recebido</th>
                    <th className={thStyle} style={{ color: C.muted }}>Valor Real</th>
                    <th className={`${thStyle} text-center`} style={{ color: C.muted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.income.map(item => (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-white/[0.02]">
                      <td className={`${tdStyle} font-semibold`} style={{ color: C.white }}>{item.description}</td>
                      <td className={tdStyle}>
                        {item.category ? (
                          <span className="rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: '#1e293b', color: C.blue }}>{item.category}</span>
                        ) : <span style={{ color: C.muted }}>☐</span>}
                      </td>
                      <td className={`${tdStyle} font-bold`} style={{ color: C.amber }}>{fin.fmtR(item.amount)}</td>
                      <td className={tdStyle} style={{ color: C.muted }}>{fin.fmtDate(item.date)}</td>
                      <td className={tdStyle} style={{ color: C.muted }}>{item.notes || '—'}</td>
                      <td className={`${tdStyle} text-center`}>
                        <input type="checkbox" checked={item.received} onChange={() => toggleReceived(item.id)}
                          className="h-4 w-4 rounded cursor-pointer accent-emerald-500" />
                      </td>
                      <td className={tdStyle} style={{ color: item.realAmount ? C.green : C.muted }}>
                        {item.realAmount ? fin.fmtR(item.realAmount) : '—'}
                      </td>
                      <td className={`${tdStyle} text-center`}>
                        <button onClick={() => { setEditId(item.id); setModal('income') }} className="px-1 hover:text-white" style={{ color: C.muted }}>✎</button>
                        <button onClick={() => delIncome(item.id)} className="px-1 hover:text-white" style={{ color: C.red }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `1px solid ${C.border}` }}>
                    <td colSpan={4} />
                    <td className={`${tdStyle} text-right text-[10px] uppercase tracking-wider`} style={{ color: C.muted }}>Previsto</td>
                    <td className={`${tdStyle} text-[10px] uppercase tracking-wider text-center`} style={{ color: C.muted }}>Confirmado</td>
                    <td className={`${tdStyle} text-[10px] uppercase tracking-wider`} style={{ color: C.muted }}>A Receber</td>
                    <td />
                  </tr>
                  <tr>
                    <td colSpan={4} />
                    <td className={`${tdStyle} text-right font-bold`} style={{ color: C.white }}>{fin.fmtR(s.planned)}</td>
                    <td className={`${tdStyle} text-center font-bold`} style={{ color: C.green }}>{fin.fmtR(s.received)}</td>
                    <td className={`${tdStyle} font-bold`} style={{ color: C.amber }}>{fin.fmtR(s.pendingIncome)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </section>

            {/* ======= GASTOS ======= */}
            <section className="rounded-lg overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: C.red }} />
                  Gastos Mensais
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => { setEditId(null); setModal('expense-fixed') }}
                    className="rounded px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ border: `1px solid ${C.border}`, color: C.text }}>
                    + Gasto Fixo
                  </button>
                  <button onClick={() => { setEditId(null); setModal('expense-extra') }}
                    className="rounded px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ border: `1px solid ${C.border}`, color: C.text }}>
                    + Gasto Extra
                  </button>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
                    <th className={thStyle} style={{ color: C.muted }}>Descrição</th>
                    <th className={thStyle} style={{ color: C.muted }}>Categoria</th>
                    <th className={thStyle} style={{ color: C.muted }}>Tipo</th>
                    <th className={thStyle} style={{ color: C.muted }}>Valor</th>
                    <th className={thStyle} style={{ color: C.muted }}>Vencimento</th>
                    <th className={thStyle} style={{ color: C.muted }}>Observações</th>
                    <th className={`${thStyle} text-center`} style={{ color: C.muted }}>Pago</th>
                    <th className={`${thStyle} text-center`} style={{ color: C.muted }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.expenses].sort((a, b) => {
                    if (a.isFixed !== b.isFixed) return a.isFixed ? -1 : 1
                    return 0
                  }).map(item => {
                    const unpaidHighlight = !item.paid && item.amount >= 500
                    return (
                      <tr key={item.id} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-white/[0.02]">
                        <td className={`${tdStyle} font-semibold`} style={{ color: unpaidHighlight ? C.red : C.white }}>{item.description}</td>
                        <td className={tdStyle}>
                          {item.category ? (
                            <span className="rounded px-2 py-0.5 text-[10px] font-semibold" style={{ background: '#1e293b', color: C.blue }}>{item.category}</span>
                          ) : <span style={{ color: C.muted }}>☐</span>}
                        </td>
                        <td className={tdStyle}>
                          <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase" style={{
                            background: item.isFixed ? '#10b98120' : '#60a5fa20',
                            color: item.isFixed ? C.green : C.blue,
                          }}>
                            {item.isFixed ? 'Fixo' : 'Extra'}
                          </span>
                        </td>
                        <td className={`${tdStyle} font-bold`} style={{ color: unpaidHighlight ? C.red : C.amber }}>{fin.fmtR(item.amount)}</td>
                        <td className={tdStyle} style={{ color: C.muted }}>{fin.fmtDate(item.date) || '—'}</td>
                        <td className={tdStyle} style={{ color: C.muted }}>{item.notes || '—'}</td>
                        <td className={`${tdStyle} text-center`}>
                          <input type="checkbox" checked={item.paid} onChange={() => togglePaid(item.id)}
                            className="h-4 w-4 rounded cursor-pointer accent-emerald-500" />
                        </td>
                        <td className={`${tdStyle} text-center`}>
                          <button onClick={() => { setEditId(item.id); setModal(item.isFixed ? 'expense-fixed' : 'expense-extra') }} className="px-1 hover:text-white" style={{ color: C.muted }}>✎</button>
                          <button onClick={() => delExpense(item.id)} className="px-1 hover:text-white" style={{ color: C.red }}>×</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `1px solid ${C.border}` }}>
                    <td colSpan={4} />
                    <td className={`${tdStyle} text-[10px] uppercase tracking-wider`} style={{ color: C.muted }}>Total Gastos</td>
                    <td className={`${tdStyle} text-[10px] uppercase tracking-wider`} style={{ color: C.muted }}>Total Pago</td>
                    <td className={`${tdStyle} text-[10px] uppercase tracking-wider text-center`} style={{ color: C.muted }}>A Pagar</td>
                    <td />
                  </tr>
                  <tr>
                    <td colSpan={4} />
                    <td className={`${tdStyle} font-bold`} style={{ color: C.red }}>{fin.fmtR(s.expTotal)}</td>
                    <td className={`${tdStyle} font-bold`} style={{ color: C.green }}>{fin.fmtR(s.expPaid)}</td>
                    <td className={`${tdStyle} font-bold text-center`} style={{ color: C.amber }}>{fin.fmtR(s.expPending)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </section>
          </>
        )}

        {tab === 'metas' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-lg p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Total em Caixa (acumulado)</p>
                <p className="text-2xl font-bold" style={{ color: alloc.total >= 0 ? C.green : C.red }}>{fin.fmtR(alloc.total)}</p>
              </div>
              <div className="rounded-lg p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>Média Mensal</p>
                <p className="text-2xl font-bold" style={{ color: C.blue }}>{fin.fmtR(alloc.avg)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: C.amber }} /> Metas ({goals.length})
              </h3>
              <button onClick={() => { setEditId(null); setModal('goal') }}
                className="rounded px-3 py-1.5 text-[11px] font-bold uppercase" style={{ background: C.amber, color: '#000' }}>+ Meta</button>
            </div>
            <div className="space-y-3">
              {alloc.allocations.map((a, idx) => (
                <div key={a.goal.id} className="rounded-lg p-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#f0b42920', color: C.amber }}>#{idx + 1}</span>
                      <h4 className="text-sm font-bold">{a.goal.name}</h4>
                      {a.done && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#10b98120', color: C.green }}>ATINGIDA</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(a.goal.id); setModal('goal') }} className="px-2 py-1 text-xs rounded hover:bg-white/10" style={{ color: C.muted }}>Editar</button>
                      <button onClick={() => delGoal(a.goal.id)} className="px-2 py-1 text-xs rounded hover:bg-white/10" style={{ color: C.red }}>×</button>
                    </div>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: C.border }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${a.pct}%`, background: a.done ? C.green : C.amber }} />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: C.muted }}>
                    <span>Em caixa: <strong style={{ color: C.green }}>{fin.fmtR(a.emCaixa)}</strong></span>
                    <span>Falta: <strong style={{ color: C.red }}>{fin.fmtR(a.falta)}</strong></span>
                    <span>Meta: <strong style={{ color: C.amber }}>{fin.fmtR(a.target)}</strong></span>
                  </div>
                </div>
              ))}
              {goals.length === 0 && <p className="text-sm text-center py-8" style={{ color: C.muted }}>Nenhuma meta criada.</p>}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {modal === 'income' && (
        <EntryModal type="income" year={year} month={month} editId={editId} data={data} onClose={() => setModal(null)} onSave={save} />
      )}
      {(modal === 'expense-fixed' || modal === 'expense-extra') && (
        <EntryModal type="expense" isFixed={modal === 'expense-fixed'} year={year} month={month} editId={editId} data={data} onClose={() => setModal(null)} onSave={save} />
      )}
      {modal === 'goal' && (
        <GoalModal editId={editId} goals={goals} onClose={() => setModal(null)} onSave={save} />
      )}
    </div>
  )
}

function EntryModal({ type, isFixed, year, month, editId, data, onClose, onSave }: {
  type: 'income' | 'expense'; isFixed?: boolean; year: number; month: number;
  editId: string | null; data: fin.MonthData; onClose: () => void; onSave: () => void
}) {
  const existing = type === 'income'
    ? data.income.find(i => i.id === editId)
    : data.expenses.find(e => e.id === editId)

  const [description, setDescription] = useState(existing?.description || '')
  const [amount, setAmount] = useState(existing?.amount?.toString() || '')
  const [category, setCategory] = useState(existing?.category || '')
  const [date, setDate] = useState(existing?.date || '')
  const [notes, setNotes] = useState(existing?.notes || '')

  const categories = type === 'income' ? fin.INCOME_CATEGORIES : fin.EXPENSE_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !amount) return
    const uid = () => Math.random().toString(36).slice(2, 11)
    const d = await fin.loadMonth(year, month)
    if (type === 'income') {
      const entry = { id: editId || uid(), description, amount: parseFloat(amount), category, date, notes, received: false, realAmount: null }
      if (editId) { const idx = d.income.findIndex(i => i.id === editId); if (idx >= 0) Object.assign(d.income[idx], { description, amount: parseFloat(amount), category, date, notes }) }
      else d.income.push(entry)
    } else {
      const entry = { id: editId || uid(), description, amount: parseFloat(amount), category, date, notes, isFixed: isFixed ?? true, paid: false }
      if (editId) { const idx = d.expenses.findIndex(i => i.id === editId); if (idx >= 0) Object.assign(d.expenses[idx], { description, amount: parseFloat(amount), category, date, notes }) }
      else d.expenses.push(entry)
    }
    await fin.saveMonth(year, month, d)
    onSave(); onClose()
  }

  const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-black/30 border focus:outline-none focus:ring-2 focus:ring-amber-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl p-6 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-lg font-bold">
          {editId ? 'Editar' : type === 'income' ? 'Nova Receita' : isFixed ? 'Novo Gasto Fixo' : 'Novo Gasto Extra'}
        </h3>
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição" required className={inputCls} style={{ borderColor: C.border }} />
        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Valor (R$)" required className={inputCls} style={{ borderColor: C.border }} />
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls} style={{ borderColor: C.border }}>
          <option value="">Categoria</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} style={{ borderColor: C.border }} />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações" rows={2} className={`${inputCls} resize-none`} style={{ borderColor: C.border }} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm" style={{ border: `1px solid ${C.border}` }}>Cancelar</button>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-bold text-black" style={{ background: C.amber }}>{editId ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </form>
    </div>
  )
}

function GoalModal({ editId, goals, onClose, onSave }: { editId: string | null; goals: fin.Goal[]; onClose: () => void; onSave: () => void }) {
  const existing = goals.find(g => g.id === editId)
  const [name, setName] = useState(existing?.name || '')
  const [target, setTarget] = useState(existing?.target?.toString() || '')
  const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-black/30 border focus:outline-none focus:ring-2 focus:ring-amber-500"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !target) return
    const updated = [...goals]
    if (editId) {
      const g = updated.find(g => g.id === editId)
      if (g) { g.name = name; g.target = parseFloat(target) }
    } else {
      updated.push({ id: Math.random().toString(36).slice(2, 11), name, target: parseFloat(target), createdAt: Date.now() })
    }
    await fin.saveGoals(updated)
    onSave(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl p-6 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-lg font-bold">{editId ? 'Editar' : 'Nova'} Meta</h3>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da meta" required className={inputCls} style={{ borderColor: C.border }} />
        <input type="number" step="0.01" value={target} onChange={e => setTarget(e.target.value)} placeholder="Valor alvo (R$)" required className={inputCls} style={{ borderColor: C.border }} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm" style={{ border: `1px solid ${C.border}` }}>Cancelar</button>
          <button type="submit" className="rounded-lg px-4 py-2 text-sm font-bold text-black" style={{ background: C.amber }}>{editId ? 'Salvar' : 'Criar'}</button>
        </div>
      </form>
    </div>
  )
}
