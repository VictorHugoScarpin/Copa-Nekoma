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
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '8px 0' }}>Sem dados ainda</div>
    </div>
  )

  return (
    <div className="glass-card" style={{ padding: '16px', border: `1px solid ${color}22` }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.06em', color: 'var(--text)', lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

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

function ComoFunciona() {
  const [open, setOpen] = useState(false)

  const regras = [
    { icon: '🔥', title: 'Em Chamas', desc: 'Maior sequência de acertos consecutivos (placar exato ou resultado certo) nos jogos finalizados.' },
    { icon: '🎯', title: 'Pé Quente', desc: 'Quem acertou mais placares exatos ao longo da Copa. Placar exato = 3 pontos.' },
    { icon: '🦓', title: 'Zebra', desc: 'Quem acertou o resultado de jogos que a maioria da galera errou. O visionário do grupo!' },
    { icon: '📊', title: 'Consistente', desc: 'Melhor porcentagem de acertos (placar exato + resultado certo) em relação ao total de jogos palpitados. Mínimo de 3 jogos para entrar.' },
    { icon: '⚡', title: 'Mais Ativo', desc: 'Quem mais registrou palpites no total, independente de acertos. Participação é tudo!' },
    { icon: '🤝', title: 'Diplomata', desc: 'Quem mais apostou em empate nos jogos. Acredita na paz entre as nações!' },
    { icon: '💀', title: 'Azarão', desc: 'Quem zerou mais vezes — palpites em jogos finalizados que não renderam nenhum ponto. Não é desonra, é azar mesmo!' },
  ]

  return (
    <div className="glass-card" style={{ marginTop: 16, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
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

export default function HallPage() {
  const [profiles, setProfiles] = useState([])
  const [guesses, setGuesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: prof }, { data: gues }] = await Promise.all([
        supabase.from('profiles').select('*').order('points', { ascending: false }),
        supabase.from('guesses').select('*, matches(status, home_score, away_score)'),
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

  const finishedGuesses = guesses.filter(g => g.matches?.status === 'finished')

  // 1. EM CHAMAS — maior sequência de acertos consecutivos
  const emChamas = profiles.map(p => {
    const meus = finishedGuesses
      .filter(g => g.user_id === p.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let maxSeq = 0, curSeq = 0
    for (const g of meus) {
      if ((g.points_earned || 0) > 0) { curSeq++; maxSeq = Math.max(maxSeq, curSeq) }
      else curSeq = 0
    }
    return { ...p, _value: maxSeq }
  }).sort((a, b) => b._value - a._value)

  // 2. PÉ QUENTE — mais placares exatos
  const peQuente = [...profiles]
    .map(p => ({ ...p, _value: p.exact_hits || 0 }))
    .sort((a, b) => b._value - a._value)

  // 3. ZEBRA — acertou jogos que a maioria errou
  // Para cada jogo finalizado, ver quem acertou quando menos de 50% acertou
  const zebraPoints = {}
  profiles.forEach(p => { zebraPoints[p.id] = 0 })

  const matchIds = [...new Set(finishedGuesses.map(g => g.match_id))]
  for (const matchId of matchIds) {
    const jogoPalpites = finishedGuesses.filter(g => g.match_id === matchId)
    const totalJogo = jogoPalpites.length
    if (totalJogo < 2) continue
    const acertaram = jogoPalpites.filter(g => (g.points_earned || 0) > 0)
    // Zebra = menos de 30% acertou
    if (acertaram.length / totalJogo < 0.30) {
      acertaram.forEach(g => { if (zebraPoints[g.user_id] !== undefined) zebraPoints[g.user_id]++ })
    }
  }
  const zebra = profiles
    .map(p => ({ ...p, _value: zebraPoints[p.id] || 0 }))
    .sort((a, b) => b._value - a._value)

  // 4. CONSISTENTE — melhor % de acertos
  const consistente = profiles.map(p => {
    const meus = finishedGuesses.filter(g => g.user_id === p.id)
    const total = meus.length
    const acertos = (p.exact_hits || 0) + (p.partial_hits || 0)
    const pct = total >= 3 ? Math.round((acertos / total) * 100) : 0
    return { ...p, _value: pct, _total: total }
  }).filter(p => p._total >= 3).sort((a, b) => b._value - a._value)

  // 5. MAIS ATIVO — mais palpites registrados
  const maisAtivo = profiles.map(p => {
    const total = guesses.filter(g => g.user_id === p.id).length
    return { ...p, _value: total }
  }).sort((a, b) => b._value - a._value)

  // 6. DIPLOMATA — mais apostas em empate (home_score === away_score no palpite)
  const diplomata = profiles.map(p => {
    const empates = guesses.filter(g => g.user_id === p.id && g.home_score === g.away_score).length
    return { ...p, _value: empates }
  }).sort((a, b) => b._value - a._value)

  // 7. AZARÃO — mais zeros em jogos finalizados
  const azarao = profiles.map(p => {
    const meus = finishedGuesses.filter(g => g.user_id === p.id)
    const zeros = meus.filter(g => (g.points_earned || 0) === 0).length
    return { ...p, _value: zeros }
  }).sort((a, b) => b._value - a._value)

  const stats = [
    { icon: '🔥', title: 'EM CHAMAS', subtitle: 'Maior sequência de acertos consecutivos', data: emChamas, unit: 'seguidos', color: '#f97316' },
    { icon: '🎯', title: 'PÉ QUENTE', subtitle: 'Mais placares exatos', data: peQuente, unit: 'exatos', color: 'var(--gold)' },
    { icon: '🦓', title: 'ZEBRA', subtitle: 'Acertou quando a maioria errou', data: zebra, unit: 'zebras', color: '#a855f7' },
    { icon: '📊', title: 'CONSISTENTE', subtitle: 'Melhor % de acertos (mín. 3 jogos)', data: consistente, unit: '%', color: 'var(--green)' },
    { icon: '⚡', title: 'MAIS ATIVO', subtitle: 'Mais palpites registrados', data: maisAtivo, unit: 'palp.', color: 'var(--blue)' },
    { icon: '🤝', title: 'DIPLOMATA', subtitle: 'Quem mais apostou em empate', data: diplomata, unit: 'empates', color: '#06b6d4' },
    { icon: '💀', title: 'AZARÃO', subtitle: 'Mais palpites sem ponto', data: azarao, unit: 'zeros', color: 'var(--red)' },
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
            player={data[0]?._value > 0 ? data[0] : null}
            value={data[0]?._value ?? '-'}
            unit={unit}
            color={color}
            rank={data.filter(p => p._value > 0)}
          />
        ))}
      </div>

      <ComoFunciona />
    </div>
  )
}
