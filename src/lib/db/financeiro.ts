import { getSupabase } from '@/lib/supabase/hooks'

const sb = () => getSupabase()

export interface IncomeEntry { id: string; description: string; amount: number; category: string; date: string; notes: string; received: boolean; realAmount: number | null }
export interface ExpenseEntry { id: string; description: string; amount: number; category: string; date: string; notes: string; isFixed: boolean; paid: boolean }
export interface MonthData { income: IncomeEntry[]; expenses: ExpenseEntry[] }
export interface Goal { id: string; name: string; target: number; baseline?: number; createdAt: number }

async function userId() { return (await sb().auth.getUser()).data.user?.id }

export async function loadMonth(year: number, month: number): Promise<MonthData> {
  const uid = await userId()
  const { data } = await sb().from('fin_months').select('data').eq('user_id', uid).eq('year', year).eq('month', month).single()
  if (!data) return { income: [], expenses: [] }
  const d = data.data as MonthData
  return { income: d.income || [], expenses: d.expenses || [] }
}

export async function saveMonth(year: number, month: number, monthData: MonthData) {
  const uid = await userId()
  const { data: existing } = await sb().from('fin_months').select('id').eq('user_id', uid).eq('year', year).eq('month', month).single()
  if (existing) {
    await sb().from('fin_months').update({ data: monthData, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await sb().from('fin_months').insert({ user_id: uid, year, month, data: monthData })
  }
}

export async function loadGoals(): Promise<Goal[]> {
  const uid = await userId()
  const { data } = await sb().from('fin_goals').select('data').eq('user_id', uid).single()
  return data ? (data.data as Goal[]) : []
}

export async function saveGoals(goals: Goal[]) {
  const uid = await userId()
  const { data: existing } = await sb().from('fin_goals').select('id').eq('user_id', uid).single()
  if (existing) {
    await sb().from('fin_goals').update({ data: goals, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await sb().from('fin_goals').insert({ user_id: uid, data: goals })
  }
}

export function calcSummary(data: MonthData) {
  const I = data.income, E = data.expenses
  const planned = I.reduce((s, i) => s + i.amount, 0)
  const received = I.filter(i => i.received).reduce((s, i) => s + (i.realAmount || i.amount), 0)
  const expTotal = E.reduce((s, e) => s + e.amount, 0)
  const expPaid = E.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)
  return {
    planned, received, expTotal, expPaid,
    expPending: expTotal - expPaid,
    net: received - expPaid,
    pendingIncome: planned - received,
    pct: planned > 0 ? Math.min(100, (received / planned) * 100) : 0,
    rcvCount: I.filter(i => i.received).length, incCount: I.length,
    paidCount: E.filter(e => e.paid).length, expCount: E.length,
  }
}

export function fmtR(v: number): string { return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
export function fmtDate(d: string | null): string { if (!d) return '—'; const [y, m, dy] = d.split('-'); return `${dy}/${m}/${y}` }

export const INCOME_CATEGORIES = ['Trabalho', 'Freelance', 'Imóveis', 'Investimentos', 'Outros']
export const EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Tecnologia', 'Trabalho', 'Lazer', 'Saúde', 'Educação', 'Outros']
export const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
