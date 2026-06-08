import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  'Czechia': 'República Tcheca', 'Slovenia': 'Eslovênia',
  'Algeria': 'Argélia', 'Egypt': 'Egito', 'New Zealand': 'Nova Zelândia',
  "Côte d'Ivoire": 'Costa do Marfim', 'Guatemala': 'Guatemala',
  'El Salvador': 'El Salvador',
}

const FLAG_MAP = {
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
  'Italy': '🇮🇹', 'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Mexico': '🇲🇽',
  'United States': '🇺🇸', 'USA': '🇺🇸', 'Canada': '🇨🇦', 'Japan': '🇯🇵',
  'South Korea': '🇰🇷', 'Korea Republic': '🇰🇷', 'Morocco': '🇲🇦',
  'Senegal': '🇸🇳', 'Ghana': '🇬🇭', 'Nigeria': '🇳🇬', 'Australia': '🇦🇺',
  'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'IR Iran': '🇮🇷', 'Qatar': '🇶🇦',
  'Croatia': '🇭🇷', 'Serbia': '🇷🇸', 'Switzerland': '🇨🇭', 'Belgium': '🇧🇪',
  'Denmark': '🇩🇰', 'Poland': '🇵🇱', 'Cameroon': '🇨🇲', 'Ecuador': '🇪🇨',
  'Tunisia': '🇹🇳', 'Costa Rica': '🇨🇷', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Chile': '🇨🇱', 'Peru': '🇵🇪', 'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪',
  'Bolivia': '🇧🇴', 'Austria': '🇦🇹', 'Turkey': '🇹🇷', 'Ukraine': '🇺🇦',
  'Honduras': '🇭🇳', 'Panama': '🇵🇦', 'Jamaica': '🇯🇲',
  'Slovakia': '🇸🇰', 'Romania': '🇷🇴', 'Hungary': '🇭🇺',
  'Czechia': '🇨🇿', 'Slovenia': '🇸🇮', 'Algeria': '🇩🇿',
  'Egypt': '🇪🇬', 'New Zealand': '🇳🇿', "Côte d'Ivoire": '🇨🇮',
  'Guatemala': '🇬🇹', 'El Salvador': '🇸🇻',
}

const STAGE_ORDER = ['R32', 'R16', 'QF', 'SF', 'F']
const STAGE_LABELS = {
  'R32': 'Oitavas', 'R16': 'Oitavas', 'QF': 'Quartas',
  'SF': 'Semis', 'F': 'Final', 'THIRD': '3º Lugar',
}

function getFlag(name) { return FLAG_MAP[name] || '🏳️' }
function getPT(name) { return name ? (TEAM_PT[name] || name) : null }

export default function BracketPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBracket() {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .in('stage', ['R32', 'R16', 'QF', 'SF', 'F', 'THIRD'])
        .order('match_date', { ascending: true })
      setMatches(data || [])
      setLoading(false)
    }
    fetchBracket()
  }, [])

  if (loading) return (
    <div className="page">
      <div className="section-title">Chaves</div>
      <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
    </div>
  )

  const byRound = {}
  STAGE_ORDER.forEach(r => { byRound[r] = [] })
  byRound['THIRD'] = []
  matches.forEach(m => {
    if (byRound[m.stage] !== undefined) byRound[m.stage].push(m)
  })

  const hasMatches = matches.length > 0

  // Terceiro lugar separado
  const thirdPlace = byRound['THIRD']
  const rounds = STAGE_ORDER.filter(r => byRound[r].length > 0)

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div className="section-title">Chaves</div>

      {!hasMatches ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '14px' }}>
          Fase eliminatória ainda não iniciou.
        </div>
      ) : (
        <>
          {/* Bracket horizontal */}
          <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '0', minWidth: `${rounds.length * 180}px`, alignItems: 'stretch' }}>
              {rounds.map((round, colIdx) => {
                const ms = byRound[round]
                const isLast = colIdx === rounds.length - 1
                return (
                  <div key={round} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header da rodada */}
                    <div style={{
                      textAlign: 'center', padding: '8px 12px', marginBottom: '12px',
                      fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--accent-gold)',
                      background: 'rgba(201,168,76,0.08)',
                      borderBottom: '1px solid rgba(201,168,76,0.15)',
                      borderTop: '1px solid rgba(201,168,76,0.15)',
                    }}>
                      {STAGE_LABELS[round]}
                    </div>

                    {/* Jogos da rodada */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-around',
                      flex: 1, gap: '8px', padding: '0 8px',
                    }}>
                      {ms.map((m, matchIdx) => (
                        <div key={m.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <BracketMatch match={m} />
                          {/* Conector direita */}
                          {!isLast && (
                            <div style={{
                              position: 'absolute', right: '-8px', top: '50%',
                              width: '8px', height: '1px',
                              background: 'var(--border-glass-strong)',
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Terceiro lugar */}
          {thirdPlace.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--text-muted)',
                textAlign: 'center', marginBottom: '10px',
              }}>
                3º Lugar
              </div>
              <div style={{ maxWidth: '200px', margin: '0 auto' }}>
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
    <div style={{
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      width: '100%',
      transition: 'border-color 0.2s',
    }}>
      <TeamRow
        name={getPT(match.home_team)}
        flag={homeFlag}
        score={match.home_score}
        won={homeWon}
        finished={finished}
        isTop
      />
      <div style={{ height: '1px', background: 'var(--border-glass)' }} />
      <TeamRow
        name={getPT(match.away_team)}
        flag={awayFlag}
        score={match.away_score}
        won={awayWon}
        finished={finished}
      />
    </div>
  )
}

function TeamRow({ name, flag, score, won, finished, isTop }) {
  const undefined_ = !name

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '9px 10px',
      background: won ? 'rgba(201,168,76,0.07)' : 'transparent',
      transition: 'background 0.2s',
    }}>
      {/* Bolinha com bandeira */}
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%',
        overflow: 'hidden', flexShrink: 0,
        border: `1px solid ${won ? 'rgba(201,168,76,0.4)' : 'var(--border-glass)'}`,
        background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', lineHeight: 1,
        opacity: undefined_ ? 0.3 : 1,
      }}>
        {undefined_ ? '?' : flag}
      </div>

      {/* Nome */}
      <span style={{
        flex: 1, fontSize: '12px',
        fontWeight: won ? 700 : 400,
        color: undefined_ ? 'var(--text-muted)' : won ? 'var(--text-primary)' : 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {name || 'A definir'}
      </span>

      {/* Placar */}
      {finished && score !== null && (
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '18px',
          color: won ? 'var(--accent-gold-bright)' : 'var(--text-muted)',
          flexShrink: 0, minWidth: '18px', textAlign: 'center',
          letterSpacing: '0.04em',
        }}>
          {score}
        </span>
      )}
    </div>
  )
}
