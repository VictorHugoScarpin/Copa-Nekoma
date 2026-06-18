import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getQuizStatus } from '../lib/quiz'

// Link de presente do Spotify (3 meses Premium) — usar apenas para o vencedor
const SPOTIFY_GIFT_LINK = 'https://open.spotify.com/referral/003988681f532c39c9bf64c9183464892d50c687452732e0c12a34?si=_rT4rYZESOux_tTx_pqrZg&locale=pt'

export default function QuizProfileCard({ userId }) {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [myAttempt, setMyAttempt] = useState(null)
  const [isWinner, setIsWinner] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: cfg } = await supabase.from('quiz_config').select('*').eq('id', 1).maybeSingle()
      setConfig(cfg || null)

      const { data: attempt } = await supabase.from('quiz_attempts').select('*').eq('user_id', userId).maybeSingle()
      setMyAttempt(attempt || null)

      if (cfg?.start_date) {
        const st = getQuizStatus(cfg.start_date)
        if (st.status === 'result' || st.status === 'archived') {
          const { data: winnerId } = await supabase.rpc('get_quiz_winner')
          setIsWinner(winnerId === userId)
        }
      }
    }
    load()
  }, [userId])

  if (!config?.start_date) return null
  const st = getQuizStatus(config.start_date)

  return (
    <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isWinner ? 14 : 0 }}>
        <span style={{ fontSize: 22 }}>⚽🎵</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Quiz da Copa</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {myAttempt ? `Você fez ${myAttempt.score}/15 acertos` : st.status === 'active' ? 'Participe e concorra a 3 meses de Spotify' : 'Quiz encerrado'}
          </div>
        </div>
        {st.status === 'active' && !myAttempt && (
          <button className="btn btn-primary" onClick={() => navigate('/quiz')} style={{ padding: '8px 14px', fontSize: 12, width: 'auto' }}>
            Jogar
          </button>
        )}
      </div>

      {isWinner && (
        <div style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 'var(--r-md)', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🏆</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold-bright)', marginBottom: 4 }}>
            Parabéns, você ganhou!
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>
            Lembrando: o prêmio só vale se você nunca teve Spotify Premium antes.
          </div>
          <a
            href={SPOTIFY_GIFT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
          >
            🎁 Resgatar 3 meses de Spotify
          </a>
        </div>
      )}
    </div>
  )
}
