import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { getQuizStatus } from './quiz'

// Banner que aparece em Guesses — convite pro quiz, depois mostra o vencedor
export function QuizBanner() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [winner, setWinner] = useState(null)
  const [myAttempt, setMyAttempt] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: cfg } = await supabase.from('quiz_config').select('*').eq('id', 1).maybeSingle()
      setConfig(cfg || null)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: attempt } = await supabase.from('quiz_attempts').select('id').eq('user_id', user.id).maybeSingle()
        setMyAttempt(attempt || null)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadWinner() {
      if (!config?.start_date) return
      const st = getQuizStatus(config.start_date)
      if (st.status !== 'result' && st.status !== 'archived') return

      const { data: winnerId } = await supabase.rpc('get_quiz_winner')
      if (!winnerId) return
      const { data: profile } = await supabase.from('profiles').select('id, display_name, nick, avatar_url').eq('id', winnerId).maybeSingle()
      setWinner(profile || null)
    }
    loadWinner()
  }, [config])

  if (!config?.start_date) return null
  const st = getQuizStatus(config.start_date)

  if (st.status === 'archived') return null

  if (st.status === 'result') {
    if (!winner) return null
    return (
      <div className="glass-card" style={{ padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(232,184,75,0.3)', background: 'rgba(232,184,75,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🎉</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold-bright)' }}>
            {winner.display_name || winner.nick} ganhou o Quiz da Copa!
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Confira em Perfil
          </div>
        </div>
      </div>
    )
  }

  // status === 'active'
  return (
    <div
      className="glass-card"
      onClick={() => navigate('/quiz')}
      style={{ padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(232,184,75,0.25)', background: 'rgba(232,184,75,0.05)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
    >
      <img src="/taca.png" alt="Quiz" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
          {myAttempt ? 'Você já participou do Quiz da Copa' : 'Quiz da Copa — ganhe 3 meses de Spotify!'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {myAttempt ? `Termina em ${st.daysLeft} ${st.daysLeft === 1 ? 'dia' : 'dias'}` : `Faltam ${st.daysLeft} ${st.daysLeft === 1 ? 'dia' : 'dias'} para participar`}
        </div>
      </div>
      <span style={{ color: 'var(--gold)', fontSize: 18, flexShrink: 0 }}>›</span>
    </div>
  )
}
