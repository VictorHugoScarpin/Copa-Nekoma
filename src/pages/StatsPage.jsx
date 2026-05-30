import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function StatsPage() {
  const [scorers, setScorers] = useState([])
  const [assists, setAssists] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('scorers')

  useEffect(() => {
    async function fetchStats() {
      const [s, a] = await Promise.all([
        supabase.from('top_scorers').select('*').order('goals', { ascending: false }).limit(10),
        supabase.from('top_assists').select('*').order('assists', { ascending: false }).limit(10),
      ])
      setScorers(s.data || [])
      setAssists(a.data || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  const data = tab === 'scorers' ? scorers : assists
  const valueKey = tab === 'scorers' ? 'goals' : 'assists'
  const valueLabel = tab === 'scorers' ? 'gols' : 'assist.'

  return (
    <div className="page">
      <div className="section-title">Estatísticas</div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '24px' }}>
        {[['scorers', '⚽ Artilheiros'], ['assists', '👟 Assistências']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '64px', marginBottom: '8px', borderRadius: '12px' }} />
        ))
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '14px' }}>
          Dados ainda não disponíveis.
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {data.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
              {[1, 0, 2].map(idx => {
                const p = data[idx]
                if (!p) return null
                const isFirst = idx === 0
                const podiumColors = ['var(--accent-gold)', '#C0C0C0', '#CD7F32']
                const color = podiumColors[idx]
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: isFirst ? 1.1 : 1 }}>
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" style={{ width: isFirst ? 56 : 44, height: isFirst ? 56 : 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}` }} />
                    ) : (
                      <div style={{ width: isFirst ? 56 : 44, height: isFirst ? 56 : 44, borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFirst ? 28 : 22 }}>
                        {p.flag_emoji || '🏳️'}
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: isFirst ? '28px' : '22px', color, letterSpacing: '0.04em' }}>
                      {p[valueKey]}
                    </div>
                    <div style={{ fontSize: isFirst ? '13px' : '11px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.player_name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {p.flag_emoji && <span style={{ fontSize: '14px' }}>{p.flag_emoji}</span>}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.team_name}</span>
                    </div>
                    <div style={{ fontSize: '10px', color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{valueLabel}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.map((p, i) => (
              <div key={p.id} className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', fontFamily: 'var(--font-display)', fontSize: '16px', color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', textAlign: 'center', flexShrink: 0 }}>
                  {i + 1}
                </div>
                {p.photo_url ? (
                  <img src={p.photo_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {p.flag_emoji || '⚽'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {p.flag_emoji && <span>{p.flag_emoji}</span>}
                    <span>{p.team_name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text-primary)', letterSpacing: '0.04em', lineHeight: 1 }}>{p[valueKey]}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{valueLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
