import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RankingPage from './pages/RankingPage'
import GroupsPage from './pages/GroupsPage'
import BracketPage from './pages/BracketPage'
import StatsPage from './pages/StatsPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'
import TopHeader from './components/TopHeader'
import './index.css'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.1em', color: 'var(--accent-gold)', animation: 'pulse 1.5s infinite' }}>
        BOLÃO ⚽
      </div>
    </div>
  )

  if (!user) return <LoginPage />

  return (
    <>
      <TopHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/grupos" element={<GroupsPage />} />
        <Route path="/mata-mata" element={<BracketPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </>
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
