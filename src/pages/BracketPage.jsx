import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const TEAM_PT = {
  'Brazil':'Brasil','Argentina':'Argentina','France':'França','Germany':'Alemanha',
  'Spain':'Espanha','England':'Inglaterra','Portugal':'Portugal','Netherlands':'Holanda',
  'Italy':'Itália','Uruguay':'Uruguai','Colombia':'Colômbia','Mexico':'México',
  'United States':'EUA','USA':'EUA','Canada':'Canadá','Japan':'Japão',
  'South Korea':'Coreia do Sul','Korea Republic':'Coreia do Sul','Morocco':'Marrocos',
  'Senegal':'Senegal','Ghana':'Gana','Australia':'Austrália','Saudi Arabia':'Arábia Saudita',
  'Iran':'Irã','IR Iran':'Irã','Qatar':'Catar','Croatia':'Croácia','Serbia':'Sérvia',
  'Switzerland':'Suíça','Belgium':'Bélgica','Denmark':'Dinamarca','Poland':'Polônia',
  'Cameroon':'Camarões','Ecuador':'Equador','Tunisia':'Tunísia','Costa Rica':'Costa Rica',
  'Wales':'País de Gales','Austria':'Áustria','Turkey':'Turquia','Ukraine':'Ucrânia',
  'Honduras':'Honduras','Panama':'Panamá','Slovakia':'Eslováquia','Romania':'Romênia',
  'Czechia':'Rep. Tcheca','Algeria':'Argélia','Egypt':'Egito',
  "Côte d'Ivoire":'Costa do Marfim','South Africa':'África do Sul',
  'Bosnia-Herzegovina':'Bósnia e Herzegovina','Bosnia and Herzegovina':'Bósnia e Herzegovina',
  'Uzbekistan':'Uzbequistão','Jordan':'Jordânia','Iraq':'Iraque',
}

const FLAG_MAP = {
  'Brazil':'🇧🇷','Argentina':'🇦🇷','France':'🇫🇷','Germany':'🇩🇪','Spain':'🇪🇸',
  'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Netherlands':'🇳🇱','Italy':'🇮🇹',
  'Uruguay':'🇺🇾','Colombia':'🇨🇴','Mexico':'🇲🇽','United States':'🇺🇸','USA':'🇺🇸',
  'Canada':'🇨🇦','Japan':'🇯🇵','South Korea':'🇰🇷','Korea Republic':'🇰🇷','Morocco':'🇲🇦',
  'Senegal':'🇸🇳','Australia':'🇦🇺','Saudi Arabia':'🇸🇦','Iran':'🇮🇷','Qatar':'🇶🇦',
  'Croatia':'🇭🇷','Serbia':'🇷🇸','Switzerland':'🇨🇭','Belgium':'🇧🇪','Denmark':'🇩🇰',
  'Poland':'🇵🇱','Cameroon':'🇨🇲','Ecuador':'🇪🇨','Tunisia':'🇹🇳','Costa Rica':'🇨🇷',
  'Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','Austria':'🇦🇹','Turkey':'🇹🇷','Ukraine':'🇺🇦','Honduras':'🇭🇳',
  'Panama':'🇵🇦','Czechia':'🇨🇿','Algeria':'🇩🇿','Egypt':'🇪🇬',"Côte d'Ivoire":'🇨🇮',
  'South Africa':'🇿🇦','Bosnia-Herzegovina':'🇧🇦','Bosnia and Herzegovina':'🇧🇦',
  'Uzbekistan':'🇺🇿','Jordan':'🇯🇴','Iraq':'🇮🇶',
}

const STAGE_ORDER = ['R32','R16','QF','SF','F']
const STAGE_LABELS = { 'R32':'R32','R16':'Oitavas','QF':'Quartas','SF':'Semis','F':'Final','THIRD':'3º Lugar' }

function getPT(n) { return n ? (TEAM_PT[n] || n) : null }
function getFlag(n) { return FLAG_MAP[n] || '🏳️' }

export default function BracketPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('matches').select('*')
      .in('stage', ['R32','R16','QF','SF','F','THIRD'])
      .order('match_date', { ascending: true })
      .then(({ data }) => { setMatches(data || []); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="page">
      <div className="section-title">Chaves</div>
      <div className="skeleton" style={{ height: 400, borderRadius: 14 }} />
    </div>
  )

  const byRound = {}
  STAGE_ORDER.forEach(r => { byRound[r] = [] })
  byRound['THIRD'] = []
  matches.forEach(m => { if (byRound[m.stage] !== undefined) byRound[m.stage].push(m) })

  const rounds = STAGE_ORDER.filter(r => byRound[r].length > 0)
  const thirdPlace = byRound['THIRD']

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div className="section-title">Chaves</div>

      {matches.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '60px 0', fontSize: '14px' }}>
          Fase eliminatória ainda não iniciou.
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
            <div style={{ display: 'flex', gap: 0, minWidth: `${rounds.length * 175}px`, alignItems: 'stretch' }}>
              {rounds.map((round, colIdx) => {
                const ms = byRound[round]
                const isLast = colIdx === rounds.length - 1
                return (
                  <div key={round} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ textAlign: 'center', padding: '7px 10px', marginBottom: 12, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(232,184,75,0.07)', borderBottom: '1px solid rgba(232,184,75,0.12)', borderTop: '1px solid rgba(232,184,75,0.12)' }}>
                      {STAGE_LABELS[round]}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: 8, padding: '0 8px' }}>
                      {ms.map(m => (
                        <div key={m.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <BracketMatch match={m} />
                          {!isLast && <div style={{ position: 'absolute', right: -8, top: '50%', width: 8, height: 1, background: 'var(--border-strong)' }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {thirdPlace.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', textAlign: 'center', marginBottom: 10 }}>3º Lugar</div>
              <div style={{ maxWidth: 200, margin: '0 auto' }}>
                {thirdPlace.map(m => <BracketMatch key={m.id} match={m} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BracketMatch({ match }) {
  const finished = match.status === 'finished'
  const homeWon = finished && match.home_score > match.away_score
  const awayWon = finished && match.away_score > match.home_score
  const homeFlag = match.home_flag || getFlag(match.home_team)
  const awayFlag = match.away_flag || getFlag(match.away_team)

  return (
    <div style={{ background: 'var(--deep)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', width: '100%' }}>
      <BracketRow name={getPT(match.home_team)} flag={homeFlag} score={match.home_score} won={homeWon} finished={finished} />
      <div style={{ height: 1, background: 'var(--border)' }} />
      <BracketRow name={getPT(match.away_team)} flag={awayFlag} score={match.away_score} won={awayWon} finished={finished} />
    </div>
  )
}

function BracketRow({ name, flag, score, won, finished }) {
  const tbd = !name
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: won ? 'rgba(232,184,75,0.07)' : 'transparent' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `1px solid ${won ? 'rgba(232,184,75,0.35)' : 'var(--border)'}`, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, opacity: tbd ? 0.3 : 1 }}>
        {tbd ? '?' : flag}
      </div>
      <span style={{ flex: 1, fontSize: '11px', fontWeight: won ? 700 : 400, color: tbd ? 'var(--text-3)' : won ? 'var(--text)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name || 'A definir'}
      </span>
      {finished && score !== null && (
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: won ? 'var(--gold-bright)' : 'var(--text-3)', flexShrink: 0, minWidth: 16, textAlign: 'center' }}>{score}</span>
      )}
    </div>
  )
}
