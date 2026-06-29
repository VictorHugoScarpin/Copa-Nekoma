import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FlagCircle, getPT, getGuessResult } from '../lib/teams'

const MEDALS = ['🥇', '🥈', '🥉']

// ── Fases do torneio (espelhado do GuessesPage) ───────────────────────────────
const TOURNAMENT_PHASES = [
  { key: 'oitavas', label: 'Oitavas',   bonus: 3, start: '2026-06-28', end: '2026-07-03' },
  { key: 'quartas', label: 'Quartas',   bonus: 4, start: '2026-07-04', end: '2026-07-07' },
  { key: 'semi',    label: 'Semifinal', bonus: 5, start: '2026-07-09', end: '2026-07-11' },
  { key: 'final',   label: 'Final',     bonus: 6, start: '2026-07-14', end: '2026-07-15' },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ profile, size = 36 }) {
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-strong)' }} />
  }
  const initials = (profile.display_name || profile.nick || '?').slice(0, 2).toUpperCase()
  const colors = ['#e8b84b', '#1db954', '#4d8ef0', '#f03e3e', '#a855f7']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}1a`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
      {initials}
    </div>
  )
}

// ── Lista de jogos pontuados (aba Ranking/Supercopa) ──────────────────────────
const KNOCKOUT_START_R = new Date('2026-06-28T00:00:00')

function ScoredGuesses({ userId, tournamentPoints }) {
  const [items, setItems] = useState(null)
  const [masterPoints, setMasterPoints] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([
      supabase
        .from('guesses')
        .select('home_score, away_score, qualifier_guess, matches(home_team, away_team, home_score, away_score, status, match_date, qualifier_result)')
        .eq('user_id', userId),
      supabase
        .from('master_guess')
        .select('points_earned, team1, team2')
        .eq('user_id', userId)
        .maybeSingle(),
    ]).then(([{ data }, { data: mg }]) => {
      if (!active) return
      const scored = (data || [])
        .filter(g => {
          const m = g.matches
          if (!m || m.status !== 'finished') return false
          const result = getGuessResult(g, m.home_score, m.away_score)
          const isKo = new Date(m.match_date) >= KNOCKOUT_START_R
          const qualifierHit = isKo && g.qualifier_guess && m.qualifier_result && g.qualifier_guess === m.qualifier_result
          return result === 'exact' || result === 'partial' || qualifierHit
        })
        .sort((a, b) => new Date(a.matches.match_date) - new Date(b.matches.match_date))
      setItems(scored)
      setMasterPoints(mg?.points_earned || 0)
    })
    return () => { active = false }
  }, [userId])

  if (items === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 34, borderRadius: 8 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Pontos do torneio, se houver */}
      {tournamentPoints > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)' }}>
          <span style={{ fontSize: '14px' }}>🎌</span>
          <span style={{ fontSize: '11px', color: '#c084fc', flex: 1 }}>Pontos da Copa Yuuto Kidou</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: '#c084fc', fontWeight: 700 }}>
            +{tournamentPoints}
          </span>
        </div>
      )}

      {/* Pontos do Palpite Mestre, se houver */}
      {masterPoints > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)' }}>
          <span style={{ fontSize: '14px' }}>🏆</span>
          <span style={{ fontSize: '11px', color: '#fb923c', flex: 1 }}>
            Palpite Mestre {masterPoints === 10 ? '(2 finalistas ✓✓)' : '(1 finalista ✓)'}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: '#fb923c', fontWeight: 700 }}>
            +{masterPoints}
          </span>
        </div>
      )}

      {items.length === 0 && tournamentPoints === 0 && masterPoints === 0 && (
        <div style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', padding: '10px 0' }}>
          Nenhuma pontuação ainda.
        </div>
      )}

      {items.map((g, i) => {
        const m = g.matches
        const result = getGuessResult(g, m.home_score, m.away_score)
        const isExact = result === 'exact'
        const isKo = new Date(m.match_date) >= KNOCKOUT_START_R
        const qualifierHit = isKo && g.qualifier_guess && m.qualifier_result && g.qualifier_guess === m.qualifier_result
        const blueCombo = qualifierHit
        const basePoints = isExact ? 3 : result === 'partial' ? 1 : 0
        const totalPoints = basePoints + (qualifierHit ? 2 : 0)
        // Azul = qualificado certo (qualquer combo), Verde = placar exato sem classificado, Amarelo = resultado certo sem classificado
        const color = qualifierHit ? '#60a5fa' : isExact ? 'var(--green)' : result === 'partial' ? 'var(--gold)' : 'var(--red)'
        const bg = qualifierHit ? 'rgba(59,130,246,0.1)' : isExact ? 'var(--green-dim)' : result === 'partial' ? 'rgba(232,184,75,0.08)' : 'rgba(240,62,62,0.08)'
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '8px', background: bg }}>
            <FlagCircle name={m.home_team} size={22} />
            <span style={{ fontSize: '10px', color: 'var(--text-3)', flexShrink: 0 }}>×</span>
            <FlagCircle name={m.away_team} size={22} />
            <span style={{ fontSize: '11px', color: 'var(--text-2)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getPT(m.home_team)} × {getPT(m.away_team)}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color, letterSpacing: '0.04em', flexShrink: 0 }}>
              {g.home_score} × {g.away_score}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color, flexShrink: 0, minWidth: '26px', textAlign: 'right' }}>
              +{totalPoints}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Aba RANKING SUPERCOPA (liga + torneio) ────────────────────────────────────
function SupercopaTab({ ranking, loading, user }) {
  const [expandedId, setExpandedId] = useState(null)
  const topScore = ranking[0]?.supercopaPoints || 1

  if (loading) {
    return Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8, borderRadius: 14 }} />
    ))
  }

  return (
    <>
      {/* Pódio */}
      {ranking.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', marginBottom: '32px', marginTop: '8px' }}>
          {[1, 0, 2].map(idx => {
            const p = ranking[idx]
            if (!p) return null
            const isFirst = idx === 0
            const podiumH = [80, 110, 60][idx === 0 ? 1 : idx === 1 ? 0 : 2]
            const podiumColors = ['var(--gold)', '#C0C0C0', '#CD7F32']
            const color = podiumColors[idx]
            return (
              <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: isFirst ? 1.15 : 1 }}>
                <span style={{ fontSize: isFirst ? '30px' : '24px' }}>{MEDALS[idx]}</span>
                <Avatar profile={p} size={isFirst ? 50 : 40} />
                <div style={{ fontSize: isFirst ? '13px' : '11px', fontWeight: 600, color: 'var(--text)', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.display_name || p.nick}
                </div>
                {/* Pontos separados */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: isFirst ? '24px' : '19px', color, letterSpacing: '0.04em', lineHeight: 1 }}>
                    {p.supercopaPoints}<span style={{ fontSize: '0.6em', marginLeft: 2 }}>pt</span>
                  </div>
                  {p.tournament_points > 0 && (
                    <div style={{ fontSize: '10px', marginTop: '2px' }}>
                      <span style={{ color: 'var(--gold)' }}>{p.points}</span>
                      <span style={{ color: 'var(--text-3)' }}>+</span>
                      <span style={{ color: '#c084fc' }}>{p.tournament_points}</span>
                    </div>
                  )}
                </div>
                <div style={{ height: podiumH, width: '100%', background: isFirst ? 'rgba(232,184,75,0.10)' : 'var(--surface)', border: `1px solid ${color}33`, borderRadius: 'var(--r-sm) var(--r-sm) 0 0', borderBottom: 'none' }} />
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ranking.map((p, i) => {
          const isMe = p.id === user?.id
          const bar = (p.supercopaPoints / topScore) * 100
          const isExpanded = expandedId === p.id
          return (
            <div key={p.id} className="glass-card" style={{ padding: '12px 16px', border: isMe ? '1px solid rgba(232,184,75,0.28)' : undefined, background: isMe ? 'rgba(232,184,75,0.04)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 28, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '18px', color: i < 3 ? 'var(--gold)' : 'var(--text-3)', flexShrink: 0 }}>
                  {i < 3 ? MEDALS[i] : `${i + 1}º`}
                </div>
                <Avatar profile={p} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: isMe ? 'var(--gold-bright)' : 'var(--text)' }}>
                      {p.display_name || p.nick}
                      {isMe && <span style={{ fontSize: '10px', color: 'var(--text-3)', marginLeft: 6, fontWeight: 400 }}>você</span>}
                    </span>
                    {/* Pontos totais + breakdown */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
                        {p.supercopaPoints}
                      </div>
                      {p.tournament_points > 0 && (
                        <div style={{ fontSize: '10px', marginTop: '1px' }}>
                          <span style={{ color: 'var(--gold)' }}>{p.points}</span>
                          <span style={{ color: 'var(--text-3)' }}>+</span>
                          <span style={{ color: '#c084fc' }}>{p.tournament_points}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ height: 3, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${bar}%`, background: i === 0 ? 'linear-gradient(90deg, var(--gold), var(--gold-bright))' : 'rgba(232,238,248,0.22)', borderRadius: 2, transition: 'width 0.7s ease' }} />
                  </div>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isExpanded ? 'var(--gold)' : 'var(--text-3)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', flexShrink: 0 }}
                >
                  {[0, 1, 2].map(n => <span key={n} style={{ display: 'block', width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />)}
                </button>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', animation: 'fadeUp 0.15s ease' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    Jogos que pontuou
                  </div>
                  <ScoredGuesses userId={p.id} tournamentPoints={p.tournament_points || 0} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Aba CLASSIFICAÇÃO NEKOMÃO (só liga) ────────────────────────────────────────
const COL = '34px'
const COLS = `28px 1fr ${COL} ${COL} ${COL} ${COL} ${COL} ${COL}`
const hStyle = { fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }

function HeaderRow({ sortKey, sortDir, onSort }) {
  const cols = [
    { key: 'points',        label: 'PT' },
    { key: 'exact_hits',    label: 'PE' },
    { key: 'partial_hits',  label: 'PR' },
    { key: 'qualifier_hits',label: 'CC' },
    { key: 'master',        label: 'PM' },
    { key: 'guesses',       label: 'J'  },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '7px 14px', borderBottom: '1px solid var(--border)' }}>
      <div style={hStyle}>#</div>
      <div style={{ ...hStyle, textAlign: 'left', paddingLeft: 8 }}>Jogador</div>
      {cols.map(({ key, label }) => {
        const active = sortKey === key
        const isAsc = active && sortDir === 'asc'
        const isDesc = active && sortDir === 'desc'
        return (
          <button
            key={key}
            onClick={() => onSort(key)}
            style={{
              ...hStyle,
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
              color: active ? 'var(--gold)' : 'var(--text-3)',
              padding: 0,
            }}
          >
            {label}
            <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginLeft: '2px' }}>
              <span style={{ fontSize: '6px', lineHeight: 1, opacity: isAsc ? 1 : 0.3, color: active && isAsc ? 'var(--gold)' : 'currentColor' }}>▲</span>
              <span style={{ fontSize: '6px', lineHeight: 1, opacity: isDesc ? 1 : 0.3, color: active && isDesc ? 'var(--gold)' : 'currentColor' }}>▼</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function PlayerRow({ profile, position, isMe, totalGuesses, masterPoints }) {
  const posColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }
  const posColor = posColors[position] || 'var(--text-3)'
  const isTop3 = position <= 3
  const bgColor = isMe ? 'rgba(232,184,75,0.06)' : isTop3 ? 'rgba(255,255,255,0.02)' : 'transparent'

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: COLS, alignItems: 'center',
      padding: '9px 14px', background: bgColor,
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      borderLeft: isMe ? '3px solid var(--gold)' : isTop3 ? `3px solid ${posColor}` : '3px solid transparent',
      transition: 'background 0.15s',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: posColor, textAlign: 'center', lineHeight: 1 }}>{position}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, minWidth: 0 }}>
        <Avatar profile={profile} size={28} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: isMe ? 700 : 500, color: isMe ? 'var(--gold-bright)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.display_name || profile.nick}
          </div>
          {isMe && <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: 1 }}>você</div>}
        </div>
      </div>
      <div style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '17px', color: isTop3 ? posColor : 'var(--text)', letterSpacing: '0.02em', lineHeight: 1 }}>
        {profile.points ?? 0}
      </div>
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>{profile.exact_hits ?? 0}</div>
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>{profile.partial_hits ?? 0}</div>
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>{profile.qualifier_hits ?? 0}</div>
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>{masterPoints > 0 ? masterPoints : 0}</div>
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)' }}>{totalGuesses ?? 0}</div>
    </div>
  )
}

function NekomaoTab({ ranking, loading, user, guessCounts, masterGuesses }) {
  const [sortKey, setSortKey] = useState('points')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const ligaRanking = useMemo(() => {
    const arr = [...ranking].map(p => ({
      ...p,
      _master: masterGuesses[p.id] || 0,
      _guesses: guessCounts[p.id] || 0,
    }))

    const getVal = (p) => {
      if (sortKey === 'points')         return p.points ?? 0
      if (sortKey === 'exact_hits')     return p.exact_hits ?? 0
      if (sortKey === 'partial_hits')   return p.partial_hits ?? 0
      if (sortKey === 'qualifier_hits') return p.qualifier_hits ?? 0
      if (sortKey === 'master')         return p._master
      if (sortKey === 'guesses')        return p._guesses
      return 0
    }

    arr.sort((a, b) => {
      const diff = getVal(b) - getVal(a)
      const sorted = sortDir === 'desc' ? diff : -diff
      if (sorted !== 0) return sorted
      // desempate padrão
      return (b.points - a.points) || (b.exact_hits - a.exact_hits) || (b.partial_hits - a.partial_hits) || (new Date(a.created_at) - new Date(b.created_at))
    })
    return arr
  }, [ranking, guessCounts, masterGuesses, sortKey, sortDir])

  const myPosition = ligaRanking.findIndex(p => p.id === user?.id) + 1

  return (
    <>
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { sig: 'PT', desc: 'Pontos totais' },
          { sig: 'PE', desc: 'Placar exato' },
          { sig: 'PR', desc: 'Resultado certo' },
          { sig: 'CC', desc: 'Classificação certa' },
          { sig: 'PM', desc: 'Palpite Mestre' },
          { sig: 'J',  desc: 'Jogos palpitados' },
        ].map(({ sig, desc }) => (
          <div key={sig} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>{sig}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{desc}</span>
          </div>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 48, marginBottom: 4, borderRadius: 10 }} />
        ))
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <HeaderRow sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
          {ligaRanking.map((p, i) => (
            <PlayerRow key={p.id} profile={p} position={i + 1} isMe={p.id === user?.id} totalGuesses={p._guesses} masterPoints={p._master} />
          ))}
          {ligaRanking.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: '13px' }}>
              Nenhum participante ainda.
            </div>
          )}
        </div>
      )}

      {myPosition > 0 && !loading && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--gold-dim)', border: '1px solid rgba(232,184,75,0.22)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Sua posição na Liga</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', letterSpacing: '0.06em' }}>{myPosition}º</span>
        </div>
      )}
    </>
  )
}

// ── Aba PONTOS YUUTO KIDOU ────────────────────────────────────────────────────

// Calcula pontos de um usuário em cada fase (filtrando guesses por janela de datas)
function useTournamentBreakdown(userId) {
  const [breakdown, setBreakdown] = useState(null) // { oitavas: N, quartas: N, ... }

  useEffect(() => {
    if (!userId) return
    supabase
      .from('guesses')
      .select('points_earned, matches(match_date, status)')
      .eq('user_id', userId)
      .then(({ data: guesses }) => {
        const result = {}
        TOURNAMENT_PHASES.forEach(phase => {
          const start = new Date(phase.start + 'T00:00:00')
          const end = new Date(phase.end + 'T23:59:59')
          const pts = (guesses || [])
            .filter(g => {
              const md = g.matches?.match_date
              if (!md) return false
              const d = new Date(md)
              return d >= start && d <= end && g.matches?.status === 'finished'
            })
            .reduce((s, g) => s + (g.points_earned || 0), 0)
          result[phase.key] = pts
        })
        setBreakdown(result)
      })
  }, [userId])

  return breakdown
}

// Linha de um jogador no ranking do torneio
function TournamentRow({ profile, position, isMe, breakdown, phasesUnlocked }) {
  const [expanded, setExpanded] = useState(false)
  const posColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' }
  const posColor = posColors[position] || 'var(--text-3)'
  const isTop3 = position <= 3

  // Pontos acumulados nas fases que o jogador passou
  // tournament_points já é o acumulado salvo no banco — mas vamos mostrar o breakdown calculado
  const phaseBreakdown = useTournamentBreakdown(expanded ? profile.id : null)

  return (
    <div style={{
      padding: '10px 14px',
      background: isMe ? 'rgba(168,85,247,0.06)' : isTop3 ? 'rgba(255,255,255,0.02)' : 'transparent',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      borderLeft: isMe ? '3px solid #a855f7' : isTop3 ? `3px solid ${posColor}` : '3px solid transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Posição */}
        <div style={{ width: 28, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '15px', color: isTop3 ? posColor : 'var(--text-3)', flexShrink: 0 }}>
          {isTop3 ? MEDALS[position - 1] : `${position}º`}
        </div>
        <Avatar profile={profile} size={30} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: isMe ? 700 : 500, color: isMe ? '#c084fc' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.display_name || profile.nick}
            {isMe && <span style={{ fontSize: '10px', color: 'var(--text-3)', marginLeft: 6, fontWeight: 400 }}>você</span>}
          </div>
        </div>
        {/* Total torneio */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#c084fc', letterSpacing: '0.04em' }}>
            {profile.tournament_points || 0}
          </span>
          <span style={{ fontSize: '10px', color: '#c084fc', marginLeft: 2 }}>pt</span>
        </div>
        {/* Expand */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: expanded ? '#c084fc' : 'var(--text-3)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', flexShrink: 0 }}
        >
          {[0, 1, 2].map(n => <span key={n} style={{ display: 'block', width: '14px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />)}
        </button>
      </div>

      {/* Breakdown por fase */}
      {expanded && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(168,85,247,0.15)', animation: 'fadeUp 0.15s ease' }}>
          {phaseBreakdown === null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 28, borderRadius: 6 }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {TOURNAMENT_PHASES.map((phase, idx) => {
                const pts = phaseBreakdown[phase.key] || 0
                const unlocked = idx < phasesUnlocked
                const isCurrent = idx === phasesUnlocked - 1
                const passed = pts > 0 // simplificação: se fez pontos na fase, estava nela

                return (
                  <div key={phase.key} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '6px 10px', borderRadius: '8px',
                    background: pts > 0 ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                    opacity: unlocked ? 1 : 0.4,
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: pts > 0 ? '#c084fc' : 'var(--text-3)', minWidth: '64px' }}>
                      {phase.label}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: '9px', background: 'rgba(168,85,247,0.3)', color: '#c084fc', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>
                        AO VIVO
                      </span>
                    )}
                    <span style={{ flex: 1 }} />
                    {/* Pontos da liga na fase */}
                    <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                      {unlocked ? `${pts}pt na liga` : '—'}
                    </span>
                    {/* Bônus do torneio se passou */}
                    {unlocked && pts > 0 && (
                      <span style={{
                        fontSize: '12px', fontWeight: 700, color: '#c084fc',
                        background: 'rgba(168,85,247,0.15)', padding: '2px 8px', borderRadius: 8
                      }}>
                        +{phase.bonus}
                      </span>
                    )}
                    {unlocked && pts === 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>eliminado</span>
                    )}
                  </div>
                )
              })}

              {/* Total acumulado */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', marginTop: '4px', borderTop: '1px solid rgba(168,85,247,0.2)', borderRadius: '0 0 8px 8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>Total acumulado</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#c084fc', fontWeight: 700 }}>
                  {profile.tournament_points || 0}pt
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function YuutoTab({ ranking, loading, user, tournamentIds }) {
  const tourRanking = useMemo(() =>
    [...ranking]
      .filter(p => !tournamentIds || tournamentIds.has(p.id))
      .sort((a, b) => (b.tournament_points || 0) - (a.tournament_points || 0) || (b.points - a.points))
  , [ranking, tournamentIds])

  // Quantas fases já começaram
  const today = new Date()
  const phasesUnlocked = TOURNAMENT_PHASES.filter(ph => today >= new Date(ph.start + 'T00:00:00')).length || 1

  const myPosition = tourRanking.findIndex(p => p.id === user?.id) + 1

  return (
    <>
      {/* Explicação das fases */}
      <div style={{ marginBottom: '16px', padding: '12px 14px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 'var(--r-md)' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Pontuação por fase
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {TOURNAMENT_PHASES.map((ph, i) => {
            const active = i < phasesUnlocked
            return (
              <div key={ph.key} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: '11px', fontWeight: 600,
                background: active ? 'rgba(168,85,247,0.2)' : 'var(--surface)',
                border: `1px solid ${active ? 'rgba(168,85,247,0.4)' : 'var(--border)'}`,
                color: active ? '#c084fc' : 'var(--text-3)',
              }}>
                {ph.label} <span style={{ opacity: 0.7 }}>+{ph.bonus}pt</span>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '8px', lineHeight: 1.5 }}>
          Ganhe o confronto de cada fase para acumular os pontos bônus. Quem chegar na final acumula {TOURNAMENT_PHASES.reduce((s, p) => s + p.bonus, 0)}pt!
        </div>
      </div>

      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52, marginBottom: 4, borderRadius: 10 }} />
        ))
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '7px 14px', borderBottom: '1px solid var(--border)', gap: 10 }}>
            <div style={{ width: 28 }} />
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1, paddingLeft: 38 }}>Jogador</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PT</div>
            <div style={{ width: 30 }} />
          </div>

          {tourRanking.map((p, i) => (
            <TournamentRow
              key={p.id}
              profile={p}
              position={i + 1}
              isMe={p.id === user?.id}
              phasesUnlocked={phasesUnlocked}
            />
          ))}

          {tourRanking.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: '13px' }}>
              O torneio ainda não começou.
            </div>
          )}
        </div>
      )}

      {myPosition > 0 && !loading && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.22)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Sua posição no torneio</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#c084fc', letterSpacing: '0.06em' }}>{myPosition}º</span>
        </div>
      )}
    </>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function RankingPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [guessCounts, setGuessCounts] = useState({})
  const [masterGuesses, setMasterGuesses] = useState({})
  const [tournamentIds, setTournamentIds] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('supercopa')

  useEffect(() => {
    async function fetchData() {
      const [{ data: profiles }, { data: guesses }, { data: matchups }, { data: masterGuessData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, nick, avatar_url, points, exact_hits, partial_hits, qualifier_hits, tournament_points, created_at')
          .order('points', { ascending: false })
          .order('exact_hits', { ascending: false })
          .order('partial_hits', { ascending: false })
          .order('created_at', { ascending: true }),
        supabase.from('guesses').select('user_id'),
        supabase.from('tournament_matchups').select('player1_id, player2_id').eq('phase', 'oitavas'),
        supabase.from('master_guess').select('user_id, points_earned'),
      ])

      // Supercopa = liga + torneio
      const enriched = (profiles || []).map(p => ({
        ...p,
        tournament_points: p.tournament_points || 0,
        supercopaPoints: (p.points || 0) + (p.tournament_points || 0),
      }))

      // Ordena pela supercopa
      enriched.sort((a, b) =>
        (b.supercopaPoints - a.supercopaPoints) ||
        (b.exact_hits - a.exact_hits) ||
        (b.partial_hits - a.partial_hits) ||
        (new Date(a.created_at) - new Date(b.created_at))
      )

      const counts = {}
      ;(guesses || []).forEach(g => { counts[g.user_id] = (counts[g.user_id] || 0) + 1 })

      const mgMap = {}
      ;(masterGuessData || []).forEach(mg => { mgMap[mg.user_id] = mg.points_earned || 0 })

      const ids = new Set()
      ;(matchups || []).forEach(m => {
        if (m.player1_id) ids.add(m.player1_id)
        if (m.player2_id) ids.add(m.player2_id)
      })
      setTournamentIds(ids.size > 0 ? ids : null)

      setRanking(enriched)
      setGuessCounts(counts)
      setMasterGuesses(mgMap)
      setLoading(false)
    }

    fetchData()
    const channel = supabase.channel('ranking-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const tabs = [
    { key: 'supercopa',   label: 'Supercopa' },
    { key: 'nekomao',     label: 'Nekomão' },
    { key: 'yuuto',       label: 'Yuuto Kidou' },
  ]

  const titles = {
    supercopa: 'Ranking Supercopa',
    nekomao:   'Classificação Nekomão',
    yuuto:     'Pontos Yuuto Kidou',
  }

  return (
    <div className="page">
      <div className="section-title">{titles[view]}</div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '4px', marginBottom: '20px', gap: '4px' }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              flex: 1, padding: '9px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s',
              background: view === key ? (key === 'yuuto' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.1)') : 'transparent',
              color: view === key ? (key === 'yuuto' ? '#c084fc' : 'var(--text)') : 'var(--text-3)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'supercopa' && <SupercopaTab ranking={ranking} loading={loading} user={user} />}
      {view === 'nekomao'   && <NekomaoTab   ranking={ranking} loading={loading} user={user} guessCounts={guessCounts} masterGuesses={masterGuesses} />}
      {view === 'yuuto'     && <YuutoTab     ranking={ranking} loading={loading} user={user} tournamentIds={tournamentIds} />}
    </div>
  )
}
