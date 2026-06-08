import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO, isToday, isYesterday, isTomorrow, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── DADOS DOS TIMES ──────────────────────────────────────────────
const TEAMS = {
  'Brazil':                { iso: 'br',     pt: 'Brasil',               shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/CBF_logo.svg/200px-CBF_logo.svg.png' },
  'Argentina':             { iso: 'ar',     pt: 'Argentina',            shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/AFA_logo.svg/200px-AFA_logo.svg.png' },
  'France':                { iso: 'fr',     pt: 'França',               shield: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/FFF_logo_2022.svg/200px-FFF_logo_2022.svg.png' },
  'Germany':               { iso: 'de',     pt: 'Alemanha',             shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/DFB-Logo_2024.svg/200px-DFB-Logo_2024.svg.png' },
  'Spain':                 { iso: 'es',     pt: 'Espanha',              shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/RFEF2021.svg/200px-RFEF2021.svg.png' },
  'England':               { iso: 'gb-eng', pt: 'Inglaterra',           shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Three_Lions_on_a_shield.svg/200px-Three_Lions_on_a_shield.svg.png' },
  'Portugal':              { iso: 'pt',     pt: 'Portugal',             shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/FPF_logo_2022.svg/200px-FPF_logo_2022.svg.png' },
  'Netherlands':           { iso: 'nl',     pt: 'Holanda',              shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/KNVB_logo.svg/200px-KNVB_logo.svg.png' },
  'Italy':                 { iso: 'it',     pt: 'Itália',               shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FIGC_logo_2023.svg/200px-FIGC_logo_2023.svg.png' },
  'Uruguay':               { iso: 'uy',     pt: 'Uruguai',              shield: null },
  'Colombia':              { iso: 'co',     pt: 'Colômbia',             shield: null },
  'Mexico':                { iso: 'mx',     pt: 'México',               shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/FMF_logo.svg/200px-FMF_logo.svg.png' },
  'United States':         { iso: 'us',     pt: 'EUA',                  shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/USSF_logo.svg/200px-USSF_logo.svg.png' },
  'USA':                   { iso: 'us',     pt: 'EUA',                  shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/USSF_logo.svg/200px-USSF_logo.svg.png' },
  'Canada':                { iso: 'ca',     pt: 'Canadá',               shield: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Canada_Soccer_Logo.svg/200px-Canada_Soccer_Logo.svg.png' },
  'Japan':                 { iso: 'jp',     pt: 'Japão',                shield: null },
  'South Korea':           { iso: 'kr',     pt: 'Coreia do Sul',        shield: null },
  'Korea Republic':        { iso: 'kr',     pt: 'Coreia do Sul',        shield: null },
  'Morocco':               { iso: 'ma',     pt: 'Marrocos',             shield: null },
  'Senegal':               { iso: 'sn',     pt: 'Senegal',              shield: null },
  'Ghana':                 { iso: 'gh',     pt: 'Gana',                 shield: null },
  'Nigeria':               { iso: 'ng',     pt: 'Nigéria',              shield: null },
  'Australia':             { iso: 'au',     pt: 'Austrália',            shield: null },
  'Saudi Arabia':          { iso: 'sa',     pt: 'Arábia Saudita',       shield: null },
  'Iran':                  { iso: 'ir',     pt: 'Irã',                  shield: null },
  'IR Iran':               { iso: 'ir',     pt: 'Irã',                  shield: null },
  'Qatar':                 { iso: 'qa',     pt: 'Catar',                shield: null },
  'Croatia':               { iso: 'hr',     pt: 'Croácia',              shield: null },
  'Serbia':                { iso: 'rs',     pt: 'Sérvia',               shield: null },
  'Switzerland':           { iso: 'ch',     pt: 'Suíça',                shield: null },
  'Belgium':               { iso: 'be',     pt: 'Bélgica',              shield: null },
  'Denmark':               { iso: 'dk',     pt: 'Dinamarca',            shield: null },
  'Poland':                { iso: 'pl',     pt: 'Polônia',              shield: null },
  'Cameroon':              { iso: 'cm',     pt: 'Camarões',             shield: null },
  'Ecuador':               { iso: 'ec',     pt: 'Equador',              shield: null },
  'Tunisia':               { iso: 'tn',     pt: 'Tunísia',              shield: null },
  'Costa Rica':            { iso: 'cr',     pt: 'Costa Rica',           shield: null },
  'Wales':                 { iso: 'gb-wls', pt: 'País de Gales',        shield: null },
  'Chile':                 { iso: 'cl',     pt: 'Chile',                shield: null },
  'Peru':                  { iso: 'pe',     pt: 'Peru',                 shield: null },
  'Paraguay':              { iso: 'py',     pt: 'Paraguai',             shield: null },
  'Venezuela':             { iso: 've',     pt: 'Venezuela',            shield: null },
  'Bolivia':               { iso: 'bo',     pt: 'Bolívia',              shield: null },
  'Austria':               { iso: 'at',     pt: 'Áustria',              shield: null },
  'Turkey':                { iso: 'tr',     pt: 'Turquia',              shield: null },
  'Ukraine':               { iso: 'ua',     pt: 'Ucrânia',              shield: null },
  'Honduras':              { iso: 'hn',     pt: 'Honduras',             shield: null },
  'Panama':                { iso: 'pa',     pt: 'Panamá',               shield: null },
  'Jamaica':               { iso: 'jm',     pt: 'Jamaica',              shield: null },
  'Slovakia':              { iso: 'sk',     pt: 'Eslováquia',           shield: null },
  'Romania':               { iso: 'ro',     pt: 'Romênia',              shield: null },
  'Hungary':               { iso: 'hu',     pt: 'Hungria',              shield: null },
  'Czechia':               { iso: 'cz',     pt: 'Rep. Tcheca',          shield: null },
  'Czech Republic':        { iso: 'cz',     pt: 'Rep. Tcheca',          shield: null },
  'Slovenia':              { iso: 'si',     pt: 'Eslovênia',            shield: null },
  'Algeria':               { iso: 'dz',     pt: 'Argélia',              shield: null },
  'Egypt':                 { iso: 'eg',     pt: 'Egito',                shield: null },
  'New Zealand':           { iso: 'nz',     pt: 'Nova Zelândia',        shield: null },
  "Côte d'Ivoire":         { iso: 'ci',     pt: 'Costa do Marfim',      shield: null },
  'Ivory Coast':           { iso: 'ci',     pt: 'Costa do Marfim',      shield: null },
  'Guatemala':             { iso: 'gt',     pt: 'Guatemala',            shield: null },
  'El Salvador':           { iso: 'sv',     pt: 'El Salvador',          shield: null },
  'South Africa':          { iso: 'za',     pt: 'África do Sul',        shield: null },
  'Bosnia and Herzegovina':{ iso: 'ba',     pt: 'Bósnia e Herzegovina', shield: null },
  'Bosnia & Herzegovina':  { iso: 'ba',     pt: 'Bósnia e Herzegovina', shield: null },
  'Haiti':                 { iso: 'ht',     pt: 'Haiti',                shield: null },
  'Curaçao':               { iso: 'cw',     pt: 'Curaçao',              shield: null },
  'Curacao':               { iso: 'cw',     pt: 'Curaçao',              shield: null },
  'Cape Verde':            { iso: 'cv',     pt: 'Cabo Verde',           shield: null },
  'Cape Verde Islands':    { iso: 'cv',     pt: 'Cabo Verde',           shield: null },
  'Congo DR':              { iso: 'cd',     pt: 'Congo RD',             shield: null },
  'DR Congo':              { iso: 'cd',     pt: 'Congo RD',             shield: null },
  'Scotland':              { iso: 'gb-sct', pt: 'Escócia',              shield: null },
  'Northern Ireland':      { iso: 'gb-nir', pt: 'Irlanda do Norte',     shield: null },
  'Ireland':               { iso: 'ie',     pt: 'Irlanda',              shield: null },
  'Greece':                { iso: 'gr',     pt: 'Grécia',               shield: null },
  'Norway':                { iso: 'no',     pt: 'Noruega',              shield: null },
  'Sweden':                { iso: 'se',     pt: 'Suécia',               shield: null },
  'Finland':               { iso: 'fi',     pt: 'Finlândia',            shield: null },
  'Albania':               { iso: 'al',     pt: 'Albânia',              shield: null },
  'North Macedonia':       { iso: 'mk',     pt: 'Macedônia do Norte',   shield: null },
  'Montenegro':            { iso: 'me',     pt: 'Montenegro',           shield: null },
  'Georgia':               { iso: 'ge',     pt: 'Geórgia',              shield: null },
  'Kosovo':                { iso: 'xk',     pt: 'Kosovo',               shield: null },
  'Trinidad and Tobago':   { iso: 'tt',     pt: 'Trinidad e Tobago',    shield: null },
  'Cuba':                  { iso: 'cu',     pt: 'Cuba',                 shield: null },
  'Nicaragua':             { iso: 'ni',     pt: 'Nicarágua',            shield: null },
  'Suriname':              { iso: 'sr',     pt: 'Suriname',             shield: null },
  'Guyana':                { iso: 'gy',     pt: 'Guiana',               shield: null },
  'Kenya':                 { iso: 'ke',     pt: 'Quênia',               shield: null },
  'Tanzania':              { iso: 'tz',     pt: 'Tanzânia',             shield: null },
  'Uganda':                { iso: 'ug',     pt: 'Uganda',               shield: null },
  'Mali':                  { iso: 'ml',     pt: 'Mali',                 shield: null },
  'Mozambique':            { iso: 'mz',     pt: 'Moçambique',           shield: null },
  'Angola':                { iso: 'ao',     pt: 'Angola',               shield: null },
  'Zambia':                { iso: 'zm',     pt: 'Zâmbia',               shield: null },
  'Zimbabwe':              { iso: 'zw',     pt: 'Zimbábue',             shield: null },
  'Togo':                  { iso: 'tg',     pt: 'Togo',                 shield: null },
  'Benin':                 { iso: 'bj',     pt: 'Benin',                shield: null },
  'Guinea':                { iso: 'gn',     pt: 'Guiné',                shield: null },
  'Burkina Faso':          { iso: 'bf',     pt: 'Burkina Faso',         shield: null },
  'Ethiopia':              { iso: 'et',     pt: 'Etiópia',              shield: null },
  'Namibia':               { iso: 'na',     pt: 'Namíbia',              shield: null },
  'Mauritania':            { iso: 'mr',     pt: 'Mauritânia',           shield: null },
  'Thailand':              { iso: 'th',     pt: 'Tailândia',            shield: null },
  'Vietnam':               { iso: 'vn',     pt: 'Vietnã',               shield: null },
  'Indonesia':             { iso: 'id',     pt: 'Indonésia',            shield: null },
  'Philippines':           { iso: 'ph',     pt: 'Filipinas',            shield: null },
  'Malaysia':              { iso: 'my',     pt: 'Malásia',              shield: null },
  'China':                 { iso: 'cn',     pt: 'China',                shield: null },
  'India':                 { iso: 'in',     pt: 'Índia',                shield: null },
  'Uzbekistan':            { iso: 'uz',     pt: 'Uzbequistão',          shield: null },
  'Kazakhstan':            { iso: 'kz',     pt: 'Cazaquistão',          shield: null },
  'Iraq':                  { iso: 'iq',     pt: 'Iraque',               shield: null },
  'Jordan':                { iso: 'jo',     pt: 'Jordânia',             shield: null },
  'United Arab Emirates':  { iso: 'ae',     pt: 'Emirados Árabes',      shield: null },
  'UAE':                   { iso: 'ae',     pt: 'Emirados Árabes',      shield: null },
  'Oman':                  { iso: 'om',     pt: 'Omã',                  shield: null },
  'Kuwait':                { iso: 'kw',     pt: 'Kuwait',               shield: null },
  'Bahrain':               { iso: 'bh',     pt: 'Bahrein',              shield: null },
}

function getTeam(name) {
  return TEAMS[name] || { iso: null, pt: name, shield: null }
}

function getFlagUrl(name) {
  const t = getTeam(name)
  return t.iso ? `https://flagcdn.com/w160/${t.iso}.png` : null
}

// ── COMPONENTES VISUAIS ──────────────────────────────────────────

// Bolinha: bandeira na frente + escudo de fundo
function TeamCircle({ name, size = 44 }) {
  const team = getTeam(name)
  const flagUrl = team.iso ? `https://flagcdn.com/w160/${team.iso}.png` : null
  const shieldUrl = team.shield

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '1.5px solid rgba(255,255,255,0.12)',
      background: '#0d1117',
    }}>
      {shieldUrl && (
        <img src={shieldUrl} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'contain', opacity: 0.22, padding: '4px',
        }} onError={e => { e.target.style.display = 'none' }} />
      )}
      {flagUrl ? (
        <img src={flagUrl} alt={name} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.9,
        }} onError={e => { e.target.style.display = 'none' }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42,
        }}>🏳️</div>
      )}
    </div>
  )
}

// Fundo do card: escudo da seleção (se tiver) ou bandeira
function CardBg({ name, side }) {
  const team = getTeam(name)
  const shieldUrl = team.shield
  const flagUrl = team.iso ? `https://flagcdn.com/w160/${team.iso}.png` : null
  const url = shieldUrl || flagUrl

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0,
      width: '55%', overflow: 'hidden', pointerEvents: 'none',
    }}>
      {url && (
        <img src={url} alt="" style={{
          position: 'absolute', top: '50%',
          [side]: shieldUrl ? '5%' : '-5%',
          transform: 'translateY(-50%)',
          width: shieldUrl ? '70%' : '130%',
          height: shieldUrl ? '70%' : '130%',
          objectFit: shieldUrl ? 'contain' : 'cover',
          opacity: shieldUrl ? 0.12 : 0.07,
          filter: shieldUrl ? 'none' : 'saturate(1.5) blur(1px)',
        }} onError={e => { e.target.style.display = 'none' }} />
      )}
    </div>
  )
}

// ── MATCH CARD (estilo Apple Sports) ────────────────────────────
function MatchCard({ match }) {
  const finished = match.status === 'finished'
  const live = match.status === 'live'
  const home = getTeam(match.home_team)
  const away = getTeam(match.away_team)

  return (
    <div style={{
      position: 'relative',
      background: live ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${live ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '14px', overflow: 'hidden',
      padding: '0',
      transition: 'border-color 0.2s, transform 0.15s',
    }}>
      <CardBg name={match.home_team} side="left" />
      <CardBg name={match.away_team} side="right" />

      <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
        {/* Topo: grupo/fase + live */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 600, color: 'rgba(240,244,255,0.35)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {match.stage}{match.group_name ? ` · ${match.group_name}` : ''}
          </span>
          {live && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#ef4444', fontWeight: 700, letterSpacing: '0.06em' }}>
              <div className="live-dot" /> AO VIVO
            </span>
          )}
        </div>

        {/* Times */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Casa */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
            <TeamCircle name={match.home_team} size={46} />
            <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text-primary)', maxWidth: '80px' }}>
              {home.pt}
            </span>
          </div>

          {/* Placar / Horário */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0, minWidth: '72px' }}>
            {finished ? (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.04em', lineHeight: 1, color: 'var(--text-primary)' }}>
                {match.home_score}<span style={{ color: 'rgba(240,244,255,0.25)', margin: '0 4px', fontSize: '22px' }}>–</span>{match.away_score}
              </div>
            ) : live ? (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.04em', lineHeight: 1, color: '#ef4444' }}>
                {match.home_score ?? 0}<span style={{ color: 'rgba(239,68,68,0.4)', margin: '0 4px', fontSize: '22px' }}>–</span>{match.away_score ?? 0}
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.04em', lineHeight: 1, color: 'var(--accent-gold-bright)' }}>
                {format(parseISO(match.match_date), 'HH:mm')}
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {finished ? 'Encerrado' : live ? 'Ao vivo' : format(parseISO(match.match_date), 'dd/MM')}
            </div>
          </div>

          {/* Fora */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
            <TeamCircle name={match.away_team} size={46} />
            <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text-primary)', maxWidth: '80px' }}>
              {away.pt}
            </span>
          </div>
        </div>

        {/* Link ao vivo */}
        {live && match.stream_url && (
          <a href={match.stream_url} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '12px', padding: '8px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: '12px', fontWeight: 700, textDecoration: 'none',
            letterSpacing: '0.04em',
          }}>
            📺 Assistir na CazéTV
          </a>
        )}
      </div>
    </div>
  )
}

// ── TABS ONTEM / HOJE / PRÓXIMOS ─────────────────────────────────
function getTabMatches(matches, tab) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  if (tab === 'ontem') {
    return matches.filter(m => {
      const d = parseISO(m.match_date)
      return d >= yesterdayStart && d < todayStart
    })
  }
  if (tab === 'hoje') {
    return matches.filter(m => {
      const d = parseISO(m.match_date)
      return d >= todayStart && d < todayEnd
    })
  }
  if (tab === 'proximos') {
    return matches.filter(m => parseISO(m.match_date) >= todayEnd)
  }
  return []
}

// ── STATS TAB ────────────────────────────────────────────────────
function StatsTab() {
  const [scorers, setScorers] = useState([])
  const [assists, setAssists] = useState([])
  const [statsTab, setStatsTab] = useState('scorers')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('top_scorers').select('*').order('goals', { ascending: false }).limit(10),
      supabase.from('top_assists').select('*').order('assists', { ascending: false }).limit(10),
    ]).then(([s, a]) => {
      setScorers(s.data || [])
      setAssists(a.data || [])
      setLoading(false)
    })
  }, [])

  const data = statsTab === 'scorers' ? scorers : assists
  const key = statsTab === 'scorers' ? 'goals' : 'assists'
  const label = statsTab === 'scorers' ? 'gols' : 'assist.'
  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '16px' }}>
        {[['scorers', '⚽ Artilheiros'], ['assists', '👟 Assistências']].map(([k, l]) => (
          <button key={k} onClick={() => setStatsTab(k)} style={{
            flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            background: statsTab === k ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: statsTab === k ? 'var(--text-primary)' : 'var(--text-muted)',
          }}>{l}</button>
        ))}
      </div>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 10 }} />)
        : data.length === 0
          ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '14px' }}>Disponível após o início da Copa.</div>
          : data.map((p, i) => (
            <div key={p.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: 24, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '16px', color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', flexShrink: 0 }}>
                {i < 3 ? MEDALS[i] : `${i + 1}º`}
              </div>
              {p.photo_url
                ? <img src={p.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{p.flag_emoji || '⚽'}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.flag_emoji} {p.team_name}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '0.04em', lineHeight: 1 }}>{p[key]}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
              </div>
            </div>
          ))
      }
    </div>
  )
}

// ── PAGE PRINCIPAL ───────────────────────────────────────────────
export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('jogos')
  const [dayTab, setDayTab] = useState('hoje')

  useEffect(() => {
    // Decide tab inicial: se hoje não tem jogos, vai pra próximos
    supabase.from('matches').select('*').order('match_date').then(({ data }) => {
      const all = data || []
      setMatches(all)
      setLoading(false)
      const hoje = getTabMatches(all, 'hoje')
      if (hoje.length === 0) setDayTab('proximos')
    })
  }, [])

  const tabMatches = useMemo(() => getTabMatches(matches, dayTab), [matches, dayTab])

  // Agrupa por data dentro da tab
  const grouped = useMemo(() => {
    const g = {}
    tabMatches.forEach(m => {
      const d = format(parseISO(m.match_date), "EEE., dd 'de' MMM.", { locale: ptBR })
      if (!g[d]) g[d] = []
      g[d].push(m)
    })
    return g
  }, [tabMatches])

  const TABS_MAIN = [['jogos', '⚽ Jogos'], ['stats', '📊 Artilheiros']]
  const TABS_DAY = [['ontem', 'Ontem'], ['hoje', 'Hoje'], ['proximos', 'Próximos']]

  return (
    <div className="page">
      {/* Tabs principais */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '16px', gap: '4px' }}>
        {TABS_MAIN.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
            transition: 'all 0.2s',
            background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'stats' ? <StatsTab /> : (
        <>
          {/* Tabs Ontem / Hoje / Próximos */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px', gap: '0' }}>
            {TABS_DAY.map(([key, label]) => (
              <button key={key} onClick={() => setDayTab(key)} style={{
                flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                background: 'transparent',
                color: dayTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: `2px solid ${dayTab === key ? 'var(--accent-gold)' : 'transparent'}`,
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}>{label}</button>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 130, marginBottom: 10, borderRadius: 14 }} />
            ))
          ) : tabMatches.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '14px' }}>
              {dayTab === 'ontem' ? 'Nenhum jogo ontem.' : dayTab === 'hoje' ? 'Nenhum jogo hoje.' : 'Nenhum jogo futuro cadastrado.'}
            </div>
          ) : (
            Object.entries(grouped).map(([date, dayMatches]) => (
              <div key={date} style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 700,
                  color: 'rgba(212,168,50,0.7)',
                  textTransform: 'capitalize', letterSpacing: '0.08em',
                  marginBottom: '10px', paddingLeft: '2px',
                }}>
                  {date}
                </div>
                <div className="matches-grid">
                  {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
