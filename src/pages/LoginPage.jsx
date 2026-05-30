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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg-void)', overflow: 'hidden' }}>
      {/* BG orbs animados */}
      <div style={{ position: 'fixed', top: '-30%', left: '-20%', width: '80vw', height: '80vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)', pointerEvents: 'none', animation: 'floatA 8s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-20%', width: '70vw', height: '70vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 65%)', pointerEvents: 'none', animation: 'floatB 10s ease-in-out infinite' }} />

      <style>{`
        @keyframes floatA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(5%,8%)} }
        @keyframes floatB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-5%,-6%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ width: '100%', maxWidth: '360px', animation: 'fadeUp 0.6s ease both' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img
            src="/copa2026.png"
            alt="Copa do Mundo 2026"
            style={{ width: '120px', marginBottom: '20px', filter: 'drop-shadow(0 0 32px rgba(201,168,76,0.5)) drop-shadow(0 0 64px rgba(201,168,76,0.2))' }}
            onError={e => { e.target.style.display='none' }}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '44px', letterSpacing: '0.1em', lineHeight: 1, background: 'linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #c9a84c 60%, #ffe082 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BOLÃO
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', letterSpacing: '0.35em', color: 'var(--text-muted)', marginTop: '6px' }}>
            COPA DO MUNDO 2026
          </div>
        </div>

        <div className="glass-card" style={{ padding: '28px 24px', border: '1px solid rgba(201,168,76,0.15)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Nick</label>
              <input className="input" value={nick} onChange={e => setNick(e.target.value)} placeholder="seu_nick" autoCapitalize="none" autoCorrect="off" />
            </div>
            <div className="input-group">
              <label className="input-label">Senha</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
            </div>

            {error && (
              <div style={{ color: 'var(--red)', fontSize: '13px', textAlign: 'center', padding: '8px', background: 'var(--red-bg)', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px', padding: '13px', fontSize: '15px', letterSpacing: '0.06em' }}>
              {loading ? '...' : mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            >
              {mode === 'login' ? 'Primeira vez? Criar conta →' : '← Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
