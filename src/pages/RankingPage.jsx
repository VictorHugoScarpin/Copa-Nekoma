import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FlagCircle, getPT, getGuessResult } from '../lib/teams'

const MEDALS = ['🥇', '🥈', '🥉']

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

// ── Lista de jogos em que o usuário pontuou ─────────────────────────────────

const KNOCKOUT_START_R = new Date('2026-06-28T00:00:00')

function ScoredGuesses({ userId }) {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let active = true
    supabase
      .from('guesses')
      .select('home_score, away_score, qualifier_guess, matches(home_team, away_team, home_score, away_score, status, match_date, qualifier_result)')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!active) return
        const scored = (data || [])
          .filter(g => {
            const m = g.matches
            if (!m || m.status !== 'finished') return false
            const result = getGuessResult(g, m.home_score, m.away_score)
            return result === 'exact' || result === 'partial'
          })
          .sort((a, b) => new Date(a.matches.match_date) - new Date(b.matches.match_date))
        setItems(scored)
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

  if (items.length === 0) {
    return (
      <div style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', padding: '10px 0' }}>
        Nenhuma pontuação ainda.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items.map((g, i) => {
        const m = g.matches
        const result = getGuessResult(g, m.home_score, m.away_score)
        const isExact = result === 'exact'
        const isKo = new Date(m.match_date) >= KNOCKOUT_START_R
        const qualifierHit = isKo && g.qualifier_guess && m.qualifier_result && g.qualifier_guess === m.qualifier_result
        const blueCombo = qualifierHit && (isExact || result === 'partial')
        const basePoints = isExact ? 3 : 1
        const totalPoints = basePoints + (qualifierHit ? 2 : 0)

        const color = blueCombo ? '#60a5fa' : isExact ? 'var(--green)' : 'var(--gold)'
        const bg = blueCombo ? 'rgba(59,130,246,0.1)' : isExact ? 'var(--green-dim)' : 'rgba(232,184,75,0.08)'
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

// ── Aba RANKING (visual, com pódio) ─────────────────────────────────────────

function RankingTab({ ranking, loading, user }) {
  const [expandedId, setExpandedId] = useState(null)
  const topScore = ranking[0]?.points || 1

  if (loading) {
    return Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8, borderRadius: 14 }} />
    ))
  }

  return (
    <>
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
                <div style={{ fontFamily: 'var(--font-display)', fontSize: isFirst ? '24px' : '19px', color, letterSpacing: '0.04em', lineHeight: 1 }}>
                  {p.points}<span style={{ fontSize: '0.6em', marginLeft: 2 }}>pt</span>
                </div>
                <div style={{ height: podiumH, width: '100%', background: isFirst ? 'rgba(232,184,75,0.10)' : 'var(--surface)', border: `1px solid ${color}33`, borderRadius: 'var(--r-sm) var(--r-sm) 0 0', borderBottom: 'none' }} />
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {ranking.map((p, i) => {
          const isMe = p.id === user.id
          const bar = (p.points / topScore) * 100
          const isExpanded = expandedId === p.id
          return (
            <div key={p.id} className="glass-card" style={{ padding: '12px 16px', border: isMe ? '1px solid rgba(232,184,75,0.28)' : undefined, background: isMe ? 'rgba(232,184,75,0.04)' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 28, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '18px', color: i < 3 ? 'var(--gold)' : 'var(--text-3)', flexShrink: 0 }}>
                  {i < 3 ? MEDALS[i] : `${i + 1}º`}
                </div>
                <Avatar profile={p} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: isMe ? 'var(--gold-bright)' : 'var(--text)' }}>
                      {p.display_name || p.nick}
                      {isMe && <span style={{ fontSize: '10px', color: 'var(--text-3)', marginLeft: 6, fontWeight: 400 }}>você</span>}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>
                      {p.points}
                    </span>
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
                  <ScoredGuesses userId={p.id} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Aba CLASSIFICAÇÃO (tabela detalhada) ────────────────────────────────────

const COL = '34px'
const COLS = `28px 1fr ${COL} ${COL} ${COL} ${COL} ${COL}`
const hStyle = { fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }

function HeaderRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '7px 14px', borderBottom: '1px solid var(--border)' }}>
      <div style={hStyle}>#</div>
      <div style={{ ...hStyle, textAlign: 'left', paddingLeft: 8 }}>Jogador</div>
      <div style={hStyle}>PT</div>
      <div style={hStyle}>PE</div>
      <div style={hStyle}>PR</div>
      <div style={hStyle}>CC</div>
      <div style={hStyle}>J</div>
    </div>
  )
}

function PlayerRow({ profile, position, isMe, totalGuesses }) {
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
      <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)' }}>{totalGuesses ?? 0}</div>
    </div>
  )
}

function ClassificacaoTab({ ranking, loading, user, guessCounts }) {
  const myPosition = ranking.findIndex(p => p.id === user?.id) + 1

  return (
    <>
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { sig: 'PT', desc: 'Pontos totais' },
          { sig: 'PE', desc: 'Placar exato' },
          { sig: 'PR', desc: 'Resultado certo' },
          { sig: 'CC', desc: 'Classificação certa' },
          { sig: 'J',  desc: 'Jogos palpitados' },
        ].map(({ sig, desc, blue }) => (
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
          <HeaderRow />
          {ranking.map((p, i) => (
            <PlayerRow key={p.id} profile={p} position={i + 1} isMe={p.id === user?.id} totalGuesses={guessCounts[p.id] || 0} />
          ))}
          {ranking.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: '13px' }}>
              Nenhum participante ainda.
            </div>
          )}
        </div>
      )}

      {myPosition > 0 && !loading && (
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--gold-dim)', border: '1px solid rgba(232,184,75,0.22)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Sua posição atual</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', letterSpacing: '0.06em' }}>{myPosition}º</span>
        </div>
      )}
    </>
  )
}

// ── Página principal — toggle Ranking / Classificação ───────────────────────

export default function RankingPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [guessCounts, setGuessCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('ranking')

  useEffect(() => {
    async function fetchData() {
      const [{ data: profiles }, { data: guesses }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, display_name, nick, avatar_url, points, exact_hits, partial_hits, qualifier_hits, created_at')
          .order('points', { ascending: false })
          .order('exact_hits', { ascending: false })
          .order('partial_hits', { ascending: false })
          .order('created_at', { ascending: true }),
        supabase.from('guesses').select('user_id'),
      ])

      const counts = {}
      ;(guesses || []).forEach(g => { counts[g.user_id] = (counts[g.user_id] || 0) + 1 })

      setRanking(profiles || [])
      setGuessCounts(counts)
      setLoading(false)
    }

    fetchData()
    const channel = supabase.channel('ranking-classificacao')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div className="page">
      <div className="section-title">{view === 'ranking' ? 'Ranking' : 'Classificação'}</div>

      {/* Toggle Ranking / Classificação */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '4px', marginBottom: '20px', gap: '4px' }}>
        {[['ranking', '🏆 Ranking'], ['classificacao', '📊 Classificação']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
              background: view === key ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: view === key ? 'var(--text)' : 'var(--text-3)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'ranking'
        ? <RankingTab ranking={ranking} loading={loading} user={user} />
        : <ClassificacaoTab ranking={ranking} loading={loading} user={user} guessCounts={guessCounts} />
      }
    </div>
  )
}
