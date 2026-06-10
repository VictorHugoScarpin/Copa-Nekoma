import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, differenceInSeconds, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const LOCK_SECS = 60

// ── Mapas idênticos ao MatchesPage ──────────────────────────────────────────

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
  'Guatemala': 'gt', 'El Salvador': 'sv',
  'South Africa': 'za',
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

// Bolinha: bandeira, cover 100%
function TeamCircle({ name, size = 46 }) {
  const flagUrl = getFlagUrl(name)
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.18)',
      background: 'var(--surface)',
    }}>
      {flagUrl
        ? <img src={flagUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42 }}>🏳️</div>
      }
    </div>
  )
}

// Fundo do card: bandeira preenchendo cada lado com fade no centro
function CardBg({ name, side }) {
  const flagUrl = getFlagUrl(name)
  if (!flagUrl) return null
  const gradientDir = side === 'left' ? 'to right' : 'to left'
  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0,
      width: '50%', overflow: 'hidden', pointerEvents: 'none',
    }}>
      <img src={flagUrl} alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', opacity: 0.18, filter: 'saturate(1.4)',
      }} onError={e => { e.target.style.display = 'none' }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(${gradientDir}, transparent 20%, rgba(6,11,20,0.85) 100%)`,
      }} />
    </div>
  )
}

// ── Utilitários ──────────────────────────────────────────────────────────────

function isLocked(dateStr) { return differenceInSeconds(parseISO(dateStr), new Date()) <= LOCK_SECS }

function countdown(dateStr) {
  const diff = differenceInSeconds(parseISO(dateStr), new Date())
  if (diff <= 0) return null
  if (diff > 3600) return format(parseISO(dateStr), "HH:mm", { locale: ptBR })
  const m = Math.floor(diff / 60), s = diff % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

// ── ResenhaList ──────────────────────────────────────────────────────────────

function ResenhaList({ matchId, matchHomeScore, matchAwayScore }) {
  const [guesses, setGuesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('guesses').select('*, profiles(display_name)').eq('match_id', matchId)
      .then(({ data }) => { setGuesses(data || []); setLoading(false) })
  }, [matchId])

  if (loading) return <div className="skeleton" style={{ height: 32, borderRadius: 6 }} />
  if (guesses.length === 0) return <div style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', padding: '6px 0' }}>Nenhum palpite registrado.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {guesses.map(g => {
        const ok = g.home_score === matchHomeScore && g.away_score === matchAwayScore
        return (
          <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: ok ? 'var(--green-dim)' : 'var(--red-dim)' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{g.profiles?.display_name}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: ok ? 'var(--green)' : 'var(--red)', letterSpacing: '0.06em' }}>{g.home_score} × {g.away_score}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── GuessCard ────────────────────────────────────────────────────────────────

function GuessCard({ match, myGuess, onSave }) {
  const finished = match.status === 'finished'
  const live = match.status === 'live'

  const [expanded, setExpanded] = useState(finished)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [home, setHome] = useState(myGuess?.home_score ?? '')
  const [away, setAway] = useState(myGuess?.away_score ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const locked = isLocked(match.match_date)
  const correct = finished && myGuess && myGuess.home_score === match.home_score && myGuess.away_score === match.away_score
  const wrong = finished && myGuess && !correct
  const cd = countdown(match.match_date)

  async function save() {
    if (locked || saving || home === '' || away === '') return
    setSaving(true)
    await onSave(match.id, parseInt(home), parseInt(away), myGuess)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const borderColor = finished
    ? correct ? 'rgba(34,197,94,0.4)' : wrong ? 'rgba(239,68,68,0.35)' : 'var(--border)'
    : live ? 'rgba(239,68,68,0.3)' : 'var(--border)'

  const bgColor = finished
    ? correct ? 'rgba(34,197,94,0.06)' : wrong ? 'rgba(239,68,68,0.06)' : 'var(--surface)'
    : live ? 'rgba(239,68,68,0.04)' : 'var(--surface)'

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: bgColor, border: `1px solid ${borderColor}`,
      borderRadius: '14px', marginBottom: '10px',
    }}>
      <CardBg name={match.home_team} side="left" />
      <CardBg name={match.away_team} side="right" />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 80% at 50% 50%, rgba(6,11,20,0.55) 0%, transparent 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header clicável */}
        <div
          onClick={() => !finished && setExpanded(e => !e)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: finished ? 'default' : 'pointer' }}
        >
          {/* Times no header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            {/* Time casa — largura fixa para alinhar bolinha */}
            <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <TeamCircle name={match.home_team} size={28} />
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-2)', width: 72, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getPT(match.home_team)}
              </span>
            </div>

            {/* Horário/placar no centro */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: finished ? 0 : '12px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: finished ? '20px' : '13px', color: finished ? 'var(--text)' : 'var(--gold)', letterSpacing: '0.04em', flexShrink: 0 }}>
                {finished ? `${match.home_score} × ${match.away_score}` : (live ? '🔴' : cd || '–')}
              </span>
            </div>

            {/* Time fora — largura fixa para alinhar bolinha */}
            <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <TeamCircle name={match.away_team} size={28} />
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-2)', width: 72, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getPT(match.away_team)}
              </span>
            </div>
          </div>

          {/* Badges + ações */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {finished
              ? <span className={`badge ${correct ? 'badge-green' : 'badge-red'}`}>{correct ? `✓ +${myGuess?.points_earned || 0}pts` : '✗ Erro'}</span>
              : locked ? <span className="badge badge-muted" style={{ fontSize: '9px' }}>🔒</span>
              : myGuess?.home_score !== undefined ? <span className="badge badge-gold">✓ {myGuess.home_score}×{myGuess.away_score}</span>
              : <span className="badge badge-muted" style={{ fontSize: '9px' }}>sem palpite</span>
            }
            <button
              onClick={e => { e.stopPropagation(); setPopoverOpen(o => !o) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: popoverOpen ? 'var(--gold)' : 'var(--text-3)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}
            >
              {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />)}
            </button>
            {!finished && (
              <span style={{ color: 'var(--text-3)', fontSize: '12px', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
            )}
          </div>
        </div>

        {/* Popover palpites da galera */}
        {popoverOpen && (
          <div style={{ margin: '0 16px 12px', background: 'rgba(6,11,20,0.95)', border: '1px solid var(--border-strong)', borderRadius: 'var(--r-md)', padding: '10px 12px', animation: 'fadeUp 0.15s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Palpites da galera</span>
              <button onClick={() => setPopoverOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '14px' }}>×</button>
            </div>
            <ResenhaList matchId={match.id} matchHomeScore={match.home_score} matchAwayScore={match.away_score} />
          </div>
        )}

        {/* Corpo expandido */}
        {expanded && (
          <div style={{ padding: '0 16px 14px', animation: 'fadeUp 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <TeamCircle name={match.home_team} size={44} />
                <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text-2)' }}>
                  {getPT(match.home_team)}
                </span>
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
                <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text-2)' }}>
                  {getPT(match.away_team)}
                </span>
              </div>
            </div>

            {!locked && !finished && (
              <button className={`btn ${saved ? 'btn-primary' : ''}`} style={{ padding: '9px', fontSize: '13px' }} onClick={save} disabled={saving || home === '' || away === ''}>
                {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Palpite'}
              </button>
            )}

            {finished && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '6px' }}>Resenha</div>
                <ResenhaList matchId={match.id} matchHomeScore={match.home_score} matchAwayScore={match.away_score} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── MasterGuess ──────────────────────────────────────────────────────────────

function MasterGuess({ userId }) {
  const [t1, setT1] = useState('')
  const [t2, setT2] = useState('')
  const [saved, setSaved] = useState(false)
  const [existing, setExisting] = useState(null)
  const locked = new Date() >= new Date('2026-06-11T00:00:00')

  useEffect(() => {
    supabase.from('master_guess').select('*').eq('user_id', userId).single()
      .then(({ data }) => { if (data) { setExisting(data); setT1(data.team1); setT2(data.team2) } })
  }, [userId])

  async function saveMaster() {
    if (!t1.trim() || !t2.trim() || t1 === t2) return
    if (existing) await supabase.from('master_guess').update({ team1: t1.trim(), team2: t2.trim() }).eq('user_id', userId)
    else await supabase.from('master_guess').insert({ user_id: userId, team1: t1.trim(), team2: t2.trim() })
    setExisting({ team1: t1.trim(), team2: t2.trim() })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="glass-card" style={{ padding: '14px 16px', marginBottom: '18px', border: '1px solid rgba(212,168,50,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span>🏆</span>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', letterSpacing: '0.06em', color: 'var(--gold)' }}>PALPITE MESTRE</div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '10px', lineHeight: 1.5 }}>
        Finalistas? Um certo = <strong style={{ color: 'var(--gold)' }}>+4pts</strong> · Dois certos = <strong style={{ color: 'var(--gold)' }}>+8pts</strong> · Bloqueado em 11/Jun
      </div>
      {locked ? (
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--r-sm)', fontSize: '13px', color: 'var(--text-2)', textAlign: 'center' }}>
          🔒 {existing ? `${existing.team1} × ${existing.team2}` : 'Sem palpite registrado'}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <input className="input" value={t1} onChange={e => setT1(e.target.value)} placeholder="Time 1" style={{ flex: 1, padding: '9px 10px', fontSize: '13px', minWidth: 0 }} />
          <input className="input" value={t2} onChange={e => setT2(e.target.value)} placeholder="Time 2" style={{ flex: 1, padding: '9px 10px', fontSize: '13px', minWidth: 0 }} />
          <button className={`btn ${saved ? 'btn-primary' : ''}`} onClick={saveMaster} disabled={!t1.trim() || !t2.trim() || t1 === t2} style={{ width: 'auto', padding: '9px 14px', fontSize: '13px', flexShrink: 0 }}>
            {saved ? '✓' : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── RegrasTab ────────────────────────────────────────────────────────────────

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
          { icon: '🏆', label: 'Dois finalistas certos', pts: '+8' },
          { icon: '🥈', label: 'Um finalista certo', pts: '+4' },
          { icon: '❌', label: 'Errou os dois', pts: '0' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <div style={{ flex: 1, fontSize: '13px' }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)' }}>{item.pts}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.7 }}>
          🔒 <strong style={{ color: 'var(--text-2)' }}>Trava de 1 minuto:</strong> palpites bloqueados automaticamente 1 minuto antes do apito inicial.
        </div>
      </div>
    </div>
  )
}

// ── GuessesPage ──────────────────────────────────────────────────────────────

export default function GuessesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [myGuesses, setMyGuesses] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('palpites')

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

  async function handleSave(matchId, homeScore, awayScore, existing) {
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
      <div className="section-title">Palpites</div>

      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '4px', marginBottom: '16px', gap: '4px' }}
        onTouchStart={e => { e.currentTarget._sx = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - (e.currentTarget._sx || 0)
          const tabs = ['palpites','regras']
          const cur = tabs.indexOf(tab)
          if (dx < -40 && cur < tabs.length - 1) setTab(tabs[cur + 1])
          if (dx > 40 && cur > 0) setTab(tabs[cur - 1])
        }}
      >
        {[['palpites', '⚽ Palpites'], ['regras', '📋 Regras']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text)' : 'var(--text-3)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'regras' ? <RegrasTab /> : (
        <>
          <MasterGuess userId={user.id} />
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8, borderRadius: 12 }} />)
            : matches.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0' }}>Nenhum jogo cadastrado ainda.</div>
              : Object.entries(grouped).map(([date, dayMatches]) => (
                <div key={date}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '8px', marginTop: '16px' }}>{date}</div>
                  {dayMatches.map(m => (
                    <GuessCard key={m.id} match={m} myGuess={myGuesses[m.id]} onSave={handleSave} />
                  ))}
                </div>
              ))
          }
        </>
      )}
    </div>
  )
}
