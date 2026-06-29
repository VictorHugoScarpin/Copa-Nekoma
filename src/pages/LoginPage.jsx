import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [nick, setNick] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (nick.length < 4) return setError('Nick mínimo de 4 caracteres.')
    if (password.length < 4) return setError('Senha mínima de 4 caracteres.')
    setLoading(true)
    const { error: err } = await (mode === 'login' ? signIn : signUp)(nick, password)
    if (err) setError(err.message === 'Invalid login credentials' ? 'Nick ou senha incorretos.' : err.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--void)', overflow: 'hidden',
    }}>
      {/* Estrelas flutuantes */}
      <div style={{ position: 'fixed', top: '-30%', left: '-20%', width: '80vw', height: '80vw', pointerEvents: 'none', animation: 'bgDrift1 14s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="starGlow1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(29,185,84,0.07)" />
              <stop offset="100%" stopColor="rgba(29,185,84,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#starGlow1)" />
          <polygon points="50,18 56,38 78,38 61,50 67,70 50,58 33,70 39,50 22,38 44,38" fill="rgba(29,185,84,0.06)" />
        </svg>
      </div>
      <div style={{ position: 'fixed', bottom: '-25%', right: '-15%', width: '70vw', height: '70vw', pointerEvents: 'none', animation: 'bgDrift2 18s ease-in-out infinite' }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="starGlow2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(232,184,75,0.07)" />
              <stop offset="100%" stopColor="rgba(232,184,75,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#starGlow2)" />
          <polygon points="50,18 56,38 78,38 61,50 67,70 50,58 33,70 39,50 22,38 44,38" fill="rgba(232,184,75,0.06)" />
        </svg>
      </div>

      <div style={{ width: '100%', maxWidth: '360px', animation: 'fadeUp 0.5s ease both' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img
            src="/login.png"
            alt="Nekoma"
            style={{ height: '140px', marginBottom: '22px', filter: 'drop-shadow(0 0 28px rgba(232,184,75,0.60)) drop-shadow(0 0 56px rgba(232,184,75,0.30))' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>

        <div className="glass-card" style={{ padding: '28px 24px', border: '1px solid rgba(232,184,75,0.12)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Nick</label>
              <input className="input" value={nick} onChange={e => setNick(e.target.value)} placeholder="seu_nick" autoCapitalize="none" autoCorrect="off" />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
            </div>

            {error && (
              <div style={{ color: 'var(--red)', fontSize: '13px', textAlign: 'center', padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(240,62,62,0.2)' }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px', padding: '14px', fontSize: '15px', letterSpacing: '0.08em' }}>
              {loading ? '...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)' }}
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Primeira vez? Criar conta →' : '← Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
