import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, differenceInSeconds, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const LOCK_SECONDS_BEFORE = 60

// Bandeiras via flagcdn (ISO 2 letras)
const TEAM_DATA = {
  'Brasil':        { flag: 'https://flagcdn.com/w160/br.png' },
  'Brazil':        { flag: 'https://flagcdn.com/w160/br.png' },
  'Argentina':     { flag: 'https://flagcdn.com/w160/ar.png' },
  'França':        { flag: 'https://flagcdn.com/w160/fr.png' },
  'France':        { flag: 'https://flagcdn.com/w160/fr.png' },
  'Alemanha':      { flag: 'https://flagcdn.com/w160/de.png' },
  'Germany':       { flag: 'https://flagcdn.com/w160/de.png' },
  'Espanha':       { flag: 'https://flagcdn.com/w160/es.png' },
  'Spain':         { flag: 'https://flagcdn.com/w160/es.png' },
  'Portugal':      { flag: 'https://flagcdn.com/w160/pt.png' },
  'Inglaterra':    { flag: 'https://flagcdn.com/w160/gb-eng.png' },
  'England':       { flag: 'https://flagcdn.com/w160/gb-eng.png' },
  'Holanda':       { flag: 'https://flagcdn.com/w160/nl.png' },
  'Netherlands':   { flag: 'https://flagcdn.com/w160/nl.png' },
  'Suíça':         { flag: 'https://flagcdn.com/w160/ch.png' },
  'Switzerland':   { flag: 'https://flagcdn.com/w160/ch.png' },
  'Croácia':       { flag: 'https://flagcdn.com/w160/hr.png' },
  'Croatia':       { flag: 'https://flagcdn.com/w160/hr.png' },
  'Uruguai':       { flag: 'https://flagcdn.com/w160/uy.png' },
  'Uruguay':       { flag: 'https://flagcdn.com/w160/uy.png' },
  'México':        { flag: 'https://flagcdn.com/w160/mx.png' },
  'Mexico':        { flag: 'https://flagcdn.com/w160/mx.png' },
  'EUA':           { flag: 'https://flagcdn.com/w160/us.png' },
  'USA':           { flag: 'https://flagcdn.com/w160/us.png' },
  'Canadá':        { flag: 'https://flagcdn.com/w160/ca.png' },
  'Canada':        { flag: 'https://flagcdn.com/w160/ca.png' },
  'Japão':         { flag: 'https://flagcdn.com/w160/jp.png' },
  'Japan':         { flag: 'https://flagcdn.com/w160/jp.png' },
  'Marrocos':      { flag: 'https://flagcdn.com/w160/ma.png' },
  'Morocco':       { flag: 'https://flagcdn.com/w160/ma.png' },
  'Senegal':       { flag: 'https://flagcdn.com/w160/sn.png' },
  'Coreia do Sul': { flag: 'https://flagcdn.com/w160/kr.png' },
  'South Korea':   { flag: 'https://flagcdn.com/w160/kr.png' },
  'Austrália':     { flag: 'https://flagcdn.com/w160/au.png' },
  'Australia':     { flag: 'https://flagcdn.com/w160/au.png' },
  'Sérvia':        { flag: 'https://flagcdn.com/w160/rs.png' },
  'Serbia':        { flag: 'https://flagcdn.com/w160/rs.png' },
  'Bélgica':       { flag: 'https://flagcdn.com/w160/be.png' },
  'Belgium':       { flag: 'https://flagcdn.com/w160/be.png' },
  'Dinamarca':     { flag: 'https://flagcdn.com/w160/dk.png' },
  'Denmark':       { flag: 'https://flagcdn.com/w160/dk.png' },
  'Polônia':       { flag: 'https://flagcdn.com/w160/pl.png' },
  'Poland':        { flag: 'https://flagcdn.com/w160/pl.png' },
  'Colômbia':      { flag: 'https://flagcdn.com/w160/co.png' },
  'Colombia':      { flag: 'https://flagcdn.com/w160/co.png' },
  'Equador':       { flag: 'https://flagcdn.com/w160/ec.png' },
  'Ecuador':       { flag: 'https://flagcdn.com/w160/ec.png' },
  'Gana':          { flag: 'https://flagcdn.com/w160/gh.png' },
  'Ghana':         { flag: 'https://flagcdn.com/w160/gh.png' },
  'Nigéria':       { flag: 'https://flagcdn.com/w160/ng.png' },
  'Nigeria':       { flag: 'https://flagcdn.com/w160/ng.png' },
  'Camarões':      { flag: 'https://flagcdn.com/w160/cm.png' },
  'Cameroon':      { flag: 'https://flagcdn.com/w160/cm.png' },
  'Itália':        { flag: 'https://flagcdn.com/w160/it.png' },
  'Italy':         { flag: 'https://flagcdn.com/w160/it.png' },
  'Chile':         { flag: 'https://flagcdn.com/w160/cl.png' },
  'Peru':          { flag: 'https://flagcdn.com/w160/pe.png' },
  'Paraguai':      { flag: 'https://flagcdn.com/w160/py.png' },
  'Venezuela':     { flag: 'https://flagcdn.com/w160/ve.png' },
  'Bolívia':       { flag: 'https://flagcdn.com/w160/bo.png' },
  'Arábia Saudita':{ flag: 'https://flagcdn.com/w160/sa.png' },
  'Saudi Arabia':  { flag: 'https://flagcdn.com/w160/sa.png' },
  'Irã':           { flag: 'https://flagcdn.com/w160/ir.png' },
  'Iran':          { flag: 'https://flagcdn.com/w160/ir.png' },
  'Qatar':         { flag: 'https://flagcdn.com/w160/qa.png' },
  'Tunísia':       { flag: 'https://flagcdn.com/w160/tn.png' },
  'Tunisia':       { flag: 'https://flagcdn.com/w160/tn.png' },
  'Costa Rica':    { flag: 'https://flagcdn.com/w160/cr.png' },
  'País de Gales': { flag: 'https://flagcdn.com/w160/gb-wls.png' },
  'Wales':         { flag: 'https://flagcdn.com/w160/gb-wls.png' },
}

function getTeamData(name) {
  return TEAM_DATA[name] || null
}

function countdownLabel(matchTime) {
  const now = new Date()
  const diff = differenceInSeconds(matchTime, now)
  if (diff <= 0) return null
  if (diff > 3600) return format(matchTime, "dd/MM 'às' HH:mm", { locale: ptBR })
  const m = Math.floor(diff / 60), s = diff % 60
  return `${m}m ${s.toString().padStart(2,'0')}s`
}

function isLocked(matchDateStr) {
  const diff = differenceInSeconds(parseISO(matchDateStr), new Date())
  return diff <= LOCK_SECONDS_BEFORE
}

// Bandeira de fundo de um lado do card
function TeamFlagBg({ teamName, flagEmoji, side }) {
  const data = getTeamData(teamName)
  const flagUrl = data?.flag
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
      {flagUrl
        ? <img src={flagUrl} alt="" style={{ position: 'absolute', top: '50%', [side]: '-5%', transform: 'translateY(-50%)', width: '130%', height: '130%', objectFit: 'cover', opacity: 0.09, filter: 'saturate(1.8) blur(1px)' }} />
        : flagEmoji && <div style={{ position: 'absolute', top: '50%', [side]: '-10px', transform: 'translateY(-50%)', fontSize: '110px', opacity: 0.07 }}>{flagEmoji}</div>
      }
    </div>
  )
}

// Bandeira real em círculo — sem brasão de API externa
function TeamShield({ teamName, flagEmoji }) {
  const data = getTeamData(teamName)
  const flagUrl = data?.flag

  return (
    <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
      {flagUrl
        ? <img src={flagUrl} alt={teamName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{flagEmoji || '🏳️'}</div>
      }
    </div>
  )
}
function MatchCard({ match, myGuess, allGuesses, onSaveGuess }) {
  const [home, setHome] = useState(myGuess?.home_score ?? '')
  const [away, setAway] = useState(myGuess?.away_score ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const locked = isLocked(match.match_date)
  const finished = match.status === 'finished'
  const correct = finished && myGuess && myGuess.home_score === match.home_score && myGuess.away_score === match.away_score
  const wrong = finished && myGuess && !correct

  async function save() {
    if (locked || saving || home === '' || away === '') return
    setSaving(true)
    await onSaveGuess(match.id, parseInt(home), parseInt(away))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      position: 'relative',
      background: finished ? (correct ? 'rgba(34,197,94,0.06)' : wrong ? 'rgba(239,68,68,0.06)' : 'var(--bg-glass)') : 'var(--bg-glass)',
      border: `1px solid ${finished ? (correct ? 'rgba(34,197,94,0.4)' : wrong ? 'rgba(239,68,68,0.35)' : 'var(--border-glass)') : 'var(--border-glass)'}`,
      borderRadius: 'var(--radius-lg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      marginBottom: '12px',
      overflow: 'hidden',
    }}>
      {/* Bandeiras de fundo */}
      <TeamFlagBg teamName={match.home_team} flagEmoji={match.home_flag} side="left" />
      <TeamFlagBg teamName={match.away_team} flagEmoji={match.away_flag} side="right" />

      <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span className="badge badge-muted">{match.stage || 'Grupos'}{match.group_name ? ` · Grupo ${match.group_name}` : ''}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {match.status === 'live' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--red)', fontWeight: 700, letterSpacing: '0.06em' }}>
                <div className="live-dot" /> AO VIVO
              </span>
            )}
            {finished
              ? <span className={`badge ${correct ? 'badge-green' : 'badge-red'}`}>{correct ? '✓ Acerto' : '✗ Erro'}</span>
              : locked
                ? <span className="badge badge-muted">🔒 Travado</span>
                : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{countdownLabel(parseISO(match.match_date))}</span>
            }
          </div>
        </div>

        {/* Times */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Time da casa */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <TeamShield teamName={match.home_team} flagEmoji={match.home_flag} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>{match.home_team}</span>
          </div>

          {/* Centro */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {finished && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '34px', letterSpacing: '0.04em', color: 'var(--text-primary)', lineHeight: 1, textAlign: 'center' }}>
                {match.home_score} <span style={{ color: 'var(--text-muted)', fontSize: '22px' }}>×</span> {match.away_score}
              </div>
            )}
            {!finished && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {format(parseISO(match.match_date), 'HH:mm')}
              </div>
            )}
            {/* Palpite */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input className="score-input" type="number" min="0" max="20" value={home} onChange={e => setHome(e.target.value)} disabled={locked} />
              <span style={{ color: 'var(--text-muted)', fontSize: '20px', fontWeight: 300 }}>×</span>
              <input className="score-input" type="number" min="0" max="20" value={away} onChange={e => setAway(e.target.value)} disabled={locked} />
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>seu palpite</div>
          </div>

          {/* Time visitante */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <TeamShield teamName={match.away_team} flagEmoji={match.away_flag} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2 }}>{match.away_team}</span>
          </div>
        </div>

        {/* Botão salvar */}
        {!locked && !finished && (
          <button className={`btn ${saved ? 'btn-primary' : ''}`} style={{ marginTop: '14px', padding: '10px', fontSize: '13px', letterSpacing: '0.04em' }} onClick={save} disabled={saving || home === '' || away === ''}>
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Palpite'}
          </button>
        )}

        {/* Resenha */}
        {finished && allGuesses.length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-glass)', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '8px' }}>Resenha da galera</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {allGuesses.map(g => {
                const ok = g.home_score === match.home_score && g.away_score === match.away_score
                return (
                  <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 'var(--radius-sm)', background: ok ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{g.profiles?.display_name}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: ok ? 'var(--green)' : 'var(--red)', letterSpacing: '0.06em' }}>{g.home_score} × {g.away_score}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Assistir */}
        {match.status === 'live' && match.stream_url && (
          <a href={match.stream_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', padding: '9px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--red)', fontSize: '13px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
            📺 Assistir na CazéTV
          </a>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [myGuesses, setMyGuesses] = useState({})
  const [allGuesses, setAllGuesses] = useState({})
  const [loading, setLoading] = useState(true)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchData = useCallback(async () => {
    const [{ data: matchData }, { data: myData }, { data: allData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date', { ascending: true }),
      supabase.from('guesses').select('*').eq('user_id', user.id),
      supabase.from('guesses').select('*, profiles(display_name)'),
    ])
    setMatches(matchData || [])
    const myMap = {}; (myData || []).forEach(g => { myMap[g.match_id] = g })
    setMyGuesses(myMap)
    const allMap = {}; (allData || []).forEach(g => { if (!allMap[g.match_id]) allMap[g.match_id] = []; allMap[g.match_id].push(g) })
    setAllGuesses(allMap)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSaveGuess(matchId, homeScore, awayScore) {
    const existing = myGuesses[matchId]
    if (existing) await supabase.from('guesses').update({ home_score: homeScore, away_score: awayScore }).eq('id', existing.id)
    else await supabase.from('guesses').insert({ user_id: user.id, match_id: matchId, home_score: homeScore, away_score: awayScore })
    await fetchData()
  }

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
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '210px', marginBottom: '12px' }} />)
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '14px' }}>Nenhum jogo cadastrado ainda.</div>
      ) : (
        Object.entries(grouped).map(([date, dayMatches]) => (
          <div key={date}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '10px', marginTop: '20px' }}>{date}</div>
            {dayMatches.map(match => (
              <MatchCard key={match.id} match={match} myGuess={myGuesses[match.id]} allGuesses={(allGuesses[match.id] || []).filter(g => g.user_id !== user.id)} onSaveGuess={handleSaveGuess} />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
