'use client'

import { useRef, useState } from 'react'
import type { Proposal, Client } from '@/lib/db/propostas'
import { fmtR } from '@/lib/db/propostas'

interface ProposalPreviewProps {
  proposal: Proposal
  client: Client | null
  onClose: () => void
}

export default function ProposalPreview({ proposal, client, onClose }: ProposalPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  async function exportPDF() {
    if (!contentRef.current) return
    setGenerating(true)

    const html2pdf = (await import('html2pdf.js')).default

    const filename = `proposta-${(client?.name || proposal.title).toLowerCase().replace(/\s+/g, '-')}.pdf`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gen = html2pdf() as any
    gen.set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      } as Record<string, unknown>)
      .from(contentRef.current)
      .save()
      .then(() => setGenerating(false))
      .catch(() => setGenerating(false))
  }

  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const validUntil = new Date(Date.now() + 15 * 86400000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto py-6 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[850px]">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 sticky top-0 z-10 rounded-xl px-5 py-3"
          style={{ background: '#111827', border: '1px solid #1e293b' }}>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm" style={{ border: '1px solid #1e293b', color: '#94a3b8' }}>
              ← Voltar
            </button>
            <h3 className="text-sm font-bold">Pré-visualização da proposta</h3>
          </div>
          <button onClick={exportPDF} disabled={generating}
            className="rounded-lg px-5 py-2 text-sm font-bold text-white flex items-center gap-2 disabled:opacity-50"
            style={{ background: '#3b82f6' }}>
            {generating ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Gerando...</>
            ) : (
              <>📄 Exportar PDF</>
            )}
          </button>
        </div>

        {/* PDF Content */}
        <div ref={contentRef} style={{ background: '#ffffff', color: '#1a1a2e', fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', color: '#ffffff', padding: '48px 56px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: '#fff' }}>R</div>
                  <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '2px' }}>RECRIE</span>
                </div>
                <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '4px' }}>Agência de Conteúdo com IA</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '2px' }}>Proposta Comercial</p>
                <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{fmtR(proposal.total)}</p>
              </div>
            </div>

            <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '4px' }}>Preparado para</p>
                <p style={{ fontSize: '18px', fontWeight: 700 }}>{client?.name || '—'}</p>
                {client?.contact && <p style={{ fontSize: '13px', opacity: 0.7, marginTop: '2px' }}>📞 {client.contact}</p>}
                {client?.email && <p style={{ fontSize: '13px', opacity: 0.7 }}>✉️ {client.email}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '4px' }}>Data</p>
                <p style={{ fontSize: '14px' }}>{today}</p>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '4px', marginTop: '12px' }}>Válida até</p>
                <p style={{ fontSize: '14px' }}>{validUntil}</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ padding: '40px 56px 0' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>{proposal.title}</h2>
            {proposal.description && <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{proposal.description}</p>}
          </div>

          {/* Items table */}
          <div style={{ padding: '32px 56px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600 }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, width: '80px' }}>Qtd</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, width: '140px' }}>Valor Unit.</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', fontWeight: 600, width: '140px' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {proposal.items.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fafbfc' : '#ffffff' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#1a1a2e' }}>{item.description || `Item ${idx + 1}`}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'center', color: '#64748b' }}>{item.quantity}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'right', color: '#64748b' }}>{fmtR(item.unit_price)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', textAlign: 'right', fontWeight: 600, color: '#1a1a2e' }}>{fmtR(item.quantity * item.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '20px 32px', textAlign: 'right', minWidth: '240px' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '4px' }}>Valor Total</p>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>{fmtR(proposal.total)}</p>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div style={{ padding: '0 56px 40px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#1a1a2e', marginBottom: '12px' }}>Condições</h4>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.8' }}>
                <p>• Proposta válida por 15 dias a partir da data de emissão.</p>
                <p>• Pagamento: 50% na aprovação + 50% na entrega.</p>
                <p>• Prazo de execução a combinar após aprovação.</p>
                <p>• Eventuais alterações fora do escopo serão orçadas separadamente.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: '#f8fafc', padding: '24px 56px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>RECRIE Agência</p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Cleberson dos Santos · clebaorr@outlook.com</p>
            </div>
            <p style={{ fontSize: '10px', color: '#94a3b8' }}>Documento gerado automaticamente · {today}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
