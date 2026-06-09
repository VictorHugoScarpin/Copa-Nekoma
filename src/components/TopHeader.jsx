import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'JOGOS',
  '/palpites': 'PALPITES',
  '/ranking': 'RANKING',
  '/grupos': 'GRUPOS',
  '/mata-mata': 'CHAVES',
  '/stats': 'STATS',
  '/perfil': 'PERFIL',
}

export default function TopHeader() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'BOLÃO'

  return (
    <header className="top-header">
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px',
        letterSpacing: '0.14em',
        background: 'linear-gradient(90deg, var(--gold) 0%, var(--gold-bright) 60%, #fff8e1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
      }}>
        {title}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Pill "Copa 2026" */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: 'var(--gold-dim)',
          border: '1px solid rgba(232,184,75,0.20)',
          borderRadius: '99px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', letterSpacing: '0.08em', color: 'var(--gold-bright)' }}>
            COPA 2026
          </span>
        </div>

        <img
          src="/copa2026.png"
          alt="Copa 2026"
          style={{ height: '34px', filter: 'drop-shadow(0 0 8px rgba(232,184,75,0.45))' }}
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>
    </header>
  )
}
