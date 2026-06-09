import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

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

export default function RankingPage() {
  const { user } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRanking() {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, nick, avatar_url, points, exact_hits, partial_hits')
        .order('points', { ascending: false })
      setRanking(data || [])
      setLoading(false)
    }
    fetchRanking()
    const channel = supabase.channel('ranking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchRanking)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const topScore = ranking[0]?.points || 1

  return (
    <div className="page">
      <div className="section-title">Ranking</div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8, borderRadius: 14 }} />
        ))
      ) : (
        <>
          {/* Pódio top 3 */}
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

          {/* Lista completa */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ranking.map((p, i) => {
              const isMe = p.id === user.id
              const bar = (p.points / topScore) * 100
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
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
