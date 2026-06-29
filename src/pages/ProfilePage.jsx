import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import QuizProfileCard from '../components/QuizProfileCard'

// ── Regras da Liga ────────────────────────────────────────────────────────────
function RegrasLiga() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>
          FASE DE GRUPOS
        </div>
        {[
          { icon: '🎯', label: 'Placar Exato',   desc: 'Acertou o placar certinho (ex: 2×1 = 2×1)', pts: '+3', color: 'var(--green)' },
          { icon: '✅', label: 'Vencedor Certo', desc: 'Acertou quem ganhou mas errou o placar',     pts: '+1', color: 'var(--gold)' },
          { icon: '🤝', label: 'Empate Certo',   desc: 'Previu empate e deu empate',                 pts: '+1', color: 'var(--gold)' },
          { icon: '❌', label: 'Errou',           desc: 'Não acertou nem o resultado',               pts: '0',  color: 'var(--red)' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: item.color, flexShrink: 0 }}>{item.pts}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', marginBottom: '6px', letterSpacing: '0.06em' }}>
          MATA-MATA
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '14px', lineHeight: 1.6 }}>
          A partir de <strong style={{ color: 'var(--text-2)' }}>28 de junho</strong>, além do palpite de placar você também escolhe <strong style={{ color: 'var(--text-2)' }}>quem se classifica</strong> — e isso vale pontos extras!
        </div>
        {[
          { icon: '⚡', label: 'Placar exato + classificado certo',         pts: '+5', color: 'var(--green)', desc: 'Acertou o placar certinho e o time que avança' },
          { icon: '🎯', label: 'Placar exato (sem acertar classificado)',    pts: '+3', color: 'var(--green)', desc: 'Acertou 2×1 = 2×1, mas errou quem classificou' },
          { icon: '✅', label: 'Resultado certo + classificado certo',       pts: '+3', color: '#60a5fa',      desc: 'Acertou o vencedor/empate e quem avança' },
          { icon: '✅', label: 'Resultado certo (sem acertar classificado)', pts: '+1', color: 'var(--gold)',  desc: 'Acertou quem ganhou mas errou o classificado' },
          { icon: '🏅', label: 'Só acertou quem classifica',                pts: '+2', color: '#60a5fa',      desc: 'Errou placar/resultado mas acertou quem avança' },
          { icon: '❌', label: 'Errou tudo',                                 pts: '0',  color: 'var(--red)',   desc: 'Não acertou placar, resultado nem classificado' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: item.color, flexShrink: 0 }}>{item.pts}</div>
          </div>
        ))}
        <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--text-2)' }}>Pênaltis:</strong> o "classificado" é o time que efetivamente avança — seja no tempo normal ou nos pênaltis. Seu palpite de placar vale para o tempo regulamentar (90min + prorrogação).
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>
          PALPITE MESTRE
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '14px', lineHeight: 1.6 }}>
          Antes da Copa começar, palpite os <strong style={{ color: 'var(--text-2)' }}>dois finalistas</strong>. Vale bônus especial!
        </div>
        {[
          { icon: '🏆', label: 'Dois finalistas certos', pts: '+10', color: 'var(--gold)' },
          { icon: '🥈', label: 'Um finalista certo',     pts: '+5',  color: 'var(--text-2)' },
          { icon: '❌', label: 'Errou os dois',          pts: '0',   color: 'var(--red)' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <div style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: item.color }}>{item.pts}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>
          DESEMPATE DA LIGA
        </div>
        {[
          { icon: '⭐', label: 'Pontos totais',       desc: 'Maior pontuação total na liga' },
          { icon: '🎯', label: 'Placares exatos',     desc: 'Quem acertou mais placares certinhos' },
          { icon: '✅', label: 'Resultados certos',   desc: 'Quem acertou mais vencedores/empates' },
          { icon: '🕐', label: 'Entrada no bolão',    desc: 'Quem se cadastrou primeiro leva a melhor' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text-3)', flexShrink: 0 }}>{i + 1}º</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Regras do Torneio ─────────────────────────────────────────────────────────
function RegrasTorneio() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#c084fc', marginBottom: '10px', letterSpacing: '0.06em' }}>
          COPA YUUTO KIDOU
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.8 }}>
          Um torneio paralelo à liga! Os <strong style={{ color: 'var(--text)' }}>16 melhores</strong> do ranking Nekomão entram no chaveamento. A cada fase, quem fizer mais pontos nos jogos reais da Copa avança — e acumula bônus!
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#c084fc', marginBottom: '14px', letterSpacing: '0.06em' }}>
          CHAVEAMENTO
        </div>
        {[
          { label: 'Oitavas de Final',  desc: '1º vs 16º, 2º vs 15º... pelo ranking da liga', date: '28/06 – 03/07' },
          { label: 'Quartas de Final',  desc: 'Vencedor do confronto 1 vs 2, 3 vs 4...',       date: '04/07 – 07/07' },
          { label: 'Semifinal',          desc: 'Vencedor do confronto 1 vs 2 da chave',         date: '09/07 – 11/07' },
          { label: 'Final',              desc: 'Os dois semifinalistas se enfrentam',            date: '14/07 – 15/07' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: '#c084fc', flexShrink: 0, marginTop: 2, minWidth: 18 }}>{i + 1}.</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                <div style={{ fontSize: '10px', color: '#c084fc', background: 'rgba(168,85,247,0.12)', padding: '2px 7px', borderRadius: 20, flexShrink: 0, fontWeight: 600 }}>{item.date}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#c084fc', marginBottom: '14px', letterSpacing: '0.06em' }}>
          BÔNUS POR FASE
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '14px', lineHeight: 1.6 }}>
          Quem avança de fase recebe pontos bônus no <strong style={{ color: 'var(--text-2)' }}>Ranking Supercopa</strong>. Os bônus acumulam!
        </div>
        {[
          { fase: 'Oitavas', bonus: '+3', acumulado: '3', color: '#a78bfa' },
          { fase: 'Quartas', bonus: '+4', acumulado: '7', color: '#c084fc' },
          { fase: 'Semi',    bonus: '+5', acumulado: '12', color: '#d946ef' },
          { fase: 'Final',   bonus: '+6', acumulado: '18', color: '#f0abfc' },
        ].map((item, i, arr) => (
          <div key={item.fase} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(168,85,247,0.15)', border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: item.color, fontWeight: 700 }}>{item.bonus}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Passa das {item.fase}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: 2 }}>Acumulado: {item.acumulado}pt de torneio</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: item.color }}>{item.bonus}</div>
          </div>
        ))}
        <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.7 }}>
          🔥 Quem chegar na <strong style={{ color: '#c084fc' }}>Final</strong> acumula <strong style={{ color: '#c084fc' }}>18pt</strong> de bônus no total!
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: '#c084fc', marginBottom: '14px', letterSpacing: '0.06em' }}>
          DESEMPATE NO TORNEIO
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '12px', lineHeight: 1.6 }}>
          Se dois jogadores ficarem empatados em pontos na janela da fase:
        </div>
        {[
          { icon: '🎯', label: 'Placares exatos',  desc: 'Quem acertou mais na liga toda' },
          { icon: '✅', label: 'Parciais',          desc: 'Quem acertou mais resultados na liga' },
          { icon: '🕐', label: 'Cadastro',          desc: 'Quem entrou primeiro no bolão ganha' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text-3)', flexShrink: 0 }}>{i + 1}º</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Como funciona o Ranking ───────────────────────────────────────────────────
function RegrasRanking() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>
          OS TRÊS RANKINGS
        </div>
        {[
          { label: 'Ranking Supercopa', color: 'var(--gold)', desc: 'A classificação geral. Soma todos os pontos da liga + bônus do torneio. É o ranking principal da Copa Nekoma.' },
          { label: 'Classificação Nekomão', color: 'var(--gold)', desc: 'Só conta os pontos da liga (palpites dos jogos). Sem bônus do torneio. Define quem entra no chaveamento.' },
          { label: 'Pontos Yuuto Kidou', color: '#c084fc', desc: 'Ranking exclusivo do torneio. Mostra os bônus acumulados por fase. Aparece em roxo no app.' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: item.color, marginBottom: '6px' }}>{item.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.7 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>
          COMO OS PONTOS SOMAM
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '14px', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Exemplo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>Pontos na liga (Nekomão)</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)' }}>87pt</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>Chegou na Semi (+3+4+5)</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: '#c084fc' }}>+12pt</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Total Supercopa</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)' }}>99pt</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.8 }}>
          O <strong style={{ color: 'var(--text-2)' }}>Ranking Supercopa</strong> é a soma dos pontos da liga (Nekomão) com os bônus acumulados no torneio (Yuuto Kidou). Os pontos de torneio aparecem em <strong style={{ color: '#c084fc' }}>roxo</strong> sempre que exibidos no app.
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>
          DESEMPATE GERAL (SUPERCOPA)
        </div>
        {[
          { icon: '⭐', label: 'Pontos totais (liga + torneio)', desc: 'Quem tem mais pontos na Supercopa' },
          { icon: '🎯', label: 'Placares exatos',                desc: 'Quem acertou mais placares certinhos' },
          { icon: '✅', label: 'Resultados certos',              desc: 'Quem acertou mais vencedores/empates' },
          { icon: '🕐', label: 'Cadastro mais antigo',           desc: 'Quem entrou primeiro no bolão' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text-3)', flexShrink: 0 }}>{i + 1}º</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RegrasSection com 3 botões ────────────────────────────────────────────────
function RegrasSection() {
  const [sub, setSub] = useState('liga')
  const subTabs = [
    { key: 'liga',    label: 'Nekomão' },
    { key: 'torneio', label: 'Yuuto Kidou' },
    { key: 'ranking', label: 'Supercopa' },
  ]
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
        {subTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSub(key)}
            style={{
              flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s',
              background: 'transparent',
              color: sub === key ? (key === 'torneio' ? '#c084fc' : 'var(--text)') : 'var(--text-3)',
              borderBottom: `2px solid ${sub === key ? (key === 'torneio' ? '#c084fc' : 'var(--gold)') : 'transparent'}`,
              letterSpacing: '0.02em',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {sub === 'liga'    && <RegrasLiga />}
      {sub === 'torneio' && <RegrasTorneio />}
      {sub === 'ranking' && <RegrasRanking />}
    </div>
  )
}

// ── Cards de Posição nos 3 Rankings ──────────────────────────────────────────
function PositionCards({ userId }) {
  const [positions, setPositions] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: all } = await supabase
        .from('profiles')
        .select('id, points, exact_hits, tournament_points, created_at')
        .order('points', { ascending: false })

      if (!all) return

      // Supercopa: points (liga) + tournament_points
      const withSuper = all
        .map(p => ({ ...p, supercopa: (p.points ?? 0) + (p.tournament_points ?? 0) }))
        .sort((a, b) => b.supercopa - a.supercopa || b.exact_hits - a.exact_hits)

      // Liga (Nekomão): só points
      const ligaSorted = [...all].sort((a, b) => b.points - a.points || b.exact_hits - a.exact_hits)

      // Torneio (Yuuto Kidou): só tournament_points
      const torneioSorted = [...all].sort((a, b) => (b.tournament_points ?? 0) - (a.tournament_points ?? 0) || b.exact_hits - a.exact_hits)

      const posSuper   = withSuper.findIndex(p => p.id === userId) + 1
      const posLiga    = ligaSorted.findIndex(p => p.id === userId) + 1
      const posTorneio = torneioSorted.findIndex(p => p.id === userId) + 1

      const me = all.find(p => p.id === userId)

      setPositions({
        supercopa:  { pos: posSuper,   pts: (me?.points ?? 0) + (me?.tournament_points ?? 0), total: all.length },
        liga:       { pos: posLiga,    pts: me?.points ?? 0,              total: all.length },
        torneio:    { pos: posTorneio, pts: me?.tournament_points ?? 0,   total: all.length },
      })
    }
    if (userId) load()
  }, [userId])

  if (!positions) return null

  const cards = [
    { label: 'Supercopa', icon: null, color: 'var(--gold)',  bg: 'rgba(232,184,75,0.08)',  border: 'rgba(232,184,75,0.2)',  ...positions.supercopa },
    { label: 'Nekomão',   icon: null, color: 'var(--green)', bg: 'rgba(55,200,100,0.08)',  border: 'rgba(55,200,100,0.2)', ...positions.liga },
    { label: 'Yuuto Kidou', icon: null, color: '#c084fc',    bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', ...positions.torneio },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
      {cards.map(({ label, icon, color, bg, border, pos, pts, total }) => (
        <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 'var(--r-md)', padding: '12px 8px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color, lineHeight: 1 }}>{pos}º</div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          <div style={{ fontSize: '11px', color, marginTop: '4px', fontWeight: 700 }}>{pts}pt</div>
        </div>
      ))}
    </div>
  )
}

// ── Perfil de outro jogador (modo visualização) ───────────────────────────────
function PlayerProfileView({ player, onBack }) {
  const [positions, setPositions] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: all } = await supabase
        .from('profiles')
        .select('id, points, exact_hits, tournament_points, created_at')

      if (!all) return

      const withSuper = all
        .map(p => ({ ...p, supercopa: (p.points ?? 0) + (p.tournament_points ?? 0) }))
        .sort((a, b) => b.supercopa - a.supercopa || b.exact_hits - a.exact_hits)

      const ligaSorted    = [...all].sort((a, b) => b.points - a.points || b.exact_hits - a.exact_hits)
      const torneioSorted = [...all].sort((a, b) => (b.tournament_points ?? 0) - (a.tournament_points ?? 0) || b.exact_hits - a.exact_hits)

      setPositions({
        supercopa: withSuper.findIndex(p => p.id === player.id) + 1,
        liga:      ligaSorted.findIndex(p => p.id === player.id) + 1,
        torneio:   torneioSorted.findIndex(p => p.id === player.id) + 1,
        total:     all.length,
      })
    }
    load()
  }, [player.id])

  const initials = (player.display_name || player.nick || '?').slice(0, 2).toUpperCase()

  return (
    <div>
      {/* Botão voltar */}
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '13px', fontWeight: 600, padding: '0 0 16px 0' }}
      >
        ← Voltar para jogadores
      </button>

      {/* Quiz */}
      <QuizProfileCard userId={player.id} />

      {/* Card principal */}
      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '12px' }}>
        {/* Avatar + nome */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          {player.avatar_url
            ? <img src={player.avatar_url} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-strong)' }} />
            : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold-dim)', border: '3px solid rgba(232,184,75,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--gold)' }}>{initials}</div>
          }
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{player.display_name || player.nick}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 2 }}>@{player.nick}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {[
            ['Pontos Liga', player.points ?? 0, 'var(--gold)'],
            ['Placares Exatos', player.exact_hits ?? 0, 'var(--green)'],
          ].map(([label, value, color]) => (
            <div key={label} style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color, letterSpacing: '0.04em', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '5px', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Posições */}
        {positions && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Supercopa', icon: null, color: 'var(--gold)',  bg: 'rgba(232,184,75,0.08)',  border: 'rgba(232,184,75,0.2)',  pos: positions.supercopa, pts: (player.points ?? 0) + (player.tournament_points ?? 0) },
              { label: 'Nekomão',   icon: null, color: 'var(--green)', bg: 'rgba(55,200,100,0.08)', border: 'rgba(55,200,100,0.2)', pos: positions.liga,      pts: player.points ?? 0 },
              { label: 'Yuuto Kidou', icon: null, color: '#c084fc',   bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', pos: positions.torneio,   pts: player.tournament_points ?? 0 },
            ].map(({ label, icon, color, bg, border, pos, pts }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 'var(--r-md)', padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color, lineHeight: 1 }}>{pos}º</div>
                <div style={{ fontSize: '9px', color: 'var(--text-3)', marginTop: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '10px', color, marginTop: '3px', fontWeight: 700 }}>{pts}pt</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Lista de Jogadores ────────────────────────────────────────────────────────
function JogadoresSection({ currentUserId }) {
  const [players, setPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, nick, display_name, avatar_url, points, exact_hits, tournament_points')
        .order('display_name', { ascending: true })
      setPlayers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (selected) {
    return <PlayerProfileView player={selected} onBack={() => setSelected(null)} />
  }

  const filtered = players
    .filter(p => {
      const q = search.toLowerCase()
      return (p.display_name || '').toLowerCase().includes(q) || (p.nick || '').toLowerCase().includes(q)
    })
    .sort((a, b) => (a.display_name || a.nick || '').localeCompare(b.display_name || b.nick || '', 'pt-BR', { sensitivity: 'base' }))

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: '12px', width: '100%' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--text-3)' }}>🔍</span>
        <input
          className="input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar jogador..."
          style={{ paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '13px', padding: '32px 0' }}>Carregando...</div>
      )}

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((player) => {
          const initials = (player.display_name || player.nick || '?').slice(0, 2).toUpperCase()
          const isMe = player.id === currentUserId

          return (
            <button
              key={player.id}
              onClick={() => setSelected(player)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: isMe ? 'rgba(232,184,75,0.06)' : 'var(--glass)',
                border: isMe ? '1px solid rgba(232,184,75,0.25)' : '1px solid var(--border)',
                borderRadius: 'var(--r-md)', padding: '12px 14px',
                cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
              }}
            >
              {/* Avatar */}
              {player.avatar_url
                ? <img src={player.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-strong)', flexShrink: 0 }} />
                : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold-dim)', border: '2px solid rgba(232,184,75,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--gold)', flexShrink: 0 }}>{initials}</div>
              }

              {/* Nome */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: isMe ? 'var(--gold)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {player.display_name || player.nick}
                  {isMe && <span style={{ fontSize: '10px', color: 'var(--gold)', marginLeft: '6px', background: 'rgba(232,184,75,0.15)', padding: '1px 5px', borderRadius: 8 }}>você</span>}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: 1 }}>@{player.nick}</div>
              </div>

              <span style={{ color: 'var(--text-3)', fontSize: '14px', flexShrink: 0 }}>›</span>
            </button>
          )
        })}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '13px', padding: '32px 0' }}>
            Nenhum jogador encontrado
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, profile, signOut, fetchProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [view, setView] = useState('perfil')
  const fileRef = useRef()

  async function saveProfile() {
    if (!displayName.trim()) return
    setSaving(true)
    await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', user.id)
    await fetchProfile(user.id)
    setMsg('✓ Perfil atualizado!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
      await fetchProfile(user.id)
      setMsg('✓ Foto atualizada!')
      setTimeout(() => setMsg(''), 3000)
    }
    setUploading(false)
  }

  const initials = (profile?.display_name || profile?.nick || '?').slice(0, 2).toUpperCase()

  const pageTitles = { perfil: 'Perfil', jogadores: 'Jogadores', regras: 'Regras' }

  return (
    <div className="page">
      <div className="section-title">{pageTitles[view]}</div>

      {/* Abas principais */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '4px', marginBottom: '20px', gap: '4px' }}>
        {[['perfil', 'Perfil'], ['jogadores', 'Jogadores'], ['regras', 'Regras']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              flex: 1, padding: '9px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s',
              background: view === key ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: view === key ? 'var(--text)' : 'var(--text-3)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Aba Perfil */}
      {view === 'perfil' && (
        <>
          <QuizProfileCard userId={user.id} />

          {/* Cards de posição nos 3 rankings */}
          <PositionCards userId={user.id} />

          <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '12px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-strong)' }} />
                  : <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--gold-dim)', border: '3px solid rgba(232,184,75,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--gold)', letterSpacing: '0.06em' }}>{initials}</div>
                }
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', border: '2px solid var(--void)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                >
                  {uploading ? '⟳' : '📷'}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{profile?.display_name || profile?.nick}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 2 }}>@{profile?.nick}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {[
                ['Pontos Liga', profile?.points ?? 0, 'var(--gold)'],
                ['Placares Exatos', profile?.exact_hits ?? 0, 'var(--green)'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color, letterSpacing: '0.04em', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '5px', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="input-group" style={{ marginBottom: '16px', marginTop: '16px' }}>
              <label className="input-label">Nome de exibição</label>
              <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Como você quer ser chamado" />
            </div>

            {msg && (
              <div style={{ color: 'var(--green)', fontSize: '13px', textAlign: 'center', marginBottom: '12px', padding: '8px', background: 'var(--green-dim)', borderRadius: 'var(--r-sm)' }}>
                {msg}
              </div>
            )}

            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          <button
            className="btn"
            onClick={signOut}
            style={{ color: 'var(--red)', borderColor: 'rgba(240,62,62,0.25)', background: 'var(--red-dim)', marginBottom: '32px' }}
          >
            Sair da conta
          </button>

          {/* Créditos */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <img src="/neko.png" alt="Neko" style={{ height: '36px', filter: 'drop-shadow(0 0 8px rgba(232,184,75,0.4))', opacity: 0.85 }} onError={e => { e.target.style.display = 'none' }} />
              <img src="/hugos.png" alt="Hugos" style={{ height: '36px', filter: 'drop-shadow(0 0 8px rgba(232,184,75,0.4))', opacity: 0.85 }} onError={e => { e.target.style.display = 'none' }} />
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-3)', textAlign: 'center', letterSpacing: '0.04em', lineHeight: 1.6, margin: 0 }}>
              Produzido por <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>Scarpin Xavier</span> feat. <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>Nekoma</span><br />
              Todos os direitos reservados
            </p>
          </div>
        </>
      )}

      {/* Aba Jogadores */}
      {view === 'jogadores' && <JogadoresSection currentUserId={user.id} />}

      {/* Aba Regras */}
      {view === 'regras' && <RegrasSection />}
    </div>
  )
}
