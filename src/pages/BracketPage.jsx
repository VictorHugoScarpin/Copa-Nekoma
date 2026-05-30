import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ROUND_LABELS = {
  'R32': 'Oitavas',
  'R16': 'Oitavas',
  'QF': 'Quartas',
  'SF': 'Semis',
  'F': 'Final',
  'THIRD': '3º Lugar'
}

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
      <div className="section-title">Eliminatórias</div>
      <div className="skeleton" style={{ height: '400px', borderRadius: '12px' }} />
    </div>
  )

  const byRound = {}
  const ORDER = ['R32', 'R16', 'QF', 'SF', 'THIRD', 'F']
  ORDER.forEach(r => { byRound[r] = [] })
  matches.forEach(m => {
    if (byRound[m.stage] !== undefined) byRound[m.stage].push(m)
  })

  const hasMatches = matches.length > 0

  return (
    <div className="page">
      <div className="section-title">Eliminatórias</div>

      {!hasMatches ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '14px' }}>
          Fase eliminatória ainda não iniciou.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', minWidth: '600px' }}>
            {ORDER.filter(r => byRound[r].length > 0).map(round => (
              <div key={round} style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: '12px', padding: '6px', background: 'rgba(201,168,76,0.08)', borderRadius: 'var(--radius-sm)' }}>
                  {ROUND_LABELS[round] || round}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-around', height: '100%' }}>
                  {byRound[round].map(m => <BracketMatch key={m.id} match={m} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BracketMatch({ match }) {
  const finished = match.status === 'finished'
  const homeWon = finished && match.home_score > match.away_score
  const awayWon = finished && match.away_score > match.home_score

  return (
    <div className="bracket-match">
      <TeamLine name={match.home_team} flag={match.home_flag} score={match.home_score} won={homeWon} finished={finished} />
      <div style={{ height: '1px', background: 'var(--border-glass)', margin: '4px 0' }} />
      <TeamLine name={match.away_team} flag={match.away_flag} score={match.away_score} won={awayWon} finished={finished} />
    </div>
  )
}

function TeamLine({ name, flag, score, won, finished }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
      <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{flag || '🏳️'}</span>
      <span style={{ flex: 1, fontSize: '12px', fontWeight: won ? 600 : 400, color: won ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name || 'A definir'}
      </span>
      {finished && (
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: won ? 'var(--accent-gold)' : 'var(--text-muted)', flexShrink: 0, letterSpacing: '0.04em' }}>
          {score}
        </span>
      )}
    </div>
  )
}
