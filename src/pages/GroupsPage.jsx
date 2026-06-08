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

function getFlag(name) {
  return FLAG_MAP[name] || '🏳️'
}

function getPT(name) {
  return TEAM_PT[name] || name
}

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
  // Remove "Grupo " se já vier do banco, deixa só a letra
  const letra = groupName.replace(/^Grupo\s*/i, '').toUpperCase()

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(201,168,76,0.07)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>
          GRUPO {letra}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 32px 32px 32px 32px 32px 36px', gap: '2px', padding: '8px 16px', borderBottom: '1px solid var(--border-glass)' }}>
        {['', 'GF', 'J', 'V', 'E', 'D', 'SG', 'PT'].map((h, i) => (
          <div key={i} style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textAlign: i === 0 ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
        ))}
      </div>

      {teams.map((team, idx) => (
        <TeamRow key={team.id} team={team} position={idx + 1} isQualified={idx < 2} isLast={idx === teams.length - 1} />
      ))}
    </div>
  )
}

function TeamRow({ team, position, isQualified, isLast }) {
  const flag = team.flag_emoji || getFlag(team.team_name)
  const namePT = getPT(team.team_name)

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
      {/* Bandeira gigante de fundo decorativa */}
      <div style={{
        position: 'absolute', right: '60px', top: '50%',
        transform: 'translateY(-50%)', fontSize: '48px',
        opacity: 0.06, pointerEvents: 'none', userSelect: 'none',
      }}>
        {flag}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isQualified
          ? <div style={{ width: '3px', height: '20px', borderRadius: '2px', background: 'var(--green)', flexShrink: 0 }} />
          : <div style={{ width: '3px', flexShrink: 0 }} />
        }
        {/* Bolinha com bandeira + escudo de fundo */}
        <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-glass)', background: '#111' }}>
          {team.shield_url && (
            <img src={team.shield_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', lineHeight: 1 }}>
            {flag}
          </div>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{namePT}</span>
      </div>

      {[team.goals_for, team.played, team.won, team.drawn, team.lost, team.goal_diff, team.points].map((val, i) => (
        <div key={i} style={{
          textAlign: 'center', fontSize: '13px',
          color: i === 6 ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: i === 6 ? 700 : 400,
          fontFamily: i === 6 ? 'var(--font-display)' : 'var(--font-body)',
          letterSpacing: i === 6 ? '0.04em' : 0,
        }}>
          {val ?? '-'}
        </div>
      ))}
    </div>
  )
}
