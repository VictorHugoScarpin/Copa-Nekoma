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
    const fn = mode === 'login' ? signIn : signUp
    const { error: err } = await fn(nick, password)
    if (err) setError(err.message === 'Invalid login credentials' ? 'Nick ou senha incorretos.' : err.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-void)' }}>
      {/* BG accent */}
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', letterSpacing: '0.08em', color: 'var(--accent-gold)', lineHeight: 1 }}>BOLÃO</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.2em', color: 'var(--text-secondary)', marginTop: '4px' }}>COPA DO MUNDO</div>
        </div>

        <div className="glass-card" style={{ padding: '28px 24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Nick</label>
              <input className="input" value={nick} onChange={e => setNick(e.target.value)} placeholder="seu_nick" autoCapitalize="none" />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••" />
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: '13px', textAlign: 'center' }}>{error}</div>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Entrando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Novo por aqui? Criar conta →' : '← Já tenho conta'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '24px' }}>
          Bolão privado · Roberto, Ezio, Fabrício & Pedro
        </p>
      </div>
    </div>
  )
}
