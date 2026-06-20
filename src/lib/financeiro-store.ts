const MONTH_PREFIX = 'financeiro_v2_'
const GOALS_KEY = 'financeiro_metas_v1'

export interface IncomeEntry {
  id: string
  description: string
  amount: number
  category: string
  date: string
  notes: string
  received: boolean
  realAmount: number | null
}

export interface ExpenseEntry {
  id: string
  description: string
  amount: number
  category: string
  date: string
  notes: string
  isFixed: boolean
  paid: boolean
}

export interface MonthData {
  income: IncomeEntry[]
  expenses: ExpenseEntry[]
}

export interface Goal {
  id: string
  name: string
  target: number
  baseline?: number
  createdAt: number
}

export interface MonthSummary {
  planned: number
  received: number
  expTotal: number
  expPaid: number
  expPending: number
  net: number
  pendingIncome: number
  pct: number
  rcvCount: number
  incCount: number
  paidCount: number
  expCount: number
}

export interface GoalAllocation {
  goal: Goal
  target: number
  baseline: number
  autoAlloc: number
  emCaixa: number
  falta: number
  pct: number
  done: boolean
}

const uid = () => Math.random().toString(36).slice(2, 11)

function storageKey(year: number, month: number) {
  return `${MONTH_PREFIX}${year}_${month}`
}

export function loadMonth(year: number, month: number): MonthData {
  if (typeof window === 'undefined') return { income: [], expenses: [] }
  const raw = localStorage.getItem(storageKey(year, month))
  if (!raw) return { income: [], expenses: [] }
  return JSON.parse(raw)
}

export function saveMonth(year: number, month: number, data: MonthData) {
  localStorage.setItem(storageKey(year, month), JSON.stringify(data))
}

function monthNet(data: MonthData): number {
  const received = data.income.filter(i => i.received).reduce((s, i) => s + (i.realAmount || i.amount), 0)
  const paid = data.expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)
  return received - paid
}

export function calcSummary(data: MonthData): MonthSummary {
  const I = data.income
  const E = data.expenses
  const planned = I.reduce((s, i) => s + i.amount, 0)
  const received = I.filter(i => i.received).reduce((s, i) => s + (i.realAmount || i.amount), 0)
  const expTotal = E.reduce((s, e) => s + e.amount, 0)
  const expPaid = E.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)
  const expPending = expTotal - expPaid
  const net = received - expPaid
  const pendingIncome = planned - received
  const pct = planned > 0 ? Math.min(100, (received / planned) * 100) : 0
  return {
    planned, received, expTotal, expPaid, expPending, net, pendingIncome, pct,
    rcvCount: I.filter(i => i.received).length, incCount: I.length,
    paidCount: E.filter(e => e.paid).length, expCount: E.length,
  }
}

export function cashStats(): { total: number; months: number; avg: number } {
  if (typeof window === 'undefined') return { total: 0, months: 0, avg: 0 }
  let total = 0, months = 0
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !new RegExp(`^${MONTH_PREFIX}\\d+_\\d+$`).test(k)) continue
    const d: MonthData = JSON.parse(localStorage.getItem(k)!)
    total += monthNet(d)
    if ((d.income && d.income.length) || (d.expenses && d.expenses.length)) months++
  }
  return { total, months, avg: months > 0 ? total / months : 0 }
}

export function computeAllocations(goals: Goal[]): { total: number; avg: number; allocations: GoalAllocation[] } {
  const stats = cashStats()
  let remaining = Math.max(0, stats.total)
  const allocations: GoalAllocation[] = goals.map(g => {
    const target = g.target || 0
    const baseline = g.baseline || 0
    const space = Math.max(0, target - baseline)
    const autoAlloc = Math.min(remaining, space)
    remaining -= autoAlloc
    const emCaixa = Math.max(0, baseline + autoAlloc)
    const falta = Math.max(0, target - emCaixa)
    const pct = target > 0 ? Math.min(100, (emCaixa / target) * 100) : 0
    return { goal: g, target, baseline, autoAlloc, emCaixa, falta, pct, done: falta <= 0 }
  })
  return { total: stats.total, avg: stats.avg, allocations }
}

export function addIncome(year: number, month: number, entry: Omit<IncomeEntry, 'id'>): IncomeEntry {
  const data = loadMonth(year, month)
  const item: IncomeEntry = { id: uid(), ...entry }
  data.income.push(item)
  saveMonth(year, month, data)
  return item
}

export function updateIncome(year: number, month: number, id: string, updates: Partial<IncomeEntry>) {
  const data = loadMonth(year, month)
  const item = data.income.find(i => i.id === id)
  if (item) Object.assign(item, updates)
  saveMonth(year, month, data)
}

export function deleteIncome(year: number, month: number, id: string) {
  const data = loadMonth(year, month)
  data.income = data.income.filter(i => i.id !== id)
  saveMonth(year, month, data)
}

export function addExpense(year: number, month: number, entry: Omit<ExpenseEntry, 'id'>): ExpenseEntry {
  const data = loadMonth(year, month)
  const item: ExpenseEntry = { id: uid(), ...entry }
  data.expenses.push(item)
  saveMonth(year, month, data)
  return item
}

export function updateExpense(year: number, month: number, id: string, updates: Partial<ExpenseEntry>) {
  const data = loadMonth(year, month)
  const item = data.expenses.find(e => e.id === id)
  if (item) Object.assign(item, updates)
  saveMonth(year, month, data)
}

export function deleteExpense(year: number, month: number, id: string) {
  const data = loadMonth(year, month)
  data.expenses = data.expenses.filter(e => e.id !== id)
  saveMonth(year, month, data)
}

export function loadGoals(): Goal[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(GOALS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveGoals(goals: Goal[]) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}

export function addGoal(name: string, target: number): Goal {
  const goals = loadGoals()
  const goal: Goal = { id: uid(), name, target, createdAt: Date.now() }
  goals.push(goal)
  saveGoals(goals)
  return goal
}

export function updateGoal(id: string, updates: Partial<Goal>) {
  const goals = loadGoals()
  const g = goals.find(g => g.id === id)
  if (g) Object.assign(g, updates)
  saveGoals(goals)
}

export function deleteGoal(id: string) {
  saveGoals(loadGoals().filter(g => g.id !== id))
}

export function fmtR(v: number): string {
  return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtDate(d: string | null): string {
  if (!d) return '—'
  const [y, m, dy] = d.split('-')
  return `${dy}/${m}/${y}`
}

export function isOverdue(d: string | null): boolean {
  if (!d) return false
  return new Date(d + 'T00:00:00') < new Date(new Date().toDateString())
}

export function seedIfEmpty(year: number, month: number) {
  const data = loadMonth(year, month)
  if (data.income.length > 0 || data.expenses.length > 0) return
  if (year !== 2026 || month !== 5) return

  data.income = [
    { id: uid(), description: 'VENOM', amount: 4000, category: 'Trabalho', date: '2026-06-25', notes: '', received: false, realAmount: null },
    { id: uid(), description: 'ZENITH', amount: 1200, category: 'Trabalho', date: '2026-06-15', notes: '', received: false, realAmount: null },
    { id: uid(), description: 'C4', amount: 2300, category: 'Imóveis', date: '2026-06-25', notes: '', received: false, realAmount: null },
    { id: uid(), description: 'ALPHA', amount: 2200, category: '', date: '2026-06-10', notes: '', received: true, realAmount: 2200 },
    { id: uid(), description: 'JOTAPÊ', amount: 3500, category: '', date: '2026-06-28', notes: '', received: false, realAmount: null },
    { id: uid(), description: 'KARL', amount: 1000, category: '', date: '2026-06-10', notes: '', received: false, realAmount: null },
    { id: uid(), description: 'PROV - EVILÂNIO', amount: 390, category: '', date: '2026-06-01', notes: '', received: true, realAmount: 390 },
    { id: uid(), description: 'SITE CJE', amount: 1200, category: '', date: '2026-06-12', notes: '', received: false, realAmount: null },
    { id: uid(), description: 'LOGO SINES BARBER', amount: 500, category: '', date: '2026-06-25', notes: '', received: false, realAmount: null },
    { id: uid(), description: 'CURE PHARMA 1', amount: 1750, category: '', date: '2026-06-17', notes: '', received: true, realAmount: 1750 },
    { id: uid(), description: 'CURE PHARMA 2', amount: 1750, category: '', date: '2026-06-30', notes: '', received: false, realAmount: null },
  ]
  data.expenses = [
    { id: uid(), description: 'Aluguel', amount: 600, category: 'Moradia', date: '2026-06-10', notes: '', isFixed: true, paid: true },
    { id: uid(), description: 'Água / Saneamento', amount: 76.36, category: 'Moradia', date: '2026-06-10', notes: 'COPASA', isFixed: true, paid: true },
    { id: uid(), description: 'CONSÓRCIO', amount: 842.49, category: '', date: '2026-06-10', notes: '', isFixed: true, paid: true },
    { id: uid(), description: 'Celular', amount: 69.64, category: 'Tecnologia', date: '2026-06-12', notes: '', isFixed: true, paid: true },
    { id: uid(), description: 'PARCELA CAIXA', amount: 397.35, category: '', date: '2026-06-12', notes: '', isFixed: true, paid: true },
    { id: uid(), description: 'Energia Elétrica', amount: 257.80, category: 'Moradia', date: '2026-06-15', notes: '', isFixed: true, paid: true },
    { id: uid(), description: 'Internet', amount: 70, category: 'Moradia', date: '2026-06-15', notes: '', isFixed: true, paid: true },
    { id: uid(), description: 'DARF', amount: 87, category: '', date: '2026-06-28', notes: '', isFixed: true, paid: true },
    { id: uid(), description: 'CARTÕES', amount: 1000, category: '', date: '2026-06-25', notes: '', isFixed: true, paid: false },
    { id: uid(), description: 'FINANCEIRO', amount: 990, category: '', date: '2026-06-29', notes: '', isFixed: true, paid: false },
    { id: uid(), description: 'TG 60MG', amount: 950, category: '', date: '', notes: '', isFixed: false, paid: true },
    { id: uid(), description: 'DOCUMENTOS MÃE', amount: 300, category: '', date: '', notes: '', isFixed: false, paid: true },
  ]
  saveMonth(year, month, data)
}

export const INCOME_CATEGORIES = ['Trabalho', 'Freelance', 'Imóveis', 'Investimentos', 'Outros']
export const EXPENSE_CATEGORIES = ['Moradia', 'Alimentação', 'Transporte', 'Tecnologia', 'Trabalho', 'Lazer', 'Saúde', 'Educação', 'Outros']
export const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
