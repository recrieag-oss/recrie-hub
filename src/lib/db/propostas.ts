import { getSupabase } from '@/lib/supabase/hooks'

const sb = () => getSupabase()

export type ClientType = 'pj' | 'pf'
export type ProposalStatus = 'rascunho' | 'enviada' | 'negociacao' | 'aprovada' | 'recusada'

export interface Client {
  id: string
  name: string
  contact: string
  email: string
  type: ClientType
  created_at: string
}

export interface ProposalItem {
  id: string
  description: string
  quantity: number
  unit_price: number
}

export interface Proposal {
  id: string
  client_id: string | null
  title: string
  description: string
  items: ProposalItem[]
  status: ProposalStatus
  total: number
  viewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  text: string
  type: string
  created_at: string
}

async function userId() {
  const { data } = await sb().auth.getUser()
  return data.user?.id
}

// ============ CLIENTS ============

export async function getClients(): Promise<Client[]> {
  const { data } = await sb().from('clients').select('*').order('created_at', { ascending: false })
  return data || []
}

export async function getClient(id: string): Promise<Client | null> {
  const { data } = await sb().from('clients').select('*').eq('id', id).single()
  return data
}

export async function createClient(c: { name: string; contact: string; email: string; type: ClientType }) {
  const uid = await userId()
  const { data } = await sb().from('clients').insert({ ...c, user_id: uid }).select().single()
  return data
}

export async function updateClient(id: string, updates: Partial<Client>) {
  await sb().from('clients').update(updates).eq('id', id)
}

export async function deleteClient(id: string) {
  await sb().from('clients').delete().eq('id', id)
}

// ============ PROPOSALS ============

export async function getProposals(): Promise<Proposal[]> {
  const { data } = await sb().from('proposals').select('*').order('created_at', { ascending: false })
  return (data || []).map(p => ({ ...p, items: p.items || [] }))
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const { data } = await sb().from('proposals').select('*').eq('id', id).single()
  return data ? { ...data, items: data.items || [] } : null
}

export async function createProposal(p: { client_id: string | null; title: string; description: string; items: ProposalItem[]; status: ProposalStatus; total: number }) {
  const uid = await userId()
  const { data } = await sb().from('proposals').insert({ ...p, user_id: uid }).select().single()

  const clientName = p.client_id ? (await getClient(p.client_id))?.name || 'Cliente' : 'Cliente'
  await sb().from('proposal_activities').insert({
    user_id: uid,
    text: `${clientName} proposta criada "${p.title}"`,
    type: 'created',
  })

  return data
}

export async function updateProposal(id: string, updates: Partial<Proposal>) {
  await sb().from('proposals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
}

export async function deleteProposal(id: string) {
  await sb().from('proposals').delete().eq('id', id)
}

// ============ ACTIVITIES ============

export async function getActivities(): Promise<Activity[]> {
  const { data } = await sb().from('proposal_activities').select('*').order('created_at', { ascending: false }).limit(20)
  return data || []
}

// ============ STATS ============

export async function getStats() {
  const proposals = await getProposals()
  const clients = await getClients()
  const negotiation = proposals.filter(p => p.status === 'negociacao')
  const approved = proposals.filter(p => p.status === 'aprovada')
  return {
    negotiationCount: negotiation.length,
    negotiationTotal: negotiation.reduce((s, p) => s + Number(p.total), 0),
    approvedCount: approved.length,
    approvedTotal: approved.reduce((s, p) => s + Number(p.total), 0),
    totalProposals: proposals.length,
    totalClients: clients.length,
  }
}

// ============ UTILS ============

export function fmtR(v: number): string {
  return 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `há ${days} dias`
  const months = Math.floor(days / 30)
  return `há ${months} ${months === 1 ? 'mês' : 'meses'}`
}

export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  rascunho: 'Rascunho', enviada: 'Enviada', negociacao: 'Em Negociação', aprovada: 'Aprovada', recusada: 'Recusada',
}
export const STATUS_COLORS: Record<ProposalStatus, string> = {
  rascunho: '#64748b', enviada: '#3b82f6', negociacao: '#f59e0b', aprovada: '#10b981', recusada: '#ef4444',
}
