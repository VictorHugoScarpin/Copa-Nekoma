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
  const podiumColors = ['var(--gold)', '#C0C0C0', '#CD7F32']

  return (
    <div className="page">
      <div className="section-title">Estatísticas</div>

      <div className="tab-bar" style={{ marginBottom: '24px' }}
        onTouchStart={e => { e.currentTarget._sx = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - (e.currentTarget._sx || 0)
          const tabs = ['scorers','assists']
          const cur = tabs.indexOf(tab)
          if (dx < -40 && cur < tabs.length - 1) setTab(tabs[cur + 1])
          if (dx > 40 && cur > 0) setTab(tabs[cur - 1])
        }}
      >
        {[['scorers', '⚽ Artilheiros'], ['assists', '👟 Assistências']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`tab-btn ${tab === key ? 'active' : ''}`}>{label}</button>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8, borderRadius: 14 }} />
        ))
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '60px 0', fontSize: '14px' }}>
          Dados ainda não disponíveis.
        </div>
      ) : (
        <>
          {data.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
              {[1, 0, 2].map(idx => {
                const p = data[idx]
                if (!p) return null
                const isFirst = idx === 0
                const color = podiumColors[idx]
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: isFirst ? 1.1 : 1 }}>
                    {p.photo_url
                      ? <img src={p.photo_url} alt="" style={{ width: isFirst ? 58 : 44, height: isFirst ? 58 : 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}` }} />
                      : <div style={{ width: isFirst ? 58 : 44, height: isFirst ? 58 : 44, borderRadius: '50%', background: `${color}1a`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isFirst ? 30 : 22 }}>{p.flag_emoji || '🏳️'}</div>
                    }
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: isFirst ? '30px' : '22px', color, letterSpacing: '0.04em', lineHeight: 1 }}>{p[valueKey]}</div>
                    <div style={{ fontSize: isFirst ? '13px' : '11px', fontWeight: 600, color: 'var(--text)', textAlign: 'center', maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {p.flag_emoji && <span style={{ fontSize: '13px' }}>{p.flag_emoji}</span>}
                      <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{p.team_name}</span>
                    </div>
                    <div style={{ fontSize: '10px', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{valueLabel}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.map((p, i) => (
              <div key={p.id} className="glass-card" style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 24, fontFamily: 'var(--font-display)', fontSize: '16px', color: i < 3 ? 'var(--gold)' : 'var(--text-3)', textAlign: 'center', flexShrink: 0 }}>{i + 1}</div>
                {p.photo_url
                  ? <img src={p.photo_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.flag_emoji || '⚽'}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 2 }}>
                    {p.flag_emoji && <span>{p.flag_emoji}</span>}
                    <span>{p.team_name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}>{p[valueKey]}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{valueLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
