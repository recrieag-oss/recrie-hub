const STORAGE_KEY = 'recrie-propostas-data'

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
  client_id: string
  title: string
  description: string
  items: ProposalItem[]
  status: ProposalStatus
  total: number
  created_at: string
  updated_at: string
  viewed_at: string | null
}

export interface Activity {
  id: string
  text: string
  type: 'created' | 'viewed' | 'approved' | 'sent'
  created_at: string
}

interface PropostasData {
  clients: Client[]
  proposals: Proposal[]
  activities: Activity[]
}

const uid = () => Math.random().toString(36).slice(2, 11)

function createSeedData(): PropostasData {
  const c1 = uid(), c2 = uid()
  const p1 = uid(), p2 = uid(), p3 = uid()
  const now = new Date().toISOString()
  return {
    clients: [
      { id: c1, name: 'ZENITH PHARMA', contact: '11921825911', email: '', type: 'pj', created_at: '2026-02-26T00:00:00Z' },
      { id: c2, name: 'NANDO TIPS', contact: '11980392945', email: '', type: 'pf', created_at: '2026-01-21T00:00:00Z' },
    ],
    proposals: [
      {
        id: p1, client_id: c1, title: 'Estruturação', description: '',
        items: [
          { id: uid(), description: 'Estruturação de marca', quantity: 1, unit_price: 2600 },
        ],
        status: 'rascunho', total: 2600, created_at: '2026-02-26T00:00:00Z', updated_at: now, viewed_at: '2026-05-20T00:00:00Z',
      },
      {
        id: p2, client_id: c2, title: 'Proposta de Serviços de Design Gráfico Profissional', description: '',
        items: [
          { id: uid(), description: 'Design gráfico profissional', quantity: 1, unit_price: 401 },
        ],
        status: 'rascunho', total: 401, created_at: '2026-01-21T00:00:00Z', updated_at: now, viewed_at: null,
      },
      {
        id: p3, client_id: '', title: 'Proposta Gestão de Redes', description: '',
        items: [
          { id: uid(), description: 'Gestão de redes sociais', quantity: 1, unit_price: 2500 },
        ],
        status: 'rascunho', total: 2500, created_at: '2025-12-20T00:00:00Z', updated_at: now, viewed_at: null,
      },
    ],
    activities: [
      { id: uid(), text: 'ZENITH PHARMA visualizou "Estruturação"', type: 'viewed', created_at: '2026-05-20T00:00:00Z' },
      { id: uid(), text: 'ZENITH PHARMA proposta criada "Estruturação"', type: 'created', created_at: '2026-02-26T00:00:00Z' },
      { id: uid(), text: 'NANDO TIPS proposta criada "Proposta de Serviços de Design Gráfico Profissional"', type: 'created', created_at: '2026-01-21T00:00:00Z' },
      { id: uid(), text: 'ALPHA GOLD proposta criada "Proposta Gestão de Redes"', type: 'created', created_at: '2025-12-20T00:00:00Z' },
    ],
  }
}

function load(): PropostasData {
  if (typeof window === 'undefined') return createSeedData()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
  return JSON.parse(raw)
}

function save(data: PropostasData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Clients
export function getClients(): Client[] { return load().clients }
export function getClient(id: string): Client | null { return load().clients.find(c => c.id === id) || null }
export function createClient(c: Omit<Client, 'id' | 'created_at'>): Client {
  const data = load()
  const item: Client = { ...c, id: uid(), created_at: new Date().toISOString() }
  data.clients.push(item); save(data); return item
}
export function updateClient(id: string, updates: Partial<Client>) {
  const data = load(); const c = data.clients.find(c => c.id === id)
  if (c) Object.assign(c, updates); save(data)
}
export function deleteClient(id: string) {
  const data = load(); data.clients = data.clients.filter(c => c.id !== id); save(data)
}

// Proposals
export function getProposals(): Proposal[] { return load().proposals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) }
export function getProposal(id: string): Proposal | null { return load().proposals.find(p => p.id === id) || null }
export function createProposal(p: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'viewed_at'>): Proposal {
  const data = load(); const now = new Date().toISOString()
  const item: Proposal = { ...p, id: uid(), created_at: now, updated_at: now, viewed_at: null }
  data.proposals.push(item)
  const client = data.clients.find(c => c.id === p.client_id)
  data.activities.unshift({ id: uid(), text: `${client?.name || 'Cliente'} proposta criada "${p.title}"`, type: 'created', created_at: now })
  save(data); return item
}
export function updateProposal(id: string, updates: Partial<Proposal>) {
  const data = load(); const p = data.proposals.find(p => p.id === id)
  if (p) Object.assign(p, updates, { updated_at: new Date().toISOString() }); save(data)
}
export function deleteProposal(id: string) {
  const data = load(); data.proposals = data.proposals.filter(p => p.id !== id); save(data)
}

// Activities
export function getActivities(): Activity[] { return load().activities.slice(0, 20) }

// Stats
export function getStats() {
  const proposals = load().proposals
  const negotiation = proposals.filter(p => p.status === 'negociacao')
  const approved = proposals.filter(p => p.status === 'aprovada')
  return {
    negotiationCount: negotiation.length,
    negotiationTotal: negotiation.reduce((s, p) => s + p.total, 0),
    approvedCount: approved.length,
    approvedTotal: approved.reduce((s, p) => s + p.total, 0),
    totalProposals: proposals.length,
    totalClients: load().clients.length,
  }
}

export function fmtR(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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
