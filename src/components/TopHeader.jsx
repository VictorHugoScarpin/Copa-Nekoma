import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'JOGOS', '/palpites': 'PALPITES', '/ranking': 'RANKING',
  '/grupos': 'GRUPOS', '/mata-mata': 'ELIMINATÓRIAS', '/perfil': 'PERFIL',
}

export default function TopHeader() {
  const { pathname } = useLocation()
  return (
    <header className="top-header">
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.12em', background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-gold-bright))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {TITLES[pathname] || 'BOLÃO'}
      </div>
      <img src="/copa2026.png" alt="Copa 2026" style={{ height: '38px', filter: 'drop-shadow(0 0 10px rgba(212,168,50,0.5))' }} />
    </header>
  )
}
