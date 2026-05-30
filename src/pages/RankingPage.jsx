import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const MEDALS = ['🥇', '🥈', '🥉']

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

    const channel = supabase
      .channel('ranking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchRanking)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const topScore = ranking[0]?.points || 0

  return (
    <div className="page">
      <div className="section-title">Ranking</div>

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '64px', marginBottom: '8px', borderRadius: '12px' }} />
        ))
      ) : (
        <>
          {/* Top 3 podium */}
          {ranking.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', marginBottom: '32px', marginTop: '8px' }}>
              {[1, 0, 2].map((idx) => {
                const p = ranking[idx]
                if (!p) return null
                const heights = [90, 120, 70]
                const podiumH = heights[idx === 0 ? 1 : idx === 1 ? 0 : 2]
                return (
                  <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: idx === 0 ? 1.1 : 1 }}>
                    <span style={{ fontSize: '28px' }}>{MEDALS[idx]}</span>
                    <Avatar profile={p} size={idx === 0 ? 48 : 40} />
                    <div style={{ fontSize: idx === 0 ? '14px' : '12px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.display_name}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: idx === 0 ? '22px' : '18px', color: 'var(--accent-gold)', letterSpacing: '0.04em' }}>{p.points}pt</div>
                    <div style={{ height: `${podiumH}px`, width: '100%', background: idx === 0 ? 'rgba(201,168,76,0.15)' : 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', borderBottom: 'none' }} />
                  </div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ranking.map((p, i) => {
              const isMe = p.id === user.id
              const bar = topScore > 0 ? (p.points / topScore) * 100 : 0
              return (
                <div key={p.id} className="glass-card" style={{ padding: '12px 16px', border: isMe ? '1px solid rgba(201,168,76,0.3)' : undefined }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '18px', color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                      {i < 3 ? MEDALS[i] : `${i + 1}º`}
                    </div>
                    <Avatar profile={p} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 500, color: isMe ? 'var(--accent-gold)' : 'var(--text-primary)', fontSize: '14px' }}>
                          {p.display_name} {isMe && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• você</span>}
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{p.points}</span>
                      </div>
                      <div style={{ height: '3px', background: 'var(--bg-glass)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${bar}%`, background: i === 0 ? 'var(--accent-gold)' : 'rgba(240,244,255,0.3)', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                  {false && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', paddingLeft: '40px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>✓ Exatos: <strong style={{ color: 'var(--green)' }}>{p.exact_hits || 0}</strong></span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>~ Parciais: <strong style={{ color: 'var(--accent-gold)' }}>{p.partial_hits || 0}</strong></span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function Avatar({ profile, size = 36 }) {
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  const initials = (profile.display_name || profile.nick || '?').slice(0, 2).toUpperCase()
  const colors = ['#c9a84c', '#22c55e', '#3b82f6', '#ef4444', '#a855f7']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: size * 0.38, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}
