import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'JOGOS',
  '/ranking': 'RANKING',
  '/grupos': 'GRUPOS',
  '/mata-mata': 'ELIMINATÓRIAS',
  '/stats': 'ESTATÍSTICAS',
  '/perfil': 'PERFIL',
}

export default function TopHeader() {
  const { pathname } = useLocation()

  return (
    <header className="top-header">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.12em', background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-gold-bright))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {TITLES[pathname] || 'BOLÃO'}
      </div>

      {/* Logo oficial Copa 2026 */}
      <img
        src="/copa2026.png"
        style={{ height: '36px', filter: 'drop-shadow(0 0 8px rgba(212,168,50,0.4))' }}
        onError={e => {
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'flex'
        }}
      />
      <div style={{ display: 'none', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '18px' }}>⚽</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>COPA 2026</span>
      </div>
    </header>
  )
}
