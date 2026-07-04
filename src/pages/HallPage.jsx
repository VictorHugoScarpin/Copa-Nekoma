import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  'Bosnia Herzegovina': 'ba', 'Bosna i Hercegovina': 'ba', 'Bosnia-Herzegovina': 'ba',
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
  'Bosnia Herzegovina': 'Bósnia e Herzegovina',
  'Bosna i Hercegovina': 'Bósnia e Herzegovina',
}

// Bandeiras salvas localmente em /public (para países com problema no flagcdn)
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

// Bolinha: sempre bandeira, cover 100% (igual MatchesPage)
function TeamCircle({ name, size = 32 }) {
  const flagUrl = getFlagUrl(name)
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.18)',
      background: 'var(--surface)',
    }}>
      {flagUrl ? (
        <img src={flagUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: size * 0.42 }}>🏳️</div>
      )}
    </div>
  )
}

function Avatar({ profile, size = 40 }) {
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-strong)' }} />
  }
  const initials = (profile.display_name || profile.nick || '?').slice(0, 2).toUpperCase()
  const colors = ['#f5c518', '#00c853', '#4d8ef0', '#f03e3e', '#a855f7']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}1a`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
      {initials}
    </div>
  )
}

function StatCard({ icon, title, subtitle, player, value, unit, color, rank }) {
  if (!player) return (
    <div className="glass-card" style={{ padding: '16px', opacity: 0.5 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={`/${icon}.png`} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '8px 0' }}>Sem dados ainda</div>
    </div>
  )

  return (
    <div className="glass-card" style={{ padding: '16px', border: `1px solid ${color}22` }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={`/${icon}.png`} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: `${color}0d`, borderRadius: 'var(--r-md)', border: `1px solid ${color}1a` }}>
        <Avatar profile={player} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {player.display_name || player.nick}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>@{player.nick}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color, letterSpacing: '0.04em', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{unit}</div>
        </div>
      </div>

      {rank && rank.slice(1, 3).length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {rank.slice(1, 3).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 2}º</span>
              <Avatar profile={p} size={24} />
              <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.display_name || p.nick}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{p._value} {unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ComoFunciona() {
  const [open, setOpen] = useState(false)

  const regras = [
    { icon: 'EMCHAMAS', title: 'Em Chamas', desc: 'Maior sequência de acertos consecutivos (placar exato ou resultado certo) nos jogos finalizados.' },
    { icon: 'PEQUENTE', title: 'Pé Quente', desc: 'Quem acertou mais placares exatos ao longo da Copa. Placar exato = 3 pontos.' },
    { icon: 'ZEBRA', title: 'Zebra', desc: 'Quem acertou o resultado de jogos que a maioria da galera errou. O visionário do grupo!' },
    { icon: 'CONSISTENTE', title: 'Consistente', desc: 'Melhor porcentagem de acertos (placar exato + resultado certo) em relação ao total de jogos palpitados. Mínimo de 3 jogos para entrar.' },
    { icon: 'MAISATIVO', title: 'Mais Ativo', desc: 'Quem mais registrou palpites no total, independente de acertos. Participação é tudo!' },
    { icon: 'DIPLOMATA', title: 'Diplomata', desc: 'Quem mais apostou em empate nos jogos. Acredita na paz entre as nações!' },
    { icon: 'AZARAO', title: 'Azarão', desc: 'Quem zerou mais vezes — palpites em jogos finalizados que não renderam nenhum ponto. Não é desonra, é azar mesmo!' },
  ]

  return (
    <div className="glass-card" style={{ marginTop: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>❓</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Como cada categoria é calculada?</span>
        </div>
        <span style={{ color: 'var(--text-3)', fontSize: 12, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.2s ease' }}>
          {regras.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12 }}>
              <img src={`/${icon}.png`} alt="" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function FlameIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0-6 5.686-6 10a6 6 0 0 0 12 0c0-1.312-.546-2.481-1-3.5C16 10 14 12 14 12s1-4-2-10z"/></svg> }
function TargetIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg> }
function ZebraIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> }
function ChartIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function BoltIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function HandIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg> }
function SkullIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.956-2.4l-1.536-7.68A5 5 0 0 0 7.58 9.92L6.044 17.6A2 2 0 0 0 8 20Z"/></svg> }

// Convenção do banco: 'LAST_N' = fase que decide quem sobra entre os últimos N times
// (ex: LAST_16 = jogos que reduzem o campo a 16 = "dezesseis-avos"/rodada de 32;
//  LAST_8 = oitavas de final; LAST_4 = quartas; LAST_2 = semifinal), seguido de 'Final'.
// A cadeia é sempre projetada até a final (16→8→4→2→1), mesmo que as fases mais
// avançadas ainda não tenham nenhum jogo cadastrado no banco — assim o chaveamento
// inteiro aparece de uma vez, com "A definir" nas caixinhas que ainda não têm confronto.
function buildStageChain(byStage) {
  const discovered = Object.keys(byStage)
    .map(s => { const m = /^LAST_(\d+)$/.exec(s); return m ? Number(m[1]) : null })
    .filter(Boolean)
  let n = discovered.length ? Math.max(...discovered) : 16
  const chain = []
  while (n >= 2) {
    chain.push(`LAST_${n}`)
    n = n / 2
  }
  chain.push('Final')
  return chain
}

const STAGE_LABEL_BY_N = { 32: 'Trinta e dois-avos', 16: 'Dezesseis-avos', 8: 'Oitavas de Final', 4: 'Quartas de Final', 2: 'Semifinal' }
function stageLabel(stage) {
  if (stage === 'Final') return 'Final'
  if (stage === '3º Lugar') return 'Disputa de 3º Lugar'
  const m = /^LAST_(\d+)$/.exec(stage)
  if (m) return STAGE_LABEL_BY_N[Number(m[1])] || stage
  return stage
}

export default function HallPage() {
  const [profiles, setProfiles] = useState([])
  const [guesses, setGuesses] = useState([])
  const [groupMatches, setGroupMatches] = useState([])
  const [knockoutMatches, setKnockoutMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [mainTab, setMainTab] = useState('hall')
  const [infoTab, setInfoTab] = useState('grupos')

  useEffect(() => {
    async function fetchData() {
      const [{ data: prof }, { data: gues }, { data: gm }, { data: km }] = await Promise.all([
        supabase.from('profiles').select('*').order('points', { ascending: false }),
        supabase.from('guesses').select('*, matches(status, home_score, away_score)'),
        supabase.from('matches').select('*').eq('stage', 'Grupos'),
        supabase.from('matches').select('*').neq('stage', 'Grupos').order('match_date', { ascending: true }),
      ])
      setProfiles(prof || [])
      setGuesses(gues || [])
      setGroupMatches(gm || [])
      setKnockoutMatches(km || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="page">
      <div className="section-title">Extras</div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 140, marginBottom: 12, borderRadius: 14 }} />
      ))}
    </div>
  )

  const finishedGuesses = guesses.filter(g => g.matches?.status === 'finished')

  // 1. EM CHAMAS — maior sequência de acertos consecutivos
  const emChamas = profiles.map(p => {
    const meus = finishedGuesses
      .filter(g => g.user_id === p.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let maxSeq = 0, curSeq = 0
    for (const g of meus) {
      if ((g.points_earned || 0) > 0) { curSeq++; maxSeq = Math.max(maxSeq, curSeq) }
      else curSeq = 0
    }
    return { ...p, _value: maxSeq }
  }).sort((a, b) => b._value - a._value)

  // 2. PÉ QUENTE — mais placares exatos
  const peQuente = [...profiles]
    .map(p => ({ ...p, _value: p.exact_hits || 0 }))
    .sort((a, b) => b._value - a._value)

  // 3. ZEBRA — acertou jogos que a maioria errou
  // Para cada jogo finalizado, ver quem acertou quando menos de 50% acertou
  const zebraPoints = {}
  profiles.forEach(p => { zebraPoints[p.id] = 0 })

  const matchIds = [...new Set(finishedGuesses.map(g => g.match_id))]
  for (const matchId of matchIds) {
    const jogoPalpites = finishedGuesses.filter(g => g.match_id === matchId)
    const totalJogo = jogoPalpites.length
    if (totalJogo < 2) continue
    const acertaram = jogoPalpites.filter(g => (g.points_earned || 0) > 0)
    // Zebra = menos de 30% acertou
    if (acertaram.length / totalJogo < 0.30) {
      acertaram.forEach(g => { if (zebraPoints[g.user_id] !== undefined) zebraPoints[g.user_id]++ })
    }
  }
  const zebra = profiles
    .map(p => ({ ...p, _value: zebraPoints[p.id] || 0 }))
    .sort((a, b) => b._value - a._value)

  // 4. CONSISTENTE — melhor % de acertos
  const consistente = profiles.map(p => {
    const meus = finishedGuesses.filter(g => g.user_id === p.id)
    const total = meus.length
    const acertos = (p.exact_hits || 0) + (p.partial_hits || 0)
    const pct = total >= 3 ? Math.round((acertos / total) * 100) : 0
    return { ...p, _value: pct, _total: total }
  }).filter(p => p._total >= 3).sort((a, b) => b._value - a._value)

  // 5. MAIS ATIVO — mais palpites registrados
  const maisAtivo = profiles.map(p => {
    const total = guesses.filter(g => g.user_id === p.id).length
    return { ...p, _value: total }
  }).sort((a, b) => b._value - a._value)

  // 6. DIPLOMATA — mais apostas em empate (home_score === away_score no palpite)
  const diplomata = profiles.map(p => {
    const empates = guesses.filter(g => g.user_id === p.id && g.home_score === g.away_score).length
    return { ...p, _value: empates }
  }).sort((a, b) => b._value - a._value)

  // 7. AZARÃO — mais zeros em jogos finalizados
  const azarao = profiles.map(p => {
    const meus = finishedGuesses.filter(g => g.user_id === p.id)
    const zeros = meus.filter(g => (g.points_earned || 0) === 0).length
    return { ...p, _value: zeros }
  }).sort((a, b) => b._value - a._value)

  // ── FASE DE GRUPOS (calculada a partir dos jogos reais, não da tabela group_standings) ──
  const teamsByGroup = {} // groupName -> { teamName: statsObj }
  groupMatches.forEach(m => {
    if (!m.group_name) return
    if (!teamsByGroup[m.group_name]) teamsByGroup[m.group_name] = {}
    const g = teamsByGroup[m.group_name]
    ;[[m.home_team, m.home_flag], [m.away_team, m.away_flag]].forEach(([team, flag]) => {
      if (!team) return
      if (!g[team]) g[team] = { team_name: team, flag_emoji: flag || '🏳️', played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, points: 0 }
    })
    if (m.status === 'finished' && m.home_score != null && m.away_score != null) {
      const h = g[m.home_team], a = g[m.away_team]
      if (h && a) {
        h.played++; a.played++
        h.goals_for += m.home_score; h.goals_against += m.away_score
        a.goals_for += m.away_score; a.goals_against += m.home_score
        if (m.home_score > m.away_score) { h.won++; a.lost++; h.points += 3 }
        else if (m.home_score < m.away_score) { a.won++; h.lost++; a.points += 3 }
        else { h.drawn++; a.drawn++; h.points += 1; a.points += 1 }
      }
    }
  })

  const groupsMap = {}
  Object.keys(teamsByGroup).forEach(gn => {
    groupsMap[gn] = Object.values(teamsByGroup[gn]).map(t => ({ ...t, group_name: gn, goal_diff: t.goals_for - t.goals_against }))
  })
  const groupNames = Object.keys(groupsMap).sort()
  const sortTeams = (a, b) => (b.points ?? 0) - (a.points ?? 0) || (b.goal_diff ?? 0) - (a.goal_diff ?? 0) || (b.goals_for ?? 0) - (a.goals_for ?? 0)
  groupNames.forEach(gn => groupsMap[gn].sort(sortTeams))

  const thirdPlaced = groupNames
    .map(gn => groupsMap[gn][2])
    .filter(Boolean)
    .sort(sortTeams)

  // ── MATA-MATA ────────────────────────────────────────────────────────────
  const byStage = {}
  knockoutMatches.forEach(m => {
    if (!m.stage) return
    if (!byStage[m.stage]) byStage[m.stage] = []
    byStage[m.stage].push(m)
  })
  // Ordena pela ordem oficial do chaveamento (external_id da football-data.org
  // segue a sequência oficial de jogos do mata-mata), com data como fallback
  Object.keys(byStage).forEach(stage => {
    byStage[stage].sort((a, b) => {
      const idA = Number(a.external_id), idB = Number(b.external_id)
      if (!Number.isNaN(idA) && !Number.isNaN(idB)) return idA - idB
      return new Date(a.match_date) - new Date(b.match_date)
    })
  })

  const stats = [
    { icon: 'EMCHAMAS', title: 'EM CHAMAS', subtitle: 'Maior sequência de acertos consecutivos', data: emChamas, unit: 'seguidos', color: '#f97316' },
    { icon: 'PEQUENTE', title: 'PÉ QUENTE', subtitle: 'Mais placares exatos', data: peQuente, unit: 'exatos', color: '#f5c518' },
    { icon: 'ZEBRA', title: 'ZEBRA', subtitle: 'Acertou quando a maioria errou', data: zebra, unit: 'zebras', color: '#a855f7' },
    { icon: 'CONSISTENTE', title: 'CONSISTENTE', subtitle: 'Melhor % de acertos (mín. 3 jogos)', data: consistente, unit: '%', color: '#00c853' },
    { icon: 'MAISATIVO', title: 'MAIS ATIVO', subtitle: 'Mais palpites registrados', data: maisAtivo, unit: 'palp.', color: '#4d8ef0' },
    { icon: 'DIPLOMATA', title: 'DIPLOMATA', subtitle: 'Quem mais apostou em empate', data: diplomata, unit: 'empates', color: '#06b6d4' },
    { icon: 'AZARAO', title: 'AZARÃO', subtitle: 'Mais palpites sem ponto', data: azarao, unit: 'zeros', color: '#f03e3e' },
  ]

  return (
    <div className="page">
      <style>{`
        .hscroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none; }
        .hscroll::-webkit-scrollbar { display: none; height: 0; }
        @media (hover: hover) and (pointer: fine) {
          .hscroll { scrollbar-width: thin; scrollbar-color: var(--border-strong) transparent; }
          .hscroll::-webkit-scrollbar { display: block; height: 8px; }
          .hscroll::-webkit-scrollbar-track { background: transparent; }
          .hscroll::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
          .hscroll::-webkit-scrollbar-thumb:hover { background: var(--text-3); }
        }
      `}</style>
      <div className="section-title">Extras</div>

      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '16px', gap: '4px' }}>
        {[['hall', 'Hall da Fama'], ['info', 'Informações']].map(([key, label]) => (
          <button key={key} onClick={() => setMainTab(key)} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: mainTab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: mainTab === key ? 'var(--text)' : 'var(--text-3)' }}>{label}</button>
        ))}
      </div>

      {mainTab === 'hall' && (
        <>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.5 }}>
            Estatísticas da galera baseadas nos palpites do bolão.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.map(({ icon, title, subtitle, data, unit, color }) => (
              <StatCard
                key={title}
                icon={icon}
                title={title}
                subtitle={subtitle}
                player={data[0]?._value > 0 ? data[0] : null}
                value={data[0]?._value ?? '-'}
                unit={unit}
                color={color}
                rank={data.filter(p => p._value > 0)}
              />
            ))}
          </div>

          <ComoFunciona />
        </>
      )}

      {mainTab === 'info' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
            <div className="hscroll" style={{ display: 'flex', flex: 1 }}>
              {[['grupos', 'Fase de Grupos'], ['matamata', 'Mata-Mata']].map(([key, label]) => (
                <button key={key} onClick={() => setInfoTab(key)} style={{
                  flexShrink: 0, flex: 1, minWidth: '80px', padding: '10px 8px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                  background: 'transparent',
                  color: infoTab === key ? 'var(--text)' : 'var(--text-3)',
                  borderBottom: `2px solid ${infoTab === key ? 'var(--gold)' : 'transparent'}`,
                  transition: 'all 0.2s', letterSpacing: '0.02em',
                }}>{label}</button>
              ))}
            </div>
          </div>

          {infoTab === 'grupos' && (
            groupNames.length === 0 ? (
              <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                Classificação dos grupos ainda não disponível.
              </div>
            ) : (
              <>
                {groupNames.map(gn => (
                  <GroupTable key={gn} groupName={gn} teams={groupsMap[gn]} />
                ))}
                {thirdPlaced.length > 0 && <ThirdPlacedTable teams={thirdPlaced} />}
              </>
            )
          )}

          {infoTab === 'matamata' && <MataMataView byStage={byStage} />}
        </>
      )}
    </div>
  )
}

// ── TABS / FASE DE GRUPOS / MATA-MATA ──────────────────────────────────────

const tableTh = { padding: '4px 6px', textAlign: 'center' }
const tableTd = { padding: '6px 6px', textAlign: 'center', color: 'var(--text-2)' }

function GroupTable({ groupName, teams }) {
  return (
    <div className="glass-card" style={{ padding: '14px', marginBottom: 12 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 10 }}>
        {groupName}
      </div>
      <div className="hscroll" onWheel={onWheelHorizontal}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 420 }}>
          <thead>
            <tr style={{ color: 'var(--text-3)', textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.05em' }}>
              <th style={{ ...tableTh, textAlign: 'left' }}>#</th>
              <th style={{ ...tableTh, textAlign: 'left' }}>Seleção</th>
              <th style={tableTh}>PTS</th>
              <th style={tableTh}>V</th>
              <th style={tableTh}>E</th>
              <th style={tableTh}>D</th>
              <th style={tableTh}>GM</th>
              <th style={tableTh}>GC</th>
              <th style={tableTh}>SG</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr
                key={t.team_name}
                style={{
                  background: i < 2 ? 'rgba(0,200,83,0.07)' : i === 2 ? 'rgba(77,142,240,0.07)' : 'rgba(240,62,62,0.05)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <td style={{ ...tableTd, textAlign: 'left', color: 'var(--text-3)' }}>{i + 1}º</td>
                <td style={{ ...tableTd, textAlign: 'left', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TeamCircle name={t.team_name} size={20} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(t.team_name)}</span>
                  </div>
                </td>
                <td style={{ ...tableTd, fontWeight: 700, color: 'var(--gold, #f5c518)' }}>{t.points ?? 0}</td>
                <td style={tableTd}>{t.won ?? 0}</td>
                <td style={tableTd}>{t.drawn ?? 0}</td>
                <td style={tableTd}>{t.lost ?? 0}</td>
                <td style={tableTd}>{t.goals_for ?? 0}</td>
                <td style={tableTd}>{t.goals_against ?? 0}</td>
                <td style={tableTd}>{t.goal_diff ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 9, color: 'var(--text-3)', flexWrap: 'wrap' }}>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#00c853', marginRight: 4 }} />Classificado</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#4d8ef0', marginRight: 4 }} />Aguarda repescagem</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#f03e3e', marginRight: 4 }} />Eliminado</span>
      </div>
    </div>
  )
}

function ThirdPlacedTable({ teams }) {
  return (
    <div className="glass-card" style={{ padding: '14px', marginTop: 8 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 2 }}>
        Melhores Terceiros
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>
        Os 8 melhores 3ºs colocados avançam ao mata-mata
      </div>
      <div className="hscroll" onWheel={onWheelHorizontal}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 460 }}>
          <thead>
            <tr style={{ color: 'var(--text-3)', textTransform: 'uppercase', fontSize: 9, letterSpacing: '0.05em' }}>
              <th style={{ ...tableTh, textAlign: 'left' }}>#</th>
              <th style={tableTh}>Grupo</th>
              <th style={{ ...tableTh, textAlign: 'left' }}>Seleção</th>
              <th style={tableTh}>PTS</th>
              <th style={tableTh}>V</th>
              <th style={tableTh}>E</th>
              <th style={tableTh}>D</th>
              <th style={tableTh}>GM</th>
              <th style={tableTh}>GC</th>
              <th style={tableTh}>SG</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr
                key={t.group_name + t.team_name}
                style={{
                  background: i < 8 ? 'rgba(0,200,83,0.07)' : 'rgba(240,62,62,0.05)',
                  borderTop: i === 8 ? '2px dashed var(--border-strong)' : '1px solid var(--border)',
                }}
              >
                <td style={{ ...tableTd, textAlign: 'left', color: 'var(--text-3)' }}>{i + 1}º</td>
                <td style={{ ...tableTd, color: 'var(--text-3)' }}>{(t.group_name || '').replace('Grupo ', '')}</td>
                <td style={{ ...tableTd, textAlign: 'left', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TeamCircle name={t.team_name} size={20} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPT(t.team_name)}</span>
                  </div>
                </td>
                <td style={{ ...tableTd, fontWeight: 700, color: 'var(--gold, #f5c518)' }}>{t.points ?? 0}</td>
                <td style={tableTd}>{t.won ?? 0}</td>
                <td style={tableTd}>{t.drawn ?? 0}</td>
                <td style={tableTd}>{t.lost ?? 0}</td>
                <td style={tableTd}>{t.goals_for ?? 0}</td>
                <td style={tableTd}>{t.goals_against ?? 0}</td>
                <td style={tableTd}>{t.goal_diff ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Chaveamento com linhas conectoras (estilo fluxograma) ──────────────────
const MATCH_H = 82
const V_GAP = 18
const COL_GAP = 46
const STUB = 16

function wrapperHeight(roundIndex) {
  let h = MATCH_H
  for (let i = 0; i < roundIndex; i++) h = 2 * h + V_GAP
  return h
}

// Quem venceu um confronto de mata-mata (usa qualifier_result do banco; cai pro placar como reforço)
function getWinnerName(match) {
  if (!match) return null
  if (match.qualifier_result) return match.qualifier_result
  if (match.status !== 'finished') return null
  const hasPen = match.penalty_home != null && match.penalty_away != null
  if (hasPen) return match.penalty_home > match.penalty_away ? match.home_team : match.away_team
  if (match.home_score != null && match.away_score != null && match.home_score !== match.away_score) {
    return match.home_score > match.away_score ? match.home_team : match.away_team
  }
  return null
}

// ── Ordem fixa da chave dos Dezesseis-avos (Fase de 32) ────────────────────
// O banco só garante a ORDEM CRONOLÓGICA dos jogos (match_date), mas a ordem
// cronológica não é a mesma coisa que a ordem da chave (quem alimenta qual
// jogo das Oitavas). Por isso, em vez de confiar na ordem que vem do Supabase,
// usamos a chave oficial da FIFA (fixa, definida antes da fase de grupos acabar)
// pra reordenar os 16 jogos antes de parear. Cada par de posições consecutivas
// abaixo (0-1, 2-3, 4-5...) alimenta um confronto das Oitavas, na mesma ordem
// da tabela oficial / imagem de referência.
const TEAM_ALIASES = {
  'south africa': 'south africa', 'canada': 'canada',
  'netherlands': 'netherlands', 'morocco': 'morocco',
  'germany': 'germany', 'paraguay': 'paraguay',
  'france': 'france', 'sweden': 'sweden',
  'belgium': 'belgium', 'senegal': 'senegal',
  'united states': 'usa', 'usa': 'usa',
  'bosnia and herzegovina': 'bosnia', 'bosnia & herzegovina': 'bosnia',
  'bosnia herzegovina': 'bosnia', 'bosnia-herzegovina': 'bosnia', 'bosna i hercegovina': 'bosnia',
  'spain': 'spain', 'austria': 'austria',
  'portugal': 'portugal', 'croatia': 'croatia',
  'brazil': 'brazil', 'japan': 'japan',
  "côte d'ivoire": 'ivory coast', 'ivory coast': 'ivory coast',
  'norway': 'norway',
  'mexico': 'mexico', 'ecuador': 'ecuador',
  'england': 'england', 'congo dr': 'dr congo', 'dr congo': 'dr congo',
  'switzerland': 'switzerland', 'algeria': 'algeria',
  'colombia': 'colombia', 'ghana': 'ghana',
  'australia': 'australia', 'egypt': 'egypt',
  'argentina': 'argentina',
  'cape verde': 'cape verde', 'cape verde islands': 'cape verde',
}
function normTeam(name) {
  if (!name) return ''
  const key = name.trim().toLowerCase()
  return TEAM_ALIASES[key] || key
}
// Slots 1 a 16, na ordem oficial da chave (par de posições consecutivas = 1 jogo das Oitavas)
const ROUND32_ORDER = [
  ['south africa', 'canada'],
  ['netherlands', 'morocco'],
  ['germany', 'paraguay'],
  ['france', 'sweden'],
  ['belgium', 'senegal'],
  ['usa', 'bosnia'],
  ['spain', 'austria'],
  ['portugal', 'croatia'],
  ['brazil', 'japan'],
  ['ivory coast', 'norway'],
  ['mexico', 'ecuador'],
  ['england', 'dr congo'],
  ['switzerland', 'algeria'],
  ['colombia', 'ghana'],
  ['australia', 'egypt'],
  ['argentina', 'cape verde'],
]
function round32SlotIndex(match) {
  const a = normTeam(match.home_team)
  const b = normTeam(match.away_team)
  return ROUND32_ORDER.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a))
}

// Monta a árvore inteira (16→8→4→2→1) a partir dos 16 jogos reais da primeira fase
// do mata-mata (chain[0], hoje = 'LAST_16' no banco). Cada box das fases seguintes é
// pré-definido (par fixo de vencedores) e só recebe o jogo real do banco quando os
// dois times daquele confronto específico existirem — nunca por posição solta no
// array, sempre pelo confronto que realmente aconteceu.
function buildBracketRounds(byStage, chain) {
  // Reordena os 16 jogos da 1ª fase pela chave oficial (não pela data do jogo),
  // pra garantir que o pareamento por índice (0-1, 2-3...) bata com a chave real.
  const round32 = [...(byStage[chain[0]] || [])].sort((m1, m2) => {
    const i1 = round32SlotIndex(m1)
    const i2 = round32SlotIndex(m2)
    if (i1 === -1 && i2 === -1) return 0
    if (i1 === -1) return 1   // jogo não reconhecido vai pro fim, não quebra os outros
    if (i2 === -1) return -1
    return i1 - i2
  })
  let current = round32.map(m => ({ homeTeam: m.home_team, awayTeam: m.away_team, match: m }))
  const rounds = [current]

  const nextStages = chain.slice(1)
  for (const stageKey of nextStages) {
    const pool = byStage[stageKey] || []
    const next = []
    for (let i = 0; i < current.length; i += 2) {
      const a = current[i], b = current[i + 1]
      const homeTeam = a ? getWinnerName(a.match) : null
      const awayTeam = b ? getWinnerName(b.match) : null
      let real = null
      if (homeTeam && awayTeam) {
        real = pool.find(m =>
          (m.home_team === homeTeam && m.away_team === awayTeam) ||
          (m.home_team === awayTeam && m.away_team === homeTeam)
        ) || null
      }
      next.push({
        homeTeam: real ? real.home_team : homeTeam,
        awayTeam: real ? real.away_team : awayTeam,
        match: real,
      })
    }
    rounds.push(next)
    current = next
  }
  return rounds // [chain[0] (16), chain[1] (8), chain[2] (4), chain[3] (2), Final (1)]
}

// Deixa a roda do mouse rolar o chaveamento na horizontal (comportamento padrão em brackets)
function onWheelHorizontal(e) {
  const el = e.currentTarget
  if (el.scrollWidth <= el.clientWidth) return
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    el.scrollLeft += e.deltaY
  }
}

function MataMataView({ byStage }) {
  const thirdPlace = byStage['3º Lugar']?.[0]
  const chain = buildStageChain(byStage)
  const round32 = byStage[chain[0]] || []

  if (round32.length === 0 && !thirdPlace) {
    return (
      <div className="glass-card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
        O chaveamento do mata-mata ainda não começou.
      </div>
    )
  }

  const rounds = buildBracketRounds(byStage, chain)
  const isLastCol = (ri) => ri === rounds.length - 1

  return (
    <div>
      <div className="hscroll" onWheel={onWheelHorizontal} style={{ display: 'flex', gap: COL_GAP, paddingBottom: 8, paddingLeft: 4, paddingTop: 4 }}>
        {rounds.map((nodes, ri) => {
          if (!nodes.length) return null
          const h = wrapperHeight(ri)
          return (
            <div key={chain[ri]} style={{ minWidth: 200, flexShrink: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: 'var(--gold, #f5c518)', textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: 12, textAlign: 'center', height: 14,
              }}>
                {stageLabel(chain[ri])}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: V_GAP }}>
                {nodes.map((node, i) => (
                  <div key={i} style={{ height: h, display: 'flex', alignItems: 'center', position: 'relative' }}>
                    {ri > 0 && <BracketConnector prevH={wrapperHeight(ri - 1)} h={h} />}
                    <BracketMatch node={node} />
                  </div>
                ))}
              </div>

              {isLastCol(ri) && (
                <div style={{ marginTop: 28 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase',
                    letterSpacing: '0.06em', marginBottom: 8, textAlign: 'center',
                  }}>
                    Disputa de 3º Lugar
                  </div>
                  <BracketMatch node={{
                    homeTeam: thirdPlace?.home_team ?? null,
                    awayTeam: thirdPlace?.away_team ?? null,
                    match: thirdPlace ?? null,
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Desenha o "[" que liga os dois jogos anteriores ao centro do jogo atual
function BracketConnector({ prevH, h }) {
  const y1 = prevH / 2
  const y2 = h - prevH / 2
  return (
    <>
      <div style={{
        position: 'absolute', left: -COL_GAP, top: y1, height: y2 - y1, width: COL_GAP - STUB,
        borderTop: '2px solid var(--border-strong)',
        borderBottom: '2px solid var(--border-strong)',
        borderRight: '2px solid var(--border-strong)',
      }} />
      <div style={{
        position: 'absolute', left: -STUB, top: h / 2 - 1, height: 2, width: STUB,
        background: 'var(--border-strong)',
      }} />
    </>
  )
}

function formatMatchHeader(match) {
  const d = new Date(match.match_date)
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1) + '.,'
  const dayMonth = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  if (match.status === 'finished') {
    const hasPen = match.penalty_home != null && match.penalty_away != null
    return { text: `${label} ${dayMonth}`, badge: hasPen ? 'FIM (P)' : 'FIM' }
  }
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return { text: `${label} ${dayMonth}, ${time}`, badge: null }
}

function BracketMatch({ node }) {
  const { homeTeam, awayTeam, match } = node
  const finished = match?.status === 'finished'
  const hasPen = finished && match.penalty_home != null && match.penalty_away != null
  const header = match ? formatMatchHeader(match) : null

  // Se o jogo real tem os times invertidos em relação ao nosso "homeTeam" sintetizado
  // (mandante/visitante trocados), ainda assim casamos o placar certo com o time certo.
  const homeScore = match ? (match.home_team === homeTeam ? match.home_score : match.away_score) : null
  const awayScore = match ? (match.home_team === awayTeam ? match.home_score : match.away_score) : null
  const homePen = match ? (match.home_team === homeTeam ? match.penalty_home : match.penalty_away) : null
  const awayPen = match ? (match.home_team === awayTeam ? match.penalty_home : match.penalty_away) : null
  const homeWinFlag = finished && (hasPen ? homePen > awayPen : homeScore > awayScore)
  const awayWinFlag = finished && (hasPen ? awayPen > homePen : awayScore > homeScore)

  return (
    <div className="glass-card" style={{ padding: '8px 10px', width: '100%', height: MATCH_H, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, minHeight: 12 }}>
        {header && <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{header.text}</span>}
        {header?.badge && (
          <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-3)', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 6 }}>
            {header.badge}
          </span>
        )}
      </div>
      <BracketRow team={homeTeam} score={homeScore} pen={homePen} winner={homeWinFlag} finished={finished} />
      <div style={{ height: 1, background: 'var(--border)', margin: '5px 0' }} />
      <BracketRow team={awayTeam} score={awayScore} pen={awayPen} winner={awayWinFlag} finished={finished} />
    </div>
  )
}

function BracketRow({ team, score, pen, winner, finished }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <TeamCircle name={team} size={20} />
      <span style={{
        flex: 1, fontSize: 12, fontWeight: winner ? 700 : 500,
        color: winner ? 'var(--text)' : 'var(--text-3)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {team ? getPT(team) : 'A definir'}
      </span>
      {finished && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: winner ? 'var(--text)' : 'var(--text-3)' }}>
            {score ?? '-'}{pen != null ? ` (${pen})` : ''}
          </span>
          {winner && <span style={{ fontSize: 9, color: 'var(--gold, #f5c518)' }}>◂</span>}
        </span>
      )}
    </div>
  )
}
