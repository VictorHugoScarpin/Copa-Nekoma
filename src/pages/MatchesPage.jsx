import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  'South Africa': 'za', 'Bosnia and Herzegovina': 'ba', 'Bosnia & Herzegovina': 'ba',
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
}

function getFlagUrl(name) {
  const iso = TEAM_ISO[name]
  return iso ? `https://flagcdn.com/w160/${iso}.png` : null
}

function getPT(name) {
  return TEAM_PT[name] || name
}

// Bolinha: bandeira na frente + escudo de fundo (do banco)
function TeamCircle({ name, shieldUrl, size = 46 }) {
  const flagUrl = getFlagUrl(name)

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '1.5px solid rgba(255,255,255,0.12)',
      background: 'var(--deep)',
    }}>
      {/* Escudo de fundo */}
      {shieldUrl && (
        <img src={shieldUrl} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'contain', opacity: 0.22, padding: '4px',
        }} onError={e => { e.target.style.display = 'none' }} />
      )}
      {/* Bandeira na frente */}
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

// Fundo do card: escudo oficial (do banco) com opacidade
function CardBg({ name, shieldUrl, flagUrl, side }) {
  const url = shieldUrl || flagUrl

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, [side]: 0,
      width: '55%', overflow: 'hidden', pointerEvents: 'none',
    }}>
      {url && (
        <img src={url} alt="" style={{
          position: 'absolute', top: '50%',
          [side]: shieldUrl ? '8%' : '-5%',
          transform: 'translateY(-50%)',
          width: shieldUrl ? '65%' : '130%',
          height: shieldUrl ? '65%' : '130%',
          objectFit: shieldUrl ? 'contain' : 'cover',
          opacity: shieldUrl ? 0.13 : 0.07,
          filter: shieldUrl ? 'none' : 'saturate(1.5) blur(1px)',
        }} onError={e => { e.target.style.display = 'none' }} />
      )}
    </div>
  )
}

function MatchCard({ match }) {
  const finished = match.status === 'finished'
  const live = match.status === 'live'

  const homeFlagUrl = getFlagUrl(match.home_team)
  const awayFlagUrl = getFlagUrl(match.away_team)

  return (
    <div style={{
      position: 'relative',
      background: live ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${live ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '14px', overflow: 'hidden', padding: '0',
      transition: 'border-color 0.2s',
    }}>
      <CardBg name={match.home_team} shieldUrl={match.home_shield} flagUrl={homeFlagUrl} side="left" />
      <CardBg name={match.away_team} shieldUrl={match.away_shield} flagUrl={awayFlagUrl} side="right" />

      <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
        {/* Topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 600,
            color: 'rgba(240,244,255,0.35)',
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
            <TeamCircle name={match.home_team} shieldUrl={match.home_shield} size={46} />
            <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text)', maxWidth: '80px' }}>
              {getPT(match.home_team)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0, minWidth: '72px' }}>
            {finished ? (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.04em', lineHeight: 1 }}>
                {match.home_score}<span style={{ color: 'rgba(240,244,255,0.25)', margin: '0 4px', fontSize: '22px' }}>–</span>{match.away_score}
              </div>
            ) : live ? (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '0.04em', lineHeight: 1, color: '#ef4444' }}>
                {match.home_score ?? 0}<span style={{ color: 'rgba(239,68,68,0.4)', margin: '0 4px', fontSize: '22px' }}>–</span>{match.away_score ?? 0}
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.04em', lineHeight: 1, color: 'var(--gold-bright)' }}>
                {format(parseISO(match.match_date), 'HH:mm')}
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'rgba(240,244,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {finished ? 'Encerrado' : live ? 'Ao vivo' : format(parseISO(match.match_date), 'dd/MM')}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
            <TeamCircle name={match.away_team} shieldUrl={match.away_shield} size={46} />
            <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2, color: 'var(--text)', maxWidth: '80px' }}>
              {getPT(match.away_team)}
            </span>
          </div>
        </div>

        {live && match.stream_url && (
          <a href={match.stream_url} target="_blank" rel="noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '12px', padding: '8px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: '12px', fontWeight: 700, textDecoration: 'none',
          }}>
            📺 Assistir na CazéTV
          </a>
        )}
      </div>
    </div>
  )
}

function getTabMatches(matches, tab) {
  const todayStart = startOfDay(new Date())
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  if (tab === 'ontem') return matches.filter(m => { const d = parseISO(m.match_date); return d >= yesterdayStart && d < todayStart })
  if (tab === 'hoje') return matches.filter(m => { const d = parseISO(m.match_date); return d >= todayStart && d < todayEnd })
  if (tab === 'proximos') return matches.filter(m => parseISO(m.match_date) >= todayEnd)
  return []
}

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
          <button key={k} onClick={() => setStatsTab(k)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, background: statsTab === k ? 'rgba(255,255,255,0.1)' : 'transparent', color: statsTab === k ? 'var(--text)' : 'var(--text-3)' }}>{l}</button>
        ))}
      </div>
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 10 }} />)
        : data.length === 0
          ? <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: '14px' }}>Disponível após o início da Copa.</div>
          : data.map((p, i) => (
            <div key={p.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: 24, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '16px', color: i < 3 ? 'var(--gold)' : 'var(--text-3)', flexShrink: 0 }}>{i < 3 ? MEDALS[i] : `${i + 1}º`}</div>
              {p.photo_url ? <img src={p.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} /> : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{p.flag_emoji || '⚽'}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{p.flag_emoji} {p.team_name}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>{p[key]}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</div>
              </div>
            </div>
          ))
      }
    </div>
  )
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('jogos')
  const [dayTab, setDayTab] = useState('hoje')

  useEffect(() => {
    supabase.from('matches').select('*').order('match_date').then(({ data }) => {
      const all = data || []
      setMatches(all)
      setLoading(false)
      if (getTabMatches(all, 'hoje').length === 0) setDayTab('proximos')
    })
  }, [])

  const tabMatches = useMemo(() => getTabMatches(matches, dayTab), [matches, dayTab])

  const grouped = useMemo(() => {
    const g = {}
    tabMatches.forEach(m => {
      const d = format(parseISO(m.match_date), "EEE., dd 'de' MMM.", { locale: ptBR })
      if (!g[d]) g[d] = []
      g[d].push(m)
    })
    return g
  }, [tabMatches])

  return (
    <div className="page">
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '16px', gap: '4px' }}>
        {[['jogos', '⚽ Jogos'], ['stats', '📊 Artilheiros']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text)' : 'var(--text-3)' }}>{label}</button>
        ))}
      </div>

      {tab === 'stats' ? <StatsTab /> : (
        <>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
            {[['ontem', 'Ontem'], ['hoje', 'Hoje'], ['proximos', 'Próximos']].map(([key, label]) => (
              <button key={key} onClick={() => setDayTab(key)} style={{
                flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                background: 'transparent',
                color: dayTab === key ? 'var(--text)' : 'var(--text-3)',
                borderBottom: `2px solid ${dayTab === key ? 'var(--gold)' : 'transparent'}`,
                transition: 'all 0.2s', letterSpacing: '0.02em',
              }}>{label}</button>
            ))}
          </div>

          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 130, marginBottom: 10, borderRadius: 14 }} />)
            : tabMatches.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '60px 0', fontSize: '14px' }}>
                  {dayTab === 'ontem' ? 'Nenhum jogo ontem.' : dayTab === 'hoje' ? 'Nenhum jogo hoje.' : 'Nenhum jogo futuro cadastrado.'}
                </div>
              : Object.entries(grouped).map(([date, dayMatches]) => (
                <div key={date} style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(212,168,50,0.7)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '10px', paddingLeft: '2px' }}>
                    {date}
                  </div>
                  <div className="matches-grid">
                    {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
                  </div>
                </div>
              ))
          }
        </>
      )}
    </div>
  )
}
