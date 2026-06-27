import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { getQuizStatus } from './quiz'

// Banner que aparece em Guesses — convite pro quiz, depois mostra o vencedor
export function QuizBanner() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [history, setHistory] = useState([]) // [{position, display_name, nick}]
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
    async function loadHistory() {
      if (!config?.start_date) return
      const st = getQuizStatus(config.start_date)
      if (st.status !== 'result' && st.status !== 'archived') return

      // Busca o histórico de posições com os perfis
      const { data: rows } = await supabase
        .from('quiz_winner_history')
        .select('position, profiles(display_name, nick)')
        .order('position', { ascending: true })

      if (rows?.length) {
        setHistory(rows.map(r => ({
          position: r.position,
          name: r.profiles?.display_name || r.profiles?.nick || '?',
        })))
      }
    }
    loadHistory()
  }, [config])

  if (!config?.start_date) return null
  const st = getQuizStatus(config.start_date)

  if (st.status === 'archived') return null

  if (st.status === 'result') {
    if (!history.length) return null

    // Descobre quem é o vencedor atual (último da cadeia que não passou)
    // A lógica: o winner atual é o último inserido no histórico que ainda está ativo
    // i.e., o de maior position que existe
    const currentWinner = history[history.length - 1]
    const passed = history.slice(0, -1) // quem passou o prêmio

    return (
      <div className="glass-card" style={{ padding: '14px 16px', marginBottom: 16, border: '1px solid rgba(232,184,75,0.3)', background: 'rgba(232,184,75,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>🎉</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold-bright)' }}>
              {currentWinner.name} ganhou o Quiz da Copa!
            </div>
            {passed.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.5 }}>
                {passed.map((p, i) => (
                  <span key={p.position}>
                    {p.name} passou para{' '}
                    {i + 1 < passed.length ? passed[i + 1].name : currentWinner.name}
                    {i < passed.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              Confira em Perfil
            </div>
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
