import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function GroupsPage() {
  const [groups, setGroups] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGroups() {
      const { data } = await supabase
        .from('group_standings')
        .select('*')
        .order('group_name')
        .order('points', { ascending: false })
        .order('goal_diff', { ascending: false })

      const grouped = {}
      ;(data || []).forEach(row => {
        if (!grouped[row.group_name]) grouped[row.group_name] = []
        grouped[row.group_name].push(row)
      })
      setGroups(grouped)
      setLoading(false)
    }
    fetchGroups()
  }, [])

  if (loading) return (
    <div className="page">
      <div className="section-title">Grupos</div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '200px', marginBottom: '16px', borderRadius: '12px' }} />
      ))}
    </div>
  )

  return (
    <div className="page">
      <div className="section-title">Fase de Grupos</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Object.entries(groups).map(([groupName, teams]) => (
          <GroupCard key={groupName} groupName={groupName} teams={teams} />
        ))}
        {Object.keys(groups).length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: '14px' }}>
            Classificação ainda não disponível.
          </div>
        )}
      </div>
    </div>
  )
}

function GroupCard({ groupName, teams }) {
  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Group header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(201,168,76,0.07)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>
          GRUPO {groupName}
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 32px 32px 32px 32px 36px', gap: '2px', padding: '8px 16px', borderBottom: '1px solid var(--border-glass)' }}>
        {['', 'P', 'J', 'V', 'E', 'D', 'SG', 'PT'].map((h, i) => (
          <div key={i} style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textAlign: i === 0 ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
        ))}
      </div>

      {/* Team rows */}
      {teams.map((team, idx) => (
        <TeamRow key={team.id} team={team} position={idx + 1} isQualified={idx < 2} isLast={idx === teams.length - 1} />
      ))}
    </div>
  )
}

function TeamRow({ team, position, isQualified, isLast }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 32px 32px 32px 32px 32px 32px 36px',
      gap: '2px',
      padding: '10px 16px',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
      background: isQualified ? 'rgba(34,197,94,0.03)' : 'transparent',
      position: 'relative',
    }}>
      {/* Flag background (decorative) */}
      {team.flag_emoji && (
        <div style={{ position: 'absolute', right: '60px', top: '50%', transform: 'translateY(-50%)', fontSize: '48px', opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }}>
          {team.flag_emoji}
        </div>
      )}

      {/* Team name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isQualified && <div style={{ width: '3px', height: '20px', borderRadius: '2px', background: 'var(--green)', flexShrink: 0 }} />}
        {!isQualified && <div style={{ width: '3px', flexShrink: 0 }} />}
        {team.flag_emoji && <span style={{ fontSize: '18px', lineHeight: 1 }}>{team.flag_emoji}</span>}
        {team.shield_url && <img src={team.shield_url} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />}
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{team.team_name}</span>
      </div>

      {[team.goals_for, team.played, team.won, team.drawn, team.lost, team.goal_diff, team.points].map((val, i) => (
        <div key={i} style={{ textAlign: 'center', fontSize: '13px', color: i === 6 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: i === 6 ? 700 : 400, fontFamily: i === 6 ? 'var(--font-display)' : 'var(--font-body)', letterSpacing: i === 6 ? '0.04em' : 0 }}>
          {val ?? '-'}
        </div>
      ))}
    </div>
  )
}
