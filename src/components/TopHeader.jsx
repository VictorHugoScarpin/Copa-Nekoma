import { useLocation } from 'react-router-dom'

const TITLES = {
  '/': 'JOGOS',
  '/palpites': 'PALPITES',
  '/ranking': 'RANKING',
  '/grupos': 'GRUPOS',
  '/mata-mata': 'CHAVES',
  '/stats': 'ESTATÍSTICAS',
  '/perfil': 'PERFIL',
}

export default function TopHeader() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'BOLÃO'

  return (
    <header className="top-header">
      <div className="header-title">{title}</div>
      <img
        src="/copa2026.png"
        alt="Copa 2026"
        style={{
          height: '36px',
          filter: 'drop-shadow(0 0 8px rgba(232,184,75,0.45))',
        }}
        onError={e => { e.target.style.display = 'none' }}
      />
    </header>
  )
}
