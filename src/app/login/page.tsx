'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/hooks'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = getSupabase()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isSignUp) {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: email.split('@')[0] } },
      })
      if (err) setError(err.message)
      else setMessage('Conta criada! Verifique seu e-mail para confirmar.')
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) setError(err.message)
      else router.push('/')
    }

    setLoading(false)
  }

  const inputCls = "w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"

  return (
    <div className="flex min-h-full items-center justify-center px-4" style={{ background: '#07090c' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary text-white text-xl font-black mb-3">R</div>
          <h1 className="text-2xl font-bold text-white">RECRIE Hub</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="E-mail" required autoFocus
            className={inputCls} style={{ background: '#111827', border: '1px solid #1e293b', color: '#e2e8f0' }}
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Senha" required minLength={6}
            className={inputCls} style={{ background: '#111827', border: '1px solid #1e293b', color: '#e2e8f0' }}
          />

          {error && <p className="text-sm text-danger">{error}</p>}
          {message && <p className="text-sm text-success">{message}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#64748b' }}>
          {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
            className="text-primary hover:underline font-medium">
            {isSignUp ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </div>
    </div>
  )
}
