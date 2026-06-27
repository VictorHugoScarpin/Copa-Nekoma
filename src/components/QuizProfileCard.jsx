import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getQuizStatus } from '../lib/quiz'

const SPOTIFY_GIFT_LINK = 'https://open.spotify.com/referral/003988681f532c39c9bf64c9183464892d50c687452732e0c12a34?si=_rT4rYZESOux_tTx_pqrZg&locale=pt'

export default function QuizProfileCard({ userId }) {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [myAttempt, setMyAttempt] = useState(null)
  const [isWinner, setIsWinner] = useState(false)
  const [myPosition, setMyPosition] = useState(null)
  const [passing, setPassing] = useState(false)
  const [passed, setPassed] = useState(false)
  const [nextName, setNextName] = useState(null)

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

          // Pega minha posição no histórico
          const { data: myRow } = await supabase
            .from('quiz_winner_history')
            .select('position')
            .eq('user_id', userId)
            .maybeSingle()
          setMyPosition(myRow?.position || null)

          // Pega o próximo da fila (minha posição + 1)
          if (myRow?.position) {
            const { data: nextRow } = await supabase
              .from('quiz_winner_history')
              .select('position, profiles(display_name, nick)')
              .eq('position', myRow.position + 1)
              .maybeSingle()
            if (nextRow) {
              setNextName(nextRow.profiles?.display_name || nextRow.profiles?.nick || '?')
            }
          }
        }
      }
    }
    load()
  }, [userId])

  async function passToNext() {
    if (!nextName) return
    if (!confirm(`Tem certeza? O prêmio vai para ${nextName} e não dá pra desfazer.`)) return
    setPassing(true)

    const { data: nextRow } = await supabase
      .from('quiz_winner_history')
      .select('user_id')
      .eq('position', myPosition + 1)
      .maybeSingle()

    if (nextRow?.user_id) {
      await supabase.from('quiz_config').update({ winner_id: nextRow.user_id }).eq('id', 1)
      setIsWinner(false)
      setPassed(true)
    }
    setPassing(false)
  }

  if (!config?.start_date) return null
  const st = getQuizStatus(config.start_date)

  return (
    <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isWinner || passed ? 14 : 0 }}>
        <img src="/taca.png" alt="Quiz" style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }} />
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

      {passed && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r-md)', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>✓ Prêmio passado para {nextName}.</div>
        </div>
      )}

      {isWinner && (
        <div style={{ background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 'var(--r-md)', padding: '14px', textAlign: 'center' }}>
          <img src="/taca.png" alt="Vencedor" style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 6 }} />
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
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 10 }}
          >
            <img src="/spot.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            Resgatar 3 meses de Spotify
          </a>
          {nextName && (
            <button
              onClick={passToNext}
              disabled={passing}
              style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 11, color: 'var(--text-3)', cursor: 'pointer', textDecoration: 'underline', padding: '4px 0' }}
            >
              {passing ? 'Passando...' : `Já tenho Premium — passar para ${nextName}`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
