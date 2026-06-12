import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Avatar({ profile, size = 40 }) {
  if (profile.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-strong)' }} />
  }
  const initials = (profile.display_name || profile.nick || '?').slice(0, 2).toUpperCase()
  const colors = ['#f5c518', '#00c853', '#4d8ef0', '#f03e3e', '#a855f7']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}1a`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
      {initials}
    </div>
  )
}

function StatCard({ icon, title, subtitle, player, value, unit, color, rank }) {
  if (!player) return (
    <div className="glass-card" style={{ padding: '16px', opacity: 0.5 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.06em', color: 'var(--text)' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '8px 0' }}>Sem dados ainda</div>
    </div>
  )

  return (
    <div className="glass-card" style={{ padding: '16px', border: `1px solid ${color}22` }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

      {/* Campeão */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: `${color}0d`, borderRadius: 'var(--r-md)', border: `1px solid ${color}1a` }}>
        <Avatar profile={player} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {player.display_name || player.nick}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>@{player.nick}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color, letterSpacing: '0.04em', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{unit}</div>
        </div>
      </div>

      {/* Runners up */}
      {rank && rank.slice(1, 3).length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {rank.slice(1, 3).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 2}º</span>
              <Avatar profile={p} size={24} />
              <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.display_name || p.nick}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>{p._value} {unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HallPage() {
  const [profiles, setProfiles] = useState([])
  const [guesses, setGuesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: prof }, { data: gues }] = await Promise.all([
        supabase.from('profiles').select('*').order('points', { ascending: false }),
        supabase.from('guesses').select('*, matches(status)'),
      ])
      setProfiles(prof || [])
      setGuesses(gues || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="page">
      <div className="section-title">Hall da Fama</div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 140, marginBottom: 12, borderRadius: 14 }} />
      ))}
    </div>
  )

  // Calcular métricas
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

  // Jogos finalizados
  const finishedGuesses = guesses.filter(g => g.matches?.status === 'finished')
  const totalFinished = guesses.filter(g => g.matches?.status === 'finished').length

  // 1. Maior Pé Quente — mais placares exatos
  const peQueente = [...profiles].sort((a, b) => (b.exact_hits || 0) - (a.exact_hits || 0))
    .map(p => ({ ...p, _value: p.exact_hits || 0 }))

  // 2. Mais Consistente — melhor % de acertos (exact + partial) / jogos palpitados
  const consistencia = profiles.map(p => {
    const meusPalpites = finishedGuesses.filter(g => g.user_id === p.id)
    const total = meusPalpites.length
    const acertos = (p.exact_hits || 0) + (p.partial_hits || 0)
    const pct = total > 0 ? Math.round((acertos / total) * 100) : 0
    return { ...p, _value: pct, _total: total }
  }).filter(p => p._total >= 3).sort((a, b) => b._value - a._value)

  // 3. Azarão — mais zeros (palpites sem ponto nenhum em jogos finalizados)
  const azarao = profiles.map(p => {
    const meusPalpites = finishedGuesses.filter(g => g.user_id === p.id)
    const zeros = meusPalpites.filter(g => (g.points_earned || 0) === 0).length
    return { ...p, _value: zeros }
  }).sort((a, b) => b._value - a._value)

  // 4. Mais Ativo — mais palpites feitos no total
  const maisAtivo = profiles.map(p => {
    const total = guesses.filter(g => g.user_id === p.id).length
    return { ...p, _value: total }
  }).sort((a, b) => b._value - a._value)

  const stats = [
    {
      icon: '🎯', title: 'MAIOR PÉ QUENTE', subtitle: 'Mais placares exatos',
      data: peQueente, unit: 'exatos', color: 'var(--gold)',
    },
    {
      icon: '📊', title: 'MAIS CONSISTENTE', subtitle: 'Melhor % de acertos (mín. 3 jogos)',
      data: consistencia, unit: '%', color: 'var(--green)',
    },
    {
      icon: '💀', title: 'AZARÃO', subtitle: 'Mais palpites sem ponto',
      data: azarao, unit: 'zeros', color: 'var(--red)',
    },
    {
      icon: '⚡', title: 'MAIS ATIVO', subtitle: 'Mais palpites registrados',
      data: maisAtivo, unit: 'palp.', color: 'var(--blue)',
    },
  ]

  return (
    <div className="page">
      <div className="section-title">Hall da Fama</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.5 }}>
        Estatísticas da galera baseadas nos palpites do bolão.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {stats.map(({ icon, title, subtitle, data, unit, color }) => (
          <StatCard
            key={title}
            icon={icon}
            title={title}
            subtitle={subtitle}
            player={data[0] || null}
            value={data[0]?._value ?? '-'}
            unit={unit}
            color={color}
            rank={data}
          />
        ))}
      </div>

      <ComoFunciona />
    </div>
  )
}

function ComoFunciona() {
  const [open, setOpen] = useState(false)

  const regras = [
    { icon: '🎯', title: 'Maior Pé Quente', desc: 'Quem acertou mais placares exatos ao longo da Copa. Placar exato = 3 pontos.' },
    { icon: '📊', title: 'Mais Consistente', desc: 'Melhor porcentagem de acertos (placar exato + resultado certo) em relação ao total de jogos palpitados. Mínimo de 3 jogos para entrar.' },
    { icon: '💀', title: 'Azarão', desc: 'Quem zerou mais vezes — palpites em jogos finalizados que não renderam nenhum ponto. Não é desonra, é azar mesmo!' },
    { icon: '⚡', title: 'Mais Ativo', desc: 'Quem mais registrou palpites no total, independente de acertos. Participação é tudo!' },
  ]

  return (
    <div className="glass-card" style={{ marginTop: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>❓</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Como cada categoria é calculada?</span>
        </div>
        <span style={{ color: 'var(--text-3)', fontSize: 12, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.2s ease' }}>
          {regras.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
