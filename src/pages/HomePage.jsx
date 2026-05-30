import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, isPast, differenceInSeconds, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const LOCK_SECONDS_BEFORE = 60

function countdownLabel(matchTime) {
  const now = new Date()
  const diff = differenceInSeconds(matchTime, now)
  if (diff <= 0) return null
  if (diff > 3600) return format(matchTime, "dd/MM 'às' HH:mm", { locale: ptBR })
  const m = Math.floor(diff / 60), s = diff % 60
  return `${m}m ${s.toString().padStart(2,'0')}s`
}

function isLocked(matchDateStr) {
  const matchTime = parseISO(matchDateStr)
  const diff = differenceInSeconds(matchTime, new Date())
  return diff <= LOCK_SECONDS_BEFORE
}

function MatchCard({ match, myGuess, allGuesses, onSaveGuess }) {
  const [home, setHome] = useState(myGuess?.home_score ?? '')
  const [away, setAway] = useState(myGuess?.away_score ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const locked = isLocked(match.match_date)
  const finished = match.status === 'finished'

  const correct = finished && myGuess &&
    myGuess.home_score === match.home_score &&
    myGuess.away_score === match.away_score

  const wrong = finished && myGuess && !correct

  async function save() {
    if (locked || saving) return
    if (home === '' || away === '') return
    setSaving(true)
    await onSaveGuess(match.id, parseInt(home), parseInt(away))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const cardClass = `glass-card ${finished ? (correct ? 'result-correct' : wrong ? 'result-wrong' : '') : ''}`

  return (
    <div className={cardClass} style={{ padding: '16px', marginBottom: '12px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="badge badge-muted">{match.stage || 'Grupos'}</span>
          {match.status === 'live' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--red)', fontWeight: 600 }}>
              <div className="live-dot" /> AO VIVO
            </span>
          )}
        </div>
        {finished ? (
          <span className={`badge ${correct ? 'badge-green' : 'badge-red'}`}>
            {correct ? '✓ Acerto' : '✗ Erro'}
          </span>
        ) : locked ? (
          <span className="badge badge-muted">🔒 Travado</span>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {countdownLabel(parseISO(match.match_date))}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <TeamSide flag={match.home_flag} name={match.home_team} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {finished && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
              {match.home_score} – {match.away_score}
            </div>
          )}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              className="score-input"
              type="number" min="0" max="20"
              value={home}
              onChange={e => setHome(e.target.value)}
              disabled={locked}
            />
            <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>×</span>
            <input
              className="score-input"
              type="number" min="0" max="20"
              value={away}
              onChange={e => setAway(e.target.value)}
              disabled={locked}
            />
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            seu palpite
          </div>
        </div>

        <TeamSide flag={match.away_flag} name={match.away_team} reverse />
      </div>

      {/* Save button */}
      {!locked && !finished && (
        <button
          className={`btn ${saved ? 'btn-primary' : ''}`}
          style={{ marginTop: '14px', padding: '9px', fontSize: '13px' }}
          onClick={save}
          disabled={saving || home === '' || away === ''}
        >
          {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Palpite'}
        </button>
      )}

      {/* Others' guesses after finish */}
      {finished && allGuesses.length > 0 && (
        <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Resenha</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {allGuesses.map(g => {
              const isRight = g.home_score === match.home_score && g.away_score === match.away_score
              return (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 'var(--radius-sm)', background: isRight ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{g.profiles?.display_name}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: isRight ? 'var(--green)' : 'var(--red)', letterSpacing: '0.06em' }}>
                    {g.home_score} – {g.away_score}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Watch live button */}
      {match.status === 'live' && match.stream_url && (
        <a href={match.stream_url} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '14px', padding: '9px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
          📺 Assistir na CazéTV
        </a>
      )}
    </div>
  )
}

function TeamSide({ flag, name, reverse }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: reverse ? 'flex-end' : 'flex-start', gap: '4px', flex: 1 }}>
      <span style={{ fontSize: '32px', lineHeight: 1 }}>{flag || '🏳️'}</span>
      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: reverse ? 'right' : 'left', maxWidth: '80px' }}>{name}</span>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [myGuesses, setMyGuesses] = useState({})
  const [allGuesses, setAllGuesses] = useState({})
  const [loading, setLoading] = useState(true)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = useCallback(async () => {
    const { data: matchData } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true })

    const { data: myData } = await supabase
      .from('guesses')
      .select('*')
      .eq('user_id', user.id)

    const { data: allData } = await supabase
      .from('guesses')
      .select('*, profiles(display_name, avatar_url)')

    setMatches(matchData || [])

    const myMap = {}
    ;(myData || []).forEach(g => { myMap[g.match_id] = g })
    setMyGuesses(myMap)

    const allMap = {}
    ;(allData || []).forEach(g => {
      if (!allMap[g.match_id]) allMap[g.match_id] = []
      allMap[g.match_id].push(g)
    })
    setAllGuesses(allMap)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSaveGuess(matchId, homeScore, awayScore) {
    const existing = myGuesses[matchId]
    if (existing) {
      await supabase.from('guesses').update({ home_score: homeScore, away_score: awayScore }).eq('id', existing.id)
    } else {
      await supabase.from('guesses').insert({ user_id: user.id, match_id: matchId, home_score: homeScore, away_score: awayScore })
    }
    await fetchData()
  }

  // Group by date
  const grouped = {}
  matches.forEach(m => {
    const d = format(parseISO(m.match_date), "EEEE, dd 'de' MMMM", { locale: ptBR })
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(m)
  })

  return (
    <div className="page">
      <div className="section-title">Jogos</div>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '160px', marginBottom: '12px' }} />
        ))
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '14px' }}>
          Nenhum jogo cadastrado ainda.
        </div>
      ) : (
        Object.entries(grouped).map(([date, dayMatches]) => (
          <div key={date}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'capitalize', letterSpacing: '0.06em', marginBottom: '10px', marginTop: '20px' }}>
              {date}
            </div>
            {dayMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                myGuess={myGuesses[match.id]}
                allGuesses={(allGuesses[match.id] || []).filter(g => g.user_id !== user.id)}
                onSaveGuess={handleSaveGuess}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
