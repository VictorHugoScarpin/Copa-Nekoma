import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'BOLÃO',
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
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.12em', color: 'var(--accent-gold)' }}>
        {TITLES[pathname] || 'BOLÃO'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '20px' }}>⚽</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>COPA 2026</span>
      </div>
    </header>
  )
}
