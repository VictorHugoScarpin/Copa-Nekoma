import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import MatchesPage from './pages/MatchesPage'
import GuessesPage from './pages/GuessesPage'
import RankingPage from './pages/RankingPage'
import GroupsPage from './pages/GroupsPage'
import BracketPage from './pages/BracketPage'
import ProfilePage from './pages/ProfilePage'
import FantasyPage from './pages/FantasyPage'
import TopHeader from './components/TopHeader'
import './index.css'

const NAV_ITEMS = [
  { path: '/',         label: 'Jogos',    icon: HomeIcon },
  { path: '/palpites', label: 'Palpites', icon: BallIcon },
  { path: '/ranking',  label: 'Ranking',  icon: TrophyIcon },
  { path: '/fantasy',  label: 'Escale',   icon: FantasyIcon },
  { path: '/perfil',   label: 'Perfil',   icon: UserIcon },
]

const SIDE_NAV_ITEMS = [
  { path: '/',         label: 'Jogos',    icon: HomeIcon },
  { path: '/palpites', label: 'Palpites', icon: BallIcon },
  { path: '/ranking',  label: 'Ranking',  icon: TrophyIcon },
  { path: '/grupos',   label: 'Grupos',   icon: TableIcon },
  { path: '/mata-mata',label: 'Chaves',   icon: BracketIcon },
  { path: '/fantasy',  label: 'Escale',   icon: FantasyIcon },
  { path: '/perfil',   label: 'Perfil',   icon: UserIcon },
]

function SideNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <aside className="side-nav">
      {SIDE_NAV_ITEMS.map(item => (
        <button key={item.path} className={`side-nav-item ${pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
          <item.icon />
          {item.label}
        </button>
      ))}
    </aside>
  )
}

function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [classOpen, setClassOpen] = useState(false)
  const ref = useRef()

  // Fechar ao clicar fora
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setClassOpen(false)
    }
    document.addEventListener('touchstart', handle)
    document.addEventListener('mousedown', handle)
    return () => {
      document.removeEventListener('touchstart', handle)
      document.removeEventListener('mousedown', handle)
    }
  }, [])

  const isClassActive = pathname === '/grupos' || pathname === '/mata-mata'

  return (
    <nav className="bottom-nav" style={{ position: 'relative' }}>

      {/* Sub-botões flutuantes de Classificação */}
      {classOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 10,
          zIndex: 200,
          animation: 'fadeUp 0.2s ease both',
        }}>
          {/* Linha conectora vertical */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', width: 1, height: '100%', background: 'rgba(255,255,255,0.1)', zIndex: -1 }} />

          {[
            { path: '/grupos',   label: 'Grupos', icon: TableIcon },
            { path: '/mata-mata',label: 'Chaves', icon: BracketIcon },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setClassOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px',
                borderRadius: 99,
                border: `1px solid ${pathname === item.path ? 'rgba(245,197,24,0.35)' : 'var(--border-strong)'}`,
                background: pathname === item.path ? 'var(--gold-dim)' : 'rgba(13,21,38,0.97)',
                color: pathname === item.path ? 'var(--gold-bright)' : 'var(--text-2)',
                fontFamily: 'var(--font-body)',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                letterSpacing: '0.03em',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon />
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Jogoss */}
      <button className={`nav-item ${pathname === '/' ? 'active' : ''}`} onClick={() => { navigate('/'); setClassOpen(false) }}>
        <HomeIcon /><span>Jogos</span>
      </button>

      {/* Palpites */}
      <button className={`nav-item ${pathname === '/palpites' ? 'active' : ''}`} onClick={() => { navigate('/palpites'); setClassOpen(false) }}>
        <BallIcon /><span>Palpites</span>
      </button>

      {/* Ranking */}
      <button className={`nav-item ${pathname === '/ranking' ? 'active' : ''}`} onClick={() => { navigate('/ranking'); setClassOpen(false) }}>
        <TrophyIcon /><span>Ranking</span>
      </button>

      {/* Classificação — abre sub-menu */}
      <div ref={ref} style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <button
          className={`nav-item ${isClassActive ? 'active' : ''}`}
          style={{ width: '100%' }}
          onClick={() => setClassOpen(o => !o)}
        >
          <ClassIcon open={classOpen} active={isClassActive} />
          <span>{isClassActive ? (pathname === '/grupos' ? 'Grupos' : 'Chaves') : 'Classif.'}</span>
        </button>
      </div>

      {/* Escale */}
      <button className={`nav-item ${pathname === '/fantasy' ? 'active' : ''}`} onClick={() => { navigate('/fantasy'); setClassOpen(false) }}>
        <FantasyIcon /><span>Escale</span>
      </button>

      {/* Perfil */}
      <button className={`nav-item ${pathname === '/perfil' ? 'active' : ''}`} onClick={() => { navigate('/perfil'); setClassOpen(false) }}>
        <UserIcon /><span>Perfil</span>
      </button>

    </nav>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.1em', color: 'var(--gold)', animation: 'pulse 1.5s infinite' }}>BOLÃO ⚽</div>
    </div>
  )
  if (!user) return <LoginPage />
  return (
    <div className="app-shell">
      <TopHeader />
      <SideNav />
      <main style={{ overflowY: 'auto' }}>
        <Routes>
          <Route path="/"          element={<MatchesPage />} />
          <Route path="/palpites"  element={<GuessesPage />} />
          <Route path="/ranking"   element={<RankingPage />} />
          <Route path="/grupos"    element={<GroupsPage />} />
          <Route path="/mata-mata" element={<BracketPage />} />
          <Route path="/fantasy"   element={<FantasyPage />} />
          <Route path="/perfil"    element={<ProfilePage />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

// ── Ícones ──────────────────────────────────────────────────────────────────
function HomeIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function BallIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> }
function TrophyIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> }
function TableIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg> }
function BracketIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h4v4H3zM3 14h4v4H3zM17 10h4v4h-4zM7 8h6M7 16h6M13 8v8"/></svg> }
function FantasyIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> }
function UserIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function ClassIcon({ open, active }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: active ? 'var(--gold)' : undefined }}>
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  )
}
