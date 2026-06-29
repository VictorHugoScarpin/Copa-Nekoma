import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, differenceInSeconds, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { QuizBanner } from '../lib/quizBanner'

const LOCK_SECS = 60

// ── Mapas ────────────────────────────────────────────────────────────────────

const TEAM_ISO = {
  'Brazil': 'br', 'Argentina': 'ar', 'France': 'fr', 'Germany': 'de',
  'Spain': 'es', 'England': 'gb-eng', 'Portugal': 'pt', 'Netherlands': 'nl',
  'Italy': 'it', 'Uruguay': 'uy', 'Colombia': 'co', 'Mexico': 'mx',
  'United States': 'us', 'USA': 'us', 'Canada': 'ca', 'Japan': 'jp',
  'South Korea': 'kr', 'Korea Republic': 'kr', 'Morocco': 'ma',
  'Senegal': 'sn', 'Ghana': 'gh', 'Nigeria': 'ng', 'Australia': 'au',
  'Saudi Arabia': 'sa', 'Iran': 'ir', 'IR Iran': 'ir', 'Qatar': 'qa',
  'Croatia': 'hr', 'Serbia': 'rs', 'Switzerland': 'ch', 'Belgium': 'be',
  'Denmark': 'dk', 'Poland': 'pl', 'Cameroon': 'cm', 'Ecuador': 'ec',
  'Tunisia': 'tn', 'Costa Rica': 'cr', 'Wales': 'gb-wls',
  'Chile': 'cl', 'Peru': 'pe', 'Paraguay': 'py', 'Venezuela': 've',
  'Bolivia': 'bo', 'Austria': 'at', 'Turkey': 'tr', 'Ukraine': 'ua',
  'Honduras': 'hn', 'Panama': 'pa', 'Jamaica': 'jm',
  'Slovakia': 'sk', 'Romania': 'ro', 'Hungary': 'hu',
  'Czechia': 'cz', 'Czech Republic': 'cz', 'Slovenia': 'si',
  'Algeria': 'dz', 'Egypt': 'eg', 'New Zealand': 'nz',
  "Côte d'Ivoire": 'ci', 'Ivory Coast': 'ci',
  'Guatemala': 'gt', 'El Salvador': 'sv', 'South Africa': 'za',
  'Bosnia and Herzegovina': 'ba', 'Bosnia & Herzegovina': 'ba',
  'Bosnia Herzegovina': 'ba', 'Bosna i Hercegovina': 'ba', 'Bosnia-Herzegovina': 'ba',
  'Haiti': 'ht', 'Curaçao': 'cw', 'Curacao': 'cw',
  'Cape Verde': 'cv', 'Cape Verde Islands': 'cv',
  'Congo DR': 'cd', 'DR Congo': 'cd',
  'Scotland': 'gb-sct', 'Northern Ireland': 'gb-nir', 'Ireland': 'ie',
  'Greece': 'gr', 'Norway': 'no', 'Sweden': 'se', 'Finland': 'fi',
  'Albania': 'al', 'North Macedonia': 'mk', 'Montenegro': 'me',
  'Georgia': 'ge', 'Kosovo': 'xk',
  'Trinidad and Tobago': 'tt', 'Cuba': 'cu', 'Nicaragua': 'ni',
  'Suriname': 'sr', 'Guyana': 'gy',
  'Kenya': 'ke', 'Tanzania': 'tz', 'Uganda': 'ug', 'Mali': 'ml',
  'Mozambique': 'mz', 'Angola': 'ao', 'Zambia': 'zm', 'Zimbabwe': 'zw',
  'Togo': 'tg', 'Benin': 'bj', 'Guinea': 'gn', 'Burkina Faso': 'bf',
  'Ethiopia': 'et', 'Namibia': 'na', 'Mauritania': 'mr',
  'Thailand': 'th', 'Vietnam': 'vn', 'Indonesia': 'id',
  'Philippines': 'ph', 'Malaysia': 'my', 'China': 'cn',
  'India': 'in', 'Uzbekistan': 'uz', 'Kazakhstan': 'kz',
  'Iraq': 'iq', 'Jordan': 'jo', 'United Arab Emirates': 'ae', 'UAE': 'ae',
  'Oman': 'om', 'Kuwait': 'kw', 'Bahrain': 'bh',
}

const TEAM_PT = {
  'Brazil': 'Brasil', 'Argentina': 'Argentina', 'France': 'França',
  'Germany': 'Alemanha', 'Spain': 'Espanha', 'England': 'Inglaterra',
  'Portugal': 'Portugal', 'Netherlands': 'Holanda', 'Italy': 'Itália',
  'Uruguay': 'Uruguai', 'Colombia': 'Colômbia', 'Mexico': 'México',
  'United States': 'EUA', 'USA': 'EUA', 'Canada': 'Canadá',
  'Japan': 'Japão', 'South Korea': 'Coreia do Sul', 'Korea Republic': 'Coreia do Sul',
  'Morocco': 'Marrocos', 'Senegal': 'Senegal', 'Ghana': 'Gana',
  'Nigeria': 'Nigéria', 'Australia': 'Austrália', 'Saudi Arabia': 'Arábia Saudita',
  'Iran': 'Irã', 'IR Iran': 'Irã', 'Qatar': 'Catar', 'Croatia': 'Croácia',
  'Serbia': 'Sérvia', 'Switzerland': 'Suíça', 'Belgium': 'Bélgica',
  'Denmark': 'Dinamarca', 'Poland': 'Polônia', 'Cameroon': 'Camarões',
  'Ecuador': 'Equador', 'Tunisia': 'Tunísia', 'Costa Rica': 'Costa Rica',
  'Wales': 'País de Gales', 'Chile': 'Chile', 'Peru': 'Peru',
  'Paraguay': 'Paraguai', 'Venezuela': 'Venezuela', 'Bolivia': 'Bolívia',
  'Austria': 'Áustria', 'Turkey': 'Turquia', 'Ukraine': 'Ucrânia',
  'Honduras': 'Honduras', 'Panama': 'Panamá', 'Jamaica': 'Jamaica',
  'Slovakia': 'Eslováquia', 'Romania': 'Romênia', 'Hungary': 'Hungria',
  'Czechia': 'Rep. Tcheca', 'Czech Republic': 'Rep. Tcheca',
  'Slovenia': 'Eslovênia', 'Algeria': 'Argélia', 'Egypt': 'Egito',
  'New Zealand': 'Nova Zelândia', "Côte d'Ivoire": 'Costa do Marfim',
  'Ivory Coast': 'Costa do Marfim', 'Guatemala': 'Guatemala',
  'El Salvador': 'El Salvador', 'South Africa': 'África do Sul',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia & Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia-Herzegovina': 'Bósnia e Herzegovina',
  'Bosnia Herzegovina': 'Bósnia e Herzegovina',
  'Bosna i Hercegovina': 'Bósnia e Herzegovina',
  'Haiti': 'Haiti', 'Curaçao': 'Curaçao', 'Curacao': 'Curaçao',
  'Cape Verde': 'Cabo Verde', 'Cape Verde Islands': 'Cabo Verde',
  'Congo DR': 'Congo RD', 'DR Congo': 'Congo RD',
  'Scotland': 'Escócia', 'Northern Ireland': 'Irlanda do Norte', 'Ireland': 'Irlanda',
  'Greece': 'Grécia', 'Norway': 'Noruega', 'Sweden': 'Suécia',
  'Finland': 'Finlândia', 'Albania': 'Albânia',
  'North Macedonia': 'Macedônia do Norte', 'Montenegro': 'Montenegro',
  'Georgia': 'Geórgia', 'Kosovo': 'Kosovo',
  'Trinidad and Tobago': 'Trinidad e Tobago', 'Cuba': 'Cuba',
  'United Arab Emirates': 'Emirados Árabes', 'UAE': 'Emirados Árabes',
  'Uzbekistan': 'Uzbequistão', 'Jordan': 'Jordânia', 'Iraq': 'Iraque',
}

const FLAG_LOCAL = {
  'Argentina': '/ar.png',
  'Bosnia and Herzegovina': '/ba.png',
  'Bosnia & Herzegovina': '/ba.png',
  'Bosnia Herzegovina': '/ba.png',
  'Bosna i Hercegovina': '/ba.png',
  'Bosnia-Herzegovina': '/ba.png',
  'Jordan': '/jor.png',
  'Korea Republic': '/cor.png',
  'South Korea': '/cor.png',
  'Uzbekistan': '/uz.png',
}

function getFlagUrl(name) {
  if (FLAG_LOCAL[name]) return FLAG_LOCAL[name]
  const iso = TEAM_ISO[name]
  return iso ? `https://flagcdn.com/w160/${iso}.png` : null
}

function getPT(name) {
  return TEAM_PT[name] || name
}

// ── Componentes visuais base ─────────────────────────────────────────────────

function TeamCircle({ name, size = 46 }) {
  const flagUrl = getFlagUrl(name)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.18)', background: 'var(--surface)' }}>
      {flagUrl
        ? <img src={flagUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42 }}>🏳️</div>
      }
    </div>
  )
}

function CardBg({ name, side }) {
  const flagUrl = getFlagUrl(name)
  if (!flagUrl) return null
  const gradientDir = side === 'left' ? 'to right' : 'to left'
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
      <img src={flagUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, filter: 'saturate(1.4)' }} onError={e => { e.target.style.display = 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${gradientDir}, transparent 20%, rgba(6,11,20,0.85) 100%)` }} />
    </div>
  )
}

function Avatar({ profile, size = 36 }) {
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-strong)' }} />
  }
  const name = profile?.display_name || profile?.nick || '?'
  const initials = name.slice(0, 2).toUpperCase()
  const colors = ['#e8b84b', '#1db954', '#4d8ef0', '#f03e3e', '#a855f7']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}1a`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
      {initials}
    </div>
  )
}

// ── Utilitários ───────────────────────────────────────────────────────────────

const MATCH_DURATION_MS = 130 * 60 * 1000
const KNOCKOUT_START = new Date('2026-06-28T00:00:00')

function isLocked(dateStr) { return differenceInSeconds(parseISO(dateStr), new Date()) <= LOCK_SECS }
function isMatchLive(match) {
  if (match.status === 'finished') return false
  const start = parseISO(match.match_date).getTime()
  const now = Date.now()
  return now >= start && now <= start + MATCH_DURATION_MS
}
function isKnockout(match) { return parseISO(match.match_date) >= KNOCKOUT_START }
function countdown(dateStr) {
  const diff = differenceInSeconds(parseISO(dateStr), new Date())
  if (diff <= 0) return null
  if (diff > 3600) return format(parseISO(dateStr), 'HH:mm', { locale: ptBR })
  const m = Math.floor(diff / 60), s = diff % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

// ── ResenhaList ───────────────────────────────────────────────────────────────

function getGuessResult(g, matchHomeScore, matchAwayScore) {
  if (matchHomeScore == null || matchAwayScore == null) return 'pending'
  if (g.home_score === matchHomeScore && g.away_score === matchAwayScore) return 'exact'
  const realWinner = matchHomeScore > matchAwayScore ? 'home' : matchAwayScore > matchHomeScore ? 'away' : 'draw'
  const guessWinner = g.home_score > g.away_score ? 'home' : g.away_score > g.home_score ? 'away' : 'draw'
  if (realWinner === guessWinner) return 'partial'
  return 'wrong'
}

function ResenhaList({ matchId, matchHomeScore, matchAwayScore }) {
  const [guesses, setGuesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('guesses').select('*, profiles(display_name)').eq('match_id', matchId)
      .then(({ data }) => { setGuesses(data || []); setLoading(false) })
  }, [matchId])

  if (loading) return <div className="skeleton" style={{ height: 32, borderRadius: 6 }} />
  if (guesses.length === 0) return <div style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', padding: '6px 0' }}>Nenhum palpite registrado.</div>

  const BG = { exact: 'var(--green-dim)', partial: 'rgba(232,184,75,0.1)', wrong: 'var(--red-dim)', pending: 'rgba(255,255,255,0.04)' }
  const COLOR = { exact: 'var(--green)', partial: 'var(--gold)', wrong: 'var(--red)', pending: 'var(--text-3)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {guesses.map(g => {
        const result = getGuessResult(g, matchHomeScore, matchAwayScore)
        return (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: BG[result] }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{g.profiles?.display_name}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: COLOR[result], letterSpacing: '0.06em' }}>{g.home_score} × {g.away_score}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── GuessCard ─────────────────────────────────────────────────────────────────

function GuessCard({ match, myGuess, onSave }) {
  const finished = match.status === 'finished'
  const live = isMatchLive(match)
  const knockout = isKnockout(match)

  const [expanded, setExpanded] = useState(finished)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [home, setHome] = useState(myGuess?.home_score ?? '')
  const [away, setAway] = useState(myGuess?.away_score ?? '')
  const [qualifier, setQualifier] = useState(myGuess?.qualifier_guess ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const locked = isLocked(match.match_date)
  const correct = finished && myGuess && myGuess.home_score === match.home_score && myGuess.away_score === match.away_score
  const partialCorrect = finished && myGuess && !correct && (() => {
    if (match.home_score == null || match.away_score == null) return false
    const realWinner = match.home_score > match.away_score ? 'home' : match.away_score > match.home_score ? 'away' : 'draw'
    const guessWinner = myGuess.home_score > myGuess.away_score ? 'home' : myGuess.away_score > myGuess.home_score ? 'away' : 'draw'
    return realWinner === guessWinner
  })()
  const wrong = finished && myGuess && !correct && !partialCorrect

  const qualifierResult = match.qualifier_result
  const qualifierGuess = myGuess?.qualifier_guess
  const qualifierCorrect = knockout && finished && qualifierResult && qualifierGuess && qualifierGuess === qualifierResult

  let totalPts = null
  if (finished && myGuess) {
    let pts = correct ? 3 : partialCorrect ? 1 : 0
    if (knockout && qualifierCorrect) pts += 2
    totalPts = pts
  }

  const cd = countdown(match.match_date)

  async function save() {
    if (locked || saving || home === '' || away === '') return
    setSaving(true)
    await onSave(match.id, parseInt(home), parseInt(away), myGuess, knockout ? qualifier : null)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Azul = qualquer acerto com qualifier | Verde = exato sem qual | Amarelo = parcial sem qual | Vermelho = errou tudo
  const hasBlue = finished && knockout && qualifierCorrect
  const borderColor = finished
    ? hasBlue ? 'rgba(59,130,246,0.4)' : correct ? 'rgba(34,197,94,0.4)' : partialCorrect ? 'rgba(232,184,75,0.4)' : wrong ? 'rgba(239,68,68,0.35)' : 'var(--border)'
    : live ? 'rgba(239,68,68,0.3)' : 'var(--border)'

  const bgColor = finished
    ? hasBlue ? 'rgba(59,130,246,0.06)' : correct ? 'rgba(34,197,94,0.06)' : partialCorrect ? 'rgba(232,184,75,0.06)' : wrong ? 'rgba(239,68,68,0.06)' : 'var(--surface)'
    : live ? 'rgba(239,68,68,0.04)' : 'var(--surface)'

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: bgColor, border: `1px solid ${borderColor}`, borderRadius: '14px', marginBottom: '10px' }}>
      <CardBg name={match.home_team} side="left" />
      <CardBg name={match.away_team} side="right" />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 40% 80% at 50% 50%, rgba(6,11,20,0.55) 0%, transparent 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div onClick={() => !finished && setExpanded(e => !e)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: finished ? 'default' : 'pointer', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
              <TeamCircle name={match.home_team} size={28} />
              <TeamCircle name={match.away_team} size={28} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(match.home_team)}</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(match.away_team)}</span>
            </div>
          </div>

          <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)', top: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {finished ? (
              match.penalty_home != null && match.penalty_away != null ? (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text)', letterSpacing: '0.03em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '1px' }}>
                  {match.home_score}
                  <span style={{ fontSize: '11px', color: 'rgba(240,244,255,0.5)', margin: '0 1px' }}>({match.penalty_home})</span>
                  <span style={{ color: 'rgba(240,244,255,0.3)', margin: '0 2px' }}>×</span>
                  <span style={{ fontSize: '11px', color: 'rgba(240,244,255,0.5)', margin: '0 1px' }}>({match.penalty_away})</span>
                  {match.away_score}
                </span>
              ) : (
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--text)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {match.home_score} × {match.away_score}
                </span>
              )
            ) : (
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--gold)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {live ? '🔴' : cd || '–'}
              </span>
            )}
            {match.penalty_home != null && finished && (
              <span style={{ fontSize: '8px', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pênaltis</span>
            )}
            {match.venue && (
              <span style={{ fontSize: '9px', color: 'var(--text-3)', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>{match.venue}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {finished
              ? totalPts === 5
                ? <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.35)' }}>⚡ +5pts</span>
                : qualifierCorrect && correct
                  ? <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.35)' }}>⚡ +5pts</span>
                : qualifierCorrect && partialCorrect
                  ? <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.35)' }}>+3pts</span>
                : qualifierCorrect
                  ? <span className="badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.35)' }}>+2pts</span>
                : correct
                  ? <span className="badge badge-green">+3pts</span>
                : partialCorrect
                  ? <span className="badge badge-gold">+1pt</span>
                  : <span className="badge badge-red">✗ Erro</span>
              : live ? <span className="badge badge-muted" style={{ fontSize: '9px' }}>🔒</span>
              : myGuess?.home_score !== undefined ? <span className="badge badge-gold">✓ {myGuess.home_score}×{myGuess.away_score}</span>
              : <span className="badge badge-muted" style={{ fontSize: '9px' }}>sem palpite</span>
            }
            {locked && (
              <button onClick={e => { e.stopPropagation(); setPopoverOpen(o => !o) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: popoverOpen ? 'var(--gold)' : 'var(--text-3)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />)}
              </button>
            )}
            {!finished && (
              <span style={{ color: 'var(--text-3)', fontSize: '12px', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
            )}
          </div>
        </div>

        {popoverOpen && locked && (
          <div style={{ margin: '0 16px 12px', background: 'rgba(6,11,20,0.95)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '10px 12px', animation: 'fadeUp 0.15s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Palpites da galera</span>
              <button onClick={() => setPopoverOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '14px' }}>×</button>
            </div>
            <ResenhaList matchId={match.id} matchHomeScore={match.home_score} matchAwayScore={match.away_score} />
          </div>
        )}

        {expanded && (
          <div style={{ padding: '0 16px 14px', animation: 'fadeUp 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <TeamCircle name={match.home_team} size={44} />
                <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text-2)' }}>{getPT(match.home_team)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <input className="score-input" type="number" inputMode="numeric" pattern="[0-9]*" min="0" max="20" value={home} onChange={e => setHome(e.target.value)} disabled={locked} style={{ width: '44px', fontSize: '22px' }} />
                  <span style={{ color: 'var(--text-3)', fontSize: '16px' }}>×</span>
                  <input className="score-input" type="number" inputMode="numeric" pattern="[0-9]*" min="0" max="20" value={away} onChange={e => setAway(e.target.value)} disabled={locked} style={{ width: '44px', fontSize: '22px' }} />
                </div>
                <div style={{ fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>palpite</div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <TeamCircle name={match.away_team} size={44} />
                <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text-2)' }}>{getPT(match.away_team)}</span>
              </div>
            </div>

            {!locked && !finished && (
              <button className={`btn ${saved ? 'btn-primary' : ''}`} style={{ padding: '9px', fontSize: '13px' }} onClick={save} disabled={saving || home === '' || away === ''}>
                {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Palpite'}
              </button>
            )}

            {knockout && (
              <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  🏆 Quem se classifica? <span style={{ fontSize: '9px', color: 'rgba(96,165,250,0.6)', fontWeight: 400 }}>+2pts bônus</span>
                </div>
                {finished ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[match.home_team, match.away_team].map(team => {
                      const isClassified = qualifierResult === team
                      const wasGuessed = qualifierGuess === team
                      return (
                        <div key={team} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: isClassified ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isClassified ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.07)'}` }}>
                          <TeamCircle name={team} size={24} />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: isClassified ? '#93c5fd' : 'var(--text-3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(team)}</span>
                          {isClassified && wasGuessed && <span style={{ fontSize: '11px', color: '#60a5fa' }}>✓ +2</span>}
                          {isClassified && !wasGuessed && <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>✓</span>}
                        </div>
                      )
                    })}
                  </div>
                ) : locked ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[match.home_team, match.away_team].map(team => {
                      const chosen = qualifierGuess === team || qualifier === team
                      return (
                        <div key={team} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: chosen ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${chosen ? 'rgba(59,130,246,0.45)' : 'rgba(255,255,255,0.07)'}` }}>
                          <TeamCircle name={team} size={24} />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: chosen ? '#93c5fd' : 'var(--text-3)', flex: 1 }}>{getPT(team)}</span>
                          {chosen && <span style={{ fontSize: '10px', color: '#60a5fa' }}>🔒</span>}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[match.home_team, match.away_team].map(team => {
                      const chosen = qualifier === team
                      return (
                        <button key={team} onClick={() => setQualifier(chosen ? '' : team)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: '8px', cursor: 'pointer', background: chosen ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${chosen ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.15s' }}>
                          <TeamCircle name={team} size={24} />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: chosen ? '#93c5fd' : 'var(--text-2)', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(team)}</span>
                          {chosen && <span style={{ fontSize: '10px', color: '#60a5fa' }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── FlagCircle / TeamPicker / MasterGuess ─────────────────────────────────────

function FlagCircle({ name, size = 28 }) {
  const url = getFlagUrl(name)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.15)', background: 'var(--surface)' }}>
      {url
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
        : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: size * 0.5 }}>🏳️</div>
      }
    </div>
  )
}

function TeamPicker({ value, onChange, placeholder, exclude, teams }) {
  const [open, setOpen] = useState(false)
  const selected = teams.find(t => t.name === value)
  const options = teams.filter(t => t.name !== exclude)

  return (
    <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: '13px', color: selected ? 'var(--text)' : 'var(--text-3)' }}>
        {selected
          ? <><FlagCircle name={selected.name} size={24} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{TEAM_PT[selected.name] || selected.name}</span></>
          : <span>{placeholder}</span>
        }
        <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: '10px' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', maxHeight: '220px', overflowY: 'auto', marginTop: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {options.map(t => (
            <div key={t.name} onClick={() => { onChange(t.name); setOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', background: value === t.name ? 'rgba(232,184,75,0.1)' : 'transparent', color: value === t.name ? 'var(--gold)' : 'var(--text)' }}>
              <FlagCircle name={t.name} size={26} />
              <span>{TEAM_PT[t.name] || t.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MasterGuess({ userId }) {
  const [t1, setT1] = useState('')
  const [t2, setT2] = useState('')
  const [saved, setSaved] = useState(false)
  const [existing, setExisting] = useState(null)
  const [teams, setTeams] = useState([])
  const locked = new Date() >= new Date('2026-06-15T23:59:00')

  useEffect(() => {
    supabase.from('master_guess').select('*').eq('user_id', userId).single()
      .then(({ data }) => { if (data) { setExisting(data); setT1(data.team1); setT2(data.team2) } })
    supabase.from('matches').select('home_team, away_team')
      .then(({ data }) => {
        if (!data) return
        const set = new Set()
        data.forEach(m => { set.add(m.home_team); set.add(m.away_team) })
        const sorted = [...set].filter(Boolean).sort((a, b) => (TEAM_PT[a] || a).localeCompare(TEAM_PT[b] || b, 'pt')).map(name => ({ name }))
        setTeams(sorted)
      })
  }, [userId])

  async function saveMaster() {
    if (!t1 || !t2 || t1 === t2) return
    if (existing) await supabase.from('master_guess').update({ team1: t1, team2: t2 }).eq('user_id', userId)
    else await supabase.from('master_guess').insert({ user_id: userId, team1: t1, team2: t2 })
    setExisting({ team1: t1, team2: t2 })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const t1PT = TEAM_PT[existing?.team1] || existing?.team1
  const t2PT = TEAM_PT[existing?.team2] || existing?.team2

  return (
    <div className="glass-card" style={{ padding: '14px 16px', marginBottom: '18px', border: '1px solid rgba(212,168,50,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', letterSpacing: '0.06em', color: 'var(--gold)' }}>PALPITE MESTRE</div>
        {!locked && <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(232,184,75,0.6)', fontWeight: 600 }}>⚡ CHANCE RELÂMPAGO · até 15/Jun</span>}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '10px', lineHeight: 1.5 }}>
        Finalistas? Um certo = <strong style={{ color: 'var(--gold)' }}>+5pts</strong> · Dois certos = <strong style={{ color: 'var(--gold)' }}>+10pts</strong>
      </div>
      {locked ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--r-sm)' }}>
          <span style={{ fontSize: '13px' }}>🔒</span>
          {existing ? (
            <>
              <FlagCircle name={existing.team1} size={24} />
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{t1PT}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>×</span>
              <FlagCircle name={existing.team2} size={24} />
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>{t2PT}</span>
            </>
          ) : (
            <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Sem palpite registrado</span>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <TeamPicker value={t1} onChange={setT1} placeholder="Finalista 1" exclude={t2} teams={teams} />
          <TeamPicker value={t2} onChange={setT2} placeholder="Finalista 2" exclude={t1} teams={teams} />
          <button className={`btn ${saved ? 'btn-primary' : ''}`} onClick={saveMaster} disabled={!t1 || !t2 || t1 === t2} style={{ width: 'auto', padding: '9px 14px', fontSize: '13px', flexShrink: 0 }}>
            {saved ? '✓' : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── CalendarioNav ─────────────────────────────────────────────────────────────

const MESES = [
  { label: 'Junho', year: 2026, month: 5 },  // month é 0-indexed
  { label: 'Julho', year: 2026, month: 6 },
]

function CalendarioNav({ matches, onSelectDay }) {
  const today = new Date()
  const initialMonth = today.getMonth() === 5 ? 0 : today.getMonth() === 6 ? 1 : 0
  const [mesIdx, setMesIdx] = useState(initialMonth)

  const mes = MESES[mesIdx]

  // Quais dias deste mês têm jogos
  const diasComJogo = useMemo(() => {
    const set = new Set()
    matches.forEach(m => {
      const d = parseISO(m.match_date)
      if (d.getFullYear() === mes.year && d.getMonth() === mes.month) {
        set.add(d.getDate())
      }
    })
    return set
  }, [matches, mes])

  // Dias do mês
  const diasNoMes = new Date(mes.year, mes.month + 1, 0).getDate()
  const primeiroDiaSemana = new Date(mes.year, mes.month, 1).getDay() // 0=Dom

  const todayDay = today.getFullYear() === mes.year && today.getMonth() === mes.month ? today.getDate() : null

  const dias = []
  for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null) // padding
  for (let d = 1; d <= diasNoMes; d++) dias.push(d)

  const semanas = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '12px', marginBottom: '16px' }}>
      {/* Header do mês */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button
          onClick={() => setMesIdx(i => Math.max(0, i - 1))}
          disabled={mesIdx === 0}
          style={{ background: 'none', border: 'none', cursor: mesIdx === 0 ? 'default' : 'pointer', color: mesIdx === 0 ? 'var(--text-3)' : 'var(--text-2)', fontSize: '16px', padding: '4px 8px', opacity: mesIdx === 0 ? 0.3 : 1 }}
        >‹</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text)', letterSpacing: '0.06em' }}>
          {mes.label} {mes.year}
        </span>
        <button
          onClick={() => setMesIdx(i => Math.min(MESES.length - 1, i + 1))}
          disabled={mesIdx === MESES.length - 1}
          style={{ background: 'none', border: 'none', cursor: mesIdx === MESES.length - 1 ? 'default' : 'pointer', color: mesIdx === MESES.length - 1 ? 'var(--text-3)' : 'var(--text-2)', fontSize: '16px', padding: '4px 8px', opacity: mesIdx === MESES.length - 1 ? 0.3 : 1 }}
        >›</button>
      </div>

      {/* Cabeçalho dos dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {semanas.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 0' }}>{s}</div>
        ))}
      </div>

      {/* Grade de dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {dias.map((d, i) => {
          if (!d) return <div key={`e${i}`} />
          const temJogo = diasComJogo.has(d)
          const isHoje = d === todayDay
          return (
            <button
              key={d}
              onClick={() => temJogo && onSelectDay(d, mes.month, mes.year)}
              disabled={!temJogo}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '5px 2px',
                cursor: temJogo ? 'pointer' : 'default',
                background: isHoje
                  ? 'rgba(232,184,75,0.2)'
                  : temJogo ? 'rgba(255,255,255,0.06)' : 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                transition: 'background 0.15s',
              }}
            >
              <span style={{
                fontSize: '12px',
                fontWeight: isHoje ? 700 : temJogo ? 600 : 400,
                color: isHoje ? 'var(--gold)' : temJogo ? 'var(--text)' : 'var(--text-3)',
                opacity: temJogo ? 1 : 0.35,
                fontFamily: temJogo ? 'var(--font-display)' : undefined,
              }}>{d}</span>
              {temJogo && (
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isHoje ? 'var(--gold)' : 'rgba(255,255,255,0.35)' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}



function RegrasTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>PONTUAÇÃO</div>
        {[
          { icon: '🎯', label: 'Placar Exato', desc: 'Acertou o placar certinho (ex: 2×1 = 2×1)', pts: '+3', color: 'var(--green)' },
          { icon: '✅', label: 'Vencedor Certo', desc: 'Acertou quem ganhou mas errou o placar', pts: '+1', color: 'var(--gold)' },
          { icon: '🤝', label: 'Empate Certo', desc: 'Previu empate e deu empate', pts: '+1', color: 'var(--gold)' },
          { icon: '❌', label: 'Errou', desc: 'Não acertou nem o resultado', pts: '0', color: 'var(--red)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: item.color, flexShrink: 0 }}>{item.pts}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>PALPITE MESTRE</div>
        {[
          { icon: '🏆', label: 'Dois finalistas certos', pts: '+10' },
          { icon: '🥈', label: 'Um finalista certo', pts: '+5' },
          { icon: '❌', label: 'Errou os dois', pts: '0' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <div style={{ flex: 1, fontSize: '13px' }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)' }}>{item.pts}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>DESEMPATE</div>
        {[
          { icon: '⭐', label: 'Pontos', desc: 'Maior pontuação total' },
          { icon: '🎯', label: 'Placares exatos', desc: 'Quem acertou mais placares certinhos' },
          { icon: '✅', label: 'Parciais', desc: 'Quem acertou mais vencedores/empates' },
          { icon: '🕐', label: 'Entrada no bolão', desc: 'Quem se cadastrou primeiro leva a melhor' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text-3)', flexShrink: 0 }}>{i + 1}º</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: '16px 20px', border: '1px solid rgba(59,130,246,0.3)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#60a5fa', marginBottom: '6px', letterSpacing: '0.06em' }}>🏆 MATA-MATA</div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '14px', lineHeight: 1.6 }}>
          A partir de <strong style={{ color: 'var(--text-2)' }}>28 de junho</strong>, os jogos entram na fase eliminatória. Além do palpite de placar, você também escolhe <strong style={{ color: '#93c5fd' }}>quem se classifica</strong> — e isso vale pontos extras!
        </div>
        {[
          { icon: '⚡', label: 'Placar exato + classificado certo', pts: '+5', color: '#60a5fa', desc: 'Acertou o placar certinho e ainda o time que passa' },
          { icon: '🎯', label: 'Placar exato (sem acertar classificado)', pts: '+3', color: 'var(--green)', desc: 'Acertou 2×1 = 2×1, mas errou quem classificou' },
          { icon: '✅', label: 'Resultado certo + classificado certo', pts: '+3', color: '#60a5fa', desc: 'Acertou o vencedor/empate e o time que avança', highlight: true },
          { icon: '✅', label: 'Resultado certo (sem acertar classificado)', pts: '+1', color: 'var(--gold)', desc: 'Acertou quem ganhou mas errou quem classificou' },
          { icon: '🏆', label: 'Só acertou quem classifica', pts: '+2', color: '#60a5fa', desc: 'Errou o placar/resultado mas acertou quem avançou' },
          { icon: '❌', label: 'Errou tudo', pts: '0', color: 'var(--red)', desc: 'Não acertou placar, resultado nem classificado' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: item.highlight ? '#93c5fd' : 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: item.color, flexShrink: 0 }}>{item.pts}</div>
          </div>
        ))}
        <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: '#93c5fd' }}>Como funciona:</strong> No mata-mata, em caso de empate no tempo normal o jogo pode ir para pênaltis. O "classificado" é o time que efetivamente avança — seja pelo tempo normal ou pelos pênaltis. Seu palpite de placar vale para o tempo regulamentar (90min + prorrogação).
        </div>
      </div>
    </div>
  )
}

// ── Copa Yuuto Kidou ──────────────────────────────────────────────────────────

// Fases e janelas de datas
const TOURNAMENT_PHASES = [
  { key: 'oitavas', label: 'Oitavas', shortLabel: 'Oitavas', bonus: 3, start: '2026-06-28', end: '2026-07-03', round: 1 },
  { key: 'quartas', label: 'Quartas', shortLabel: 'Quartas', bonus: 4, start: '2026-07-04', end: '2026-07-07', round: 2 },
  { key: 'semi',   label: 'Semifinal', shortLabel: 'Semi',  bonus: 5, start: '2026-07-09', end: '2026-07-11', round: 3 },
  { key: 'final',  label: 'Final',    shortLabel: 'Final',  bonus: 6, start: '2026-07-14', end: '2026-07-15', round: 4 },
]

function getCurrentPhase() {
  const today = new Date()
  // Retorna a fase mais recente que já começou
  for (let i = TOURNAMENT_PHASES.length - 1; i >= 0; i--) {
    if (today >= new Date(TOURNAMENT_PHASES[i].start + 'T00:00:00')) return i
  }
  return 0
}

// Monta o bracket a partir dos matchups do banco (tournament_matchups)
// profilesMap: { [id]: profile }
function buildBracketFromMatchups(matchups, profilesMap) {
  const oitavas = matchups.filter(m => m.phase === 'oitavas').sort((a, b) => a.slot - b.slot)
  const quartas  = matchups.filter(m => m.phase === 'quartas').sort((a, b) => a.slot - b.slot)
  const semi     = matchups.filter(m => m.phase === 'semi').sort((a, b) => a.slot - b.slot)
  const final    = matchups.filter(m => m.phase === 'final').sort((a, b) => a.slot - b.slot)

  function toSlot(mu) {
    return {
      slot: mu.slot,
      p1: profilesMap[mu.player1_id] || null,
      p2: profilesMap[mu.player2_id] || null,
      winner_id: mu.winner_id || null,
      player1_points: mu.player1_points,
      player2_points: mu.player2_points,
      phase: mu.phase,
    }
  }

  const oSlots = oitavas.map(toSlot)
  const chaveA = oSlots.filter((_, i) => i % 2 === 0)
  const chaveB = oSlots.filter((_, i) => i % 2 === 1)

  return {
    chaveA,
    chaveB,
    quartas: quartas.map(toSlot),
    semi: semi.map(toSlot),
    final: final.map(toSlot),
    all: matchups,
  }
}

// Calcula pontos de um usuário dentro de uma janela de datas
function usePhasePoints(userId, phase) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!userId || !phase) return
    const start = phase.start + 'T00:00:00'
    const end = phase.end + 'T23:59:59'

    supabase
      .from('guesses')
      .select('points_earned, matches(match_date, status)')
      .eq('user_id', userId)
      .then(({ data: guesses }) => {
        const filtered = (guesses || []).filter(g => {
          const md = g.matches?.match_date
          if (!md) return false
          const d = new Date(md)
          return d >= new Date(start) && d <= new Date(end) && g.matches?.status === 'finished'
        })
        const pts = filtered.reduce((sum, g) => sum + (g.points_earned || 0), 0)
        setData(pts)
      })
  }, [userId, phase])

  return data
}

// Busca palpites de um user na fase atual para exibir no card Adversário
function useOpponentGuesses(opponentId, phase, matches) {
  const [guesses, setGuesses] = useState(null)

  useEffect(() => {
    if (!opponentId || !phase || !matches?.length) return
    const start = new Date(phase.start + 'T00:00:00')
    const end = new Date(phase.end + 'T23:59:59')

    const phaseMatchIds = matches
      .filter(m => {
        const d = new Date(m.match_date)
        return d >= start && d <= end
      })
      .map(m => m.id)

    if (!phaseMatchIds.length) { setGuesses([]); return }

    supabase
      .from('guesses')
      .select('*')
      .eq('user_id', opponentId)
      .in('match_id', phaseMatchIds)
      .then(({ data }) => setGuesses(data || []))
  }, [opponentId, phase, matches])

  return guesses
}

// Card do adversário na fase atual
function AdversarioTab({ myProfile, bracket, matches, currentPhaseIdx }) {
  const phase = TOURNAMENT_PHASES[currentPhaseIdx]

  // Acha o confronto do usuário atual NA FASE ATUAL (não sempre oitavas)
  const myMatchup = useMemo(() => {
    if (!bracket || !myProfile) return null
    // Pega confrontos da fase atual primeiro, senão cai nas oitavas
    const phaseKey = phase.key
    let phaseSlots = []
    if (phaseKey === 'oitavas') phaseSlots = [...(bracket.chaveA || []), ...(bracket.chaveB || [])]
    else if (phaseKey === 'quartas') phaseSlots = bracket.quartas || []
    else if (phaseKey === 'semi') phaseSlots = bracket.semi || []
    else if (phaseKey === 'final') phaseSlots = bracket.final || []
    const inPhase = phaseSlots.find(m => m.p1?.id === myProfile.id || m.p2?.id === myProfile.id)
    if (inPhase) return inPhase
    // fallback: oitavas (antes do torneio iniciar)
    const all = [...(bracket.chaveA || []), ...(bracket.chaveB || [])]
    return all.find(m => m.p1?.id === myProfile.id || m.p2?.id === myProfile.id) || null
  }, [bracket, myProfile, phase])

  const opponent = myMatchup
    ? (myMatchup.p1?.id === myProfile?.id ? myMatchup.p2 : myMatchup.p1)
    : null

  const opGuesses = useOpponentGuesses(opponent?.id, phase, matches)

  // Pontos do oponente na fase
  const [opPoints, setOpPoints] = useState(null)
  const [myPoints, setMyPoints] = useState(null)

  useEffect(() => {
    if (!opponent?.id || !phase) return
    const start = new Date(phase.start + 'T00:00:00')
    const end = new Date(phase.end + 'T23:59:59')

    async function fetchPts(uid, setter) {
      const { data } = await supabase
        .from('guesses')
        .select('points_earned, matches(match_date, status)')
        .eq('user_id', uid)
      const pts = (data || []).filter(g => {
        const md = g.matches?.match_date
        if (!md) return false
        const d = new Date(md)
        return d >= start && d <= end && g.matches?.status === 'finished'
      }).reduce((s, g) => s + (g.points_earned || 0), 0)
      setter(pts)
    }

    if (myProfile?.id) fetchPts(myProfile.id, setMyPoints)
    fetchPts(opponent.id, setOpPoints)
  }, [opponent, phase, myProfile])

  const phaseMatches = useMemo(() => {
    if (!matches || !phase) return []
    const start = new Date(phase.start + 'T00:00:00')
    const end = new Date(phase.end + 'T23:59:59')
    return matches.filter(m => {
      const d = new Date(m.match_date)
      return d >= start && d <= end
    }).sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
  }, [matches, phase])

  if (!myMatchup || !opponent) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
        <div style={{ fontSize: '14px' }}>Você não está no chaveamento desta fase.</div>
      </div>
    )
  }

  const opGuessMap = {}
  ;(opGuesses || []).forEach(g => { opGuessMap[g.match_id] = g })

  return (
    <div>
      {/* Card do confronto */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '16px', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.04)' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(168,85,247,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '16px' }}>
          {phase.label} · Copa Yuuto Kidou
        </div>

        {/* VS card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Você */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Avatar profile={myProfile} size={52} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gold)', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {myProfile.display_name || myProfile.nick}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>você</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: myPoints > opPoints ? 'var(--green)' : myPoints < opPoints ? 'var(--red)' : 'var(--text)', lineHeight: 1 }}>
              {myPoints ?? '–'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>pts na fase</div>
          </div>

          {/* VS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'rgba(168,85,247,0.7)', letterSpacing: '0.1em' }}>VS</div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(168,85,247,0.2)' }} />
          </div>

          {/* Adversário */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Avatar profile={opponent} size={52} />
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {opponent.display_name || opponent.nick}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>adversário</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: opPoints > myPoints ? 'var(--green)' : opPoints < myPoints ? 'var(--red)' : 'var(--text)', lineHeight: 1 }}>
              {opPoints ?? '–'}
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>pts na fase</div>
          </div>
        </div>

        {myPoints !== null && opPoints !== null && (
          <div style={{ marginTop: '14px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', textAlign: 'center', fontSize: '12px', color: 'var(--text-3)' }}>
            {myPoints > opPoints
              ? <span style={{ color: 'var(--green)' }}>✅ Você está na frente! Segura que tá bom...</span>
              : myPoints < opPoints
              ? <span style={{ color: 'var(--red)' }}>📉 Você está atrás. Vai que vira!</span>
              : <span style={{ color: 'var(--gold)' }}>⚖️ Empatado! O desempate decide.</span>
            }
          </div>
        )}
      </div>

      {/* Bônus da fase */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {TOURNAMENT_PHASES.map((ph, i) => (
          <div key={ph.key} style={{
            flex: 1, padding: '8px 6px', borderRadius: '8px', textAlign: 'center',
            background: i === currentPhaseIdx ? 'rgba(168,85,247,0.15)' : 'var(--surface)',
            border: `1px solid ${i === currentPhaseIdx ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`,
            opacity: i > currentPhaseIdx ? 0.4 : 1,
          }}>
            <div style={{ fontSize: '9px', color: i === currentPhaseIdx ? 'rgba(168,85,247,0.8)' : 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ph.shortLabel}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: i < currentPhaseIdx ? 'var(--green)' : i === currentPhaseIdx ? '#c084fc' : 'var(--text-3)', marginTop: '2px' }}>+{ph.bonus}</div>
          </div>
        ))}
      </div>

      {/* Título palpites adversário */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,85,247,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
        Palpites de {opponent.display_name || opponent.nick} na fase
      </div>

      {opGuesses === null ? (
        Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8, borderRadius: 12 }} />)
      ) : phaseMatches.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0', fontSize: '13px' }}>Nenhum jogo nesta fase ainda.</div>
      ) : (
        phaseMatches.map(m => {
          const g = opGuessMap[m.id]
          const matchStarted = new Date() >= new Date(m.match_date)
          const finished = m.status === 'finished'
          const showGuess = matchStarted // só mostra depois que começou

          // Cor baseada direto no points_earned (já calculado corretamente pelo trigger)
          const isKo = new Date(String(m.match_date).replace(' ', 'T')) >= new Date('2026-06-28T00:00:00Z')
          const pts = g?.points_earned ?? 0
          // Azul: knockout com pts>1 (tem bônus qualifier); Verde: exato (3pt) sem qualifier; Amarelo: 1pt; Vermelho: 0pt
          const hasBlueCard = finished && g && isKo && pts > 1
          const cardBg = !finished ? 'var(--surface)'
            : !g ? 'var(--surface)'
            : hasBlueCard ? 'rgba(59,130,246,0.06)'
            : pts === 3 ? 'rgba(34,197,94,0.06)'
            : pts === 1 ? 'rgba(232,184,75,0.06)'
            : 'rgba(239,68,68,0.06)'
          const cardBorder = !finished ? 'var(--border)'
            : !g ? 'var(--border)'
            : hasBlueCard ? 'rgba(59,130,246,0.35)'
            : pts === 3 ? 'rgba(34,197,94,0.35)'
            : pts === 1 ? 'rgba(232,184,75,0.35)'
            : 'rgba(239,68,68,0.3)'
          const guessColor = !finished ? '#c084fc'
            : hasBlueCard ? '#60a5fa'
            : pts === 3 ? 'var(--green)'
            : pts === 1 ? 'var(--gold)'
            : 'var(--red)'

          return (
            <div key={m.id} style={{
              position: 'relative', overflow: 'hidden',
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '14px', marginBottom: '10px',
            }}>
              <CardBg name={m.home_team} side="left" />
              <CardBg name={m.away_team} side="right" />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 40% 80% at 50% 50%, rgba(6,11,20,0.55) 0%, transparent 100%)' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '10px' }}>
                {/* Times */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <TeamCircle name={m.home_team} size={28} />
                    <TeamCircle name={m.away_team} size={28} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(m.home_team)}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(m.away_team)}</span>
                  </div>
                </div>

                {/* Centro: placar real ou horário */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                  {finished ? (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text)', letterSpacing: '0.06em' }}>{m.home_score} × {m.away_score}</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600 }}>{format(new Date(m.match_date), "dd/MM", { locale: ptBR })}</span>
                      <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>{format(new Date(m.match_date), 'HH:mm')}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '36px', background: 'var(--border)', flexShrink: 0 }} />

                {/* Palpite adversário */}
                <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '64px' }}>
                  {!showGuess ? (
                    <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>🔒 em breve</span>
                  ) : !g ? (
                    <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>sem palpite</span>
                  ) : (
                    <>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: guessColor, letterSpacing: '0.06em', lineHeight: 1 }}>
                        {g.home_score} × {g.away_score}
                      </div>
                      {finished && (
                        <div style={{ fontSize: '10px', color: guessColor, marginTop: '3px' }}>
                          {g.points_earned > 0 ? `+${g.points_earned}pt` : '0pt'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ── Chaveamento ───────────────────────────────────────────────────────────────

function BracketSlot({ p, seed, dim = false }) {
  if (!p) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', opacity: 0.5 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', flexShrink: 0 }} />
      <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>A definir</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', background: dim ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', border: `1px solid ${dim ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`, opacity: dim ? 0.5 : 1 }}>
      <div style={{ width: 20, flexShrink: 0, textAlign: 'center', fontSize: '9px', color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>{seed ? `${seed}º` : ''}</div>
      <Avatar profile={p} size={24} />
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.display_name || p.nick}
      </span>
    </div>
  )
}

function MatchupCard({ m1, m2, seed1, seed2, myId }) {
  const isMe = m1?.id === myId || m2?.id === myId
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '10px', border: `1px solid ${isMe ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`, overflow: 'hidden', marginBottom: '8px' }}>
      <BracketSlot p={m1} seed={seed1} />
      <div style={{ height: '1px', background: 'var(--border)' }} />
      <BracketSlot p={m2} seed={seed2} />
    </div>
  )
}

function ChaveamentoTab({ bracket, loading, currentPhaseIdx, myId }) {
  // Fase que está sendo VISUALIZADA (pode ser diferente da que está ao vivo)
  const [viewPhaseIdx, setViewPhaseIdx] = useState(currentPhaseIdx)

  if (loading) return Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 8, borderRadius: 10 }} />)

  const phase = TOURNAMENT_PHASES[viewPhaseIdx]

  // Pega os confrontos da fase visualizada (oitavas já vem em chaveA/chaveB; as demais em listas planas)
  let slotsA = [], slotsB = []
  if (viewPhaseIdx === 0) {
    slotsA = bracket?.chaveA || []
    slotsB = bracket?.chaveB || []
  } else {
    const flat = bracket?.[phase.key] || []
    const half = Math.ceil(flat.length / 2)
    slotsA = flat.slice(0, half)
    slotsB = flat.slice(half)
  }
  const hasMatchups = slotsA.length > 0 || slotsB.length > 0

  return (
    <div>
      {/* Navegação de fases */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {TOURNAMENT_PHASES.map((ph, i) => (
          <div
            key={ph.key}
            onClick={() => setViewPhaseIdx(i)}
            role="button"
            tabIndex={0}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', userSelect: 'none',
              background: i === viewPhaseIdx ? 'rgba(168,85,247,0.2)' : 'var(--surface)',
              border: `1px solid ${i === viewPhaseIdx ? 'rgba(168,85,247,0.5)' : i === currentPhaseIdx ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
              color: i === viewPhaseIdx ? '#c084fc' : i < currentPhaseIdx ? 'var(--text-2)' : 'var(--text-3)',
            }}>
            {i < currentPhaseIdx ? '✓ ' : ''}{ph.label}
            {i === currentPhaseIdx && <span style={{ marginLeft: '6px', fontSize: '9px', background: 'rgba(168,85,247,0.3)', padding: '1px 5px', borderRadius: '10px' }}>AO VIVO</span>}
          </div>
        ))}
      </div>

      {/* Datas da fase visualizada */}
      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '16px', padding: '8px 12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
        📅 <strong style={{ color: 'var(--text-2)' }}>{phase.label}:</strong> {new Date(phase.start + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} – {new Date(phase.end + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        <span style={{ marginLeft: '10px' }}>· Avançar vale <strong style={{ color: '#c084fc' }}>+{phase.bonus}pts</strong></span>
      </div>

      {!bracket ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
          <div>Chaveamento disponível quando os 16 participantes estiverem confirmados.</div>
        </div>
      ) : !hasMatchups ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
          <div>Confrontos de <strong style={{ color: 'var(--text-2)' }}>{phase.label}</strong> ainda não foram definidos.</div>
        </div>
      ) : (
        <>
          {/* Chave A */}
          {slotsA.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,85,247,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Chave A</div>
              {slotsA.map((m, i) => {
                const seeds = viewPhaseIdx === 0 ? [i * 2 + 1, 16 - i * 2] : [null, null]
                return <MatchupCard key={i} m1={m.p1} m2={m.p2} seed1={seeds[0]} seed2={seeds[1]} myId={myId} />
              })}
            </div>
          )}

          {/* Chave B */}
          {slotsB.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(168,85,247,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Chave B</div>
              {slotsB.map((m, i) => {
                const seeds = viewPhaseIdx === 0 ? [i * 2 + 2, 15 - i * 2] : [null, null]
                return <MatchupCard key={i} m1={m.p1} m2={m.p2} seed1={seeds[0]} seed2={seeds[1]} myId={myId} />
              })}
            </div>
          )}

          {/* Legenda */}
          <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.7 }}>
            💡 Quem fizer <strong style={{ color: '#c084fc' }}>mais pontos no Nekomão</strong> dentro da janela da fase avança. Em caso de empate, valem os critérios de desempate do bolão (placares exatos → parciais → data de cadastro) (PLACARES E PARCIAIS DENTRO DA JANELA DA FASE).
          </div>
        </>
      )}
    </div>
  )
}

// ── Copa Yuuto Kidou Page ─────────────────────────────────────────────────────

function CopaYuutoKidou({ user, matches }) {
  const [subTab, setSubTab] = useState('chaveamento')
  const [bracket, setBracket] = useState(null)
  const [myProfile, setMyProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentPhaseIdx = getCurrentPhase()

  useEffect(() => {
    async function fetchTournament() {
      const [{ data: matchups }, { data: profiles }] = await Promise.all([
        supabase.from('tournament_matchups').select('*').order('slot', { ascending: true }),
        supabase.from('profiles').select('id, display_name, nick, avatar_url, points, exact_hits, partial_hits, qualifier_hits, created_at'),
      ])

      if (profiles) {
        const profilesMap = {}
        profiles.forEach(p => { profilesMap[p.id] = p })
        setMyProfile(profiles.find(p => p.id === user.id) || null)

        if (matchups?.length) {
          setBracket(buildBracketFromMatchups(matchups, profilesMap))
        } else {
          // Preview pré-torneio: mostra oitavas projetadas pelo ranking atual
          const sorted = [...profiles].sort((a, b) =>
            (b.points - a.points) || (b.exact_hits - a.exact_hits) || (b.partial_hits - a.partial_hits) || (new Date(a.created_at) - new Date(b.created_at))
          ).slice(0, 16)
          if (sorted.length >= 2) {
            const preview = []
            for (let i = 0; i < 8 && i < sorted.length && (15 - i) < sorted.length; i++) {
              preview.push({ phase: 'oitavas', slot: i, player1_id: sorted[i].id, player2_id: sorted[15 - i].id, winner_id: null, player1_points: 0, player2_points: 0 })
            }
            setBracket(buildBracketFromMatchups(preview, profilesMap))
          }
        }
      }
      setLoading(false)
    }
    fetchTournament()
  }, [user.id])

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
        {[['chaveamento', 'Chaveamento'], ['adversario', 'Adversário']].map(([key, label]) => (
          <button key={key} onClick={() => setSubTab(key)} style={{
            flex: 1, padding: '9px 8px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            background: 'transparent',
            color: subTab === key ? 'var(--text)' : 'var(--text-3)',
            borderBottom: `2px solid ${subTab === key ? '#c084fc' : 'transparent'}`,
            transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      {subTab === 'chaveamento'
        ? <ChaveamentoTab bracket={bracket} loading={loading} currentPhaseIdx={currentPhaseIdx} myId={user.id} />
        : <AdversarioTab myProfile={myProfile} bracket={bracket} matches={matches} currentPhaseIdx={currentPhaseIdx} />
      }
    </div>
  )
}

// ── GuessesPage (principal) ────────────────────────────────────────────────────

export default function GuessesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [myGuesses, setMyGuesses] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('palpites')
  const [dayTab, setDayTab] = useState('hoje')
  const [expandedDays, setExpandedDays] = useState({})

  const fetchData = useCallback(async () => {
    const [{ data: mData }, { data: myData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date'),
      supabase.from('guesses').select('*').eq('user_id', user.id),
    ])
    setMatches(mData || [])
    const myMap = {}
    ;(myData || []).forEach(g => { myMap[g.match_id] = g })
    setMyGuesses(myMap)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const dayRefs = useMemo(() => ({}), [])

  function handleCalendarDay(day, month, year) {
    // Acha a chave do grupo correspondente
    const target = Object.keys(grouped).find(dateKey => {
      const match = filteredMatches.find(m => {
        const d = parseISO(m.match_date)
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
      })
      return !!match && grouped[dateKey]?.some(m => {
        const d = parseISO(m.match_date)
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
      })
    })
    if (!target) return
    // Abre o grupo
    setExpandedDays(prev => ({ ...prev, [target]: true }))
    // Scroll após render
    setTimeout(() => {
      if (dayRefs[target]) {
        dayRefs[target].scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  async function handleSave(matchId, homeScore, awayScore, existing, qualifierGuess) {
    if (existing) await supabase.from('guesses').update({ home_score: homeScore, away_score: awayScore, qualifier_guess: qualifierGuess ?? null }).eq('id', existing.id)
    else await supabase.from('guesses').insert({ user_id: user.id, match_id: matchId, home_score: homeScore, away_score: awayScore, qualifier_guess: qualifierGuess ?? null })
    await fetchData()
  }

  const filteredMatches = (() => {
    const todayStart = startOfDay(new Date())
    const todayEnd = new Date(todayStart.getTime() + 86400000)
    const tomorrowEnd = new Date(todayStart.getTime() + 2 * 86400000)
    if (dayTab === 'hoje') return matches.filter(m => { const d = parseISO(m.match_date); return d >= todayStart && d < todayEnd })
    if (dayTab === 'amanha') return matches.filter(m => { const d = parseISO(m.match_date); return d >= todayEnd && d < tomorrowEnd })
    return matches
  })()

  const grouped = {}
  filteredMatches.forEach(m => {
    const d = format(parseISO(m.match_date), "EEEE, dd 'de' MMMM", { locale: ptBR })
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(m)
  })

  // Título dinâmico por aba
  const pageTitle = tab === 'palpites' ? 'Nekomão' : 'Copa Yuuto Kidou'

  const tabs = ['palpites', 'copa']

  return (
    <div className="page">
      <div className="section-title">{pageTitle}</div>

      <QuizBanner />

      {/* Toggle principal */}
      <div
        style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '4px', marginBottom: '16px', gap: '4px' }}
        onTouchStart={e => { e.currentTarget._sx = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - (e.currentTarget._sx || 0)
          const cur = tabs.indexOf(tab)
          if (dx < -40 && cur < tabs.length - 1) setTab(tabs[cur + 1])
          if (dx > 40 && cur > 0) setTab(tabs[cur - 1])
        }}
      >
        {[['palpites', 'Liga Nekomão'], ['copa', 'Copa Yuuto Kidou']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text)' : 'var(--text-3)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'copa' ? (
        <CopaYuutoKidou user={user} matches={matches} />
      ) : (
        <>
          <MasterGuess userId={user.id} />

          {/* Tabs Hoje / Todos / Amanhã */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
            {[['hoje', 'Hoje'], ['todos', 'Todos'], ['amanha', 'Amanhã']].map(([key, label]) => (
              <button key={key} onClick={() => setDayTab(key)} style={{
                flex: 1, padding: '9px 8px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                background: 'transparent',
                color: dayTab === key ? 'var(--text)' : 'var(--text-3)',
                borderBottom: `2px solid ${dayTab === key ? 'var(--gold)' : 'transparent'}`,
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8, borderRadius: 12 }} />)
            : filteredMatches.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0' }}>
                  {dayTab === 'hoje' ? 'Nenhum jogo hoje.' : dayTab === 'amanha' ? 'Nenhum jogo amanhã.' : 'Nenhum jogo cadastrado.'}
                </div>
              : <>
                  {dayTab === 'todos' && (
                    <CalendarioNav matches={matches} onSelectDay={handleCalendarDay} />
                  )}
                  {Object.entries(grouped).map(([date, dayMatches]) => {
                    const isTodos = dayTab === 'todos'
                    const isExpanded = isTodos
                      ? (expandedDays[date] !== undefined ? expandedDays[date] : date === format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR }))
                      : true

                    return (
                      <div key={date} ref={el => { dayRefs[date] = el }}>
                        <div
                          onClick={isTodos ? () => setExpandedDays(prev => ({ ...prev, [date]: !isExpanded })) : undefined}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'var(--gold)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '8px', marginTop: '16px', cursor: isTodos ? 'pointer' : 'default', userSelect: 'none', padding: '4px 0' }}
                        >
                          <span>{date}</span>
                          {isTodos && (
                            <span style={{ fontSize: '10px', color: 'var(--text-3)', marginLeft: '8px' }}>
                              {isExpanded ? '▲' : `▼ ${dayMatches.length} jogo${dayMatches.length > 1 ? 's' : ''}`}
                            </span>
                          )}
                        </div>
                        {isExpanded && dayMatches.map(m => (
                          <GuessCard key={m.id} match={m} myGuess={myGuesses[m.id]} onSave={handleSave} />
                        ))}
                      </div>
                    )
                  })}
                </>
          }

          {dayTab === 'todos' && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                position: 'fixed', bottom: '80px', right: '20px', zIndex: 50,
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--surface)', border: '1px solid var(--border-strong)',
                color: 'var(--text-2)', fontSize: '16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >↑</button>
          )}
        </>
      )}
    </div>
  )
}
