import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import MatchesPage from './pages/MatchesPage'
import GuessesPage from './pages/GuessesPage'
import RankingPage from './pages/RankingPage'
import GroupsPage from './pages/GroupsPage'
import BracketPage from './pages/BracketPage'
import ProfilePage from './pages/ProfilePage'
import HallPage from './pages/HallPage'
import ChatPage from './pages/ChatPage'
import TopHeader from './components/TopHeader'
import './index.css'

const NAV_ITEMS = [
  { path: '/',         label: 'Jogos',    icon: HomeIcon },
  { path: '/palpites', label: 'Palpites', icon: BallIcon },
  { path: '/ranking',  label: 'Ranking',  icon: TrophyIcon },
  { path: '/chat',     label: 'Chat',     icon: ChatIcon },
  { path: '/hall',     label: 'Hall',     icon: HallIcon },
  { path: '/perfil',   label: 'Perfil',   icon: UserIcon },
]

function SideNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (
    <aside className="side-nav">
      {NAV_ITEMS.map(item => (
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
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button key={item.path} className={`nav-item ${pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
          <item.icon />
          <span>{item.label}</span>
        </button>
      ))}
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
          <Route path="/hall"      element={<HallPage />} />
          <Route path="/chat"      element={<ChatPage />} />
          <Route path="/perfil"    element={<ProfilePage />} />
          {/* Rotas ocultas da nav mas ainda acessíveis */}
          <Route path="/grupos"    element={<GroupsPage />} />
          <Route path="/mata-mata" element={<BracketPage />} />
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

function HomeIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function BallIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> }
function TrophyIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> }
function TableIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg> }
function ChatIcon()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> }
function HallIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> }
function UserIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
