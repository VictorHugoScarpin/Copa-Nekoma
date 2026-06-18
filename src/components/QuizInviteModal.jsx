import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getQuizStatus } from '../lib/quiz'

// Modal de convite pro quiz — aparece em todo login enquanto a pessoa
// não tiver feito o quiz e o quiz estiver ativo (dentro dos 7 dias)
export default function QuizInviteModal({ userId }) {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [daysLeft, setDaysLeft] = useState(null)

  useEffect(() => {
    async function check() {
      const { data: cfg } = await supabase.from('quiz_config').select('*').eq('id', 1).maybeSingle()
      if (!cfg?.start_date) return

      const st = getQuizStatus(cfg.start_date)
      if (st.status !== 'active') return

      const { data: attempt } = await supabase.from('quiz_attempts').select('id').eq('user_id', userId).maybeSingle()
      if (attempt) return // já fez, não mostra

      setDaysLeft(st.daysLeft)
      setShow(true)
    }
    check()
  }, [userId])

  if (!show) return null

  function handlePlay() {
    setShow(false)
    navigate('/quiz')
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
      }}
      onClick={() => setShow(false)}
    >
      <div
        className="glass-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 360, width: '100%', padding: 28, textAlign: 'center', border: '1px solid rgba(232,184,75,0.3)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
          <img src="/taca.png" alt="Copa" style={{ width: 56, height: 56, objectFit: 'contain' }} />
          <img src="/spot.png" alt="Spotify" style={{ width: 48, height: 48, objectFit: 'contain' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)', letterSpacing: '0.04em', marginBottom: 10 }}>
          QUIZ DA COPA
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 6 }}>
          Teste seus conhecimentos sobre a Copa do Mundo e concorra a <b>3 meses de Spotify Premium</b>!
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 22 }}>
          Faltam {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} para participar
        </div>

        <button className="btn btn-primary" onClick={handlePlay} style={{ width: '100%', marginBottom: 10 }}>
          Quero participar
        </button>
        <button
          className="btn"
          onClick={() => setShow(false)}
          style={{ width: '100%', background: 'transparent', color: 'var(--text-3)' }}
        >
          Depois
        </button>
      </div>
    </div>
  )
}
