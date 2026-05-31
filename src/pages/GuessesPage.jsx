import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, differenceInSeconds, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const LOCK_SECS = 60

const TEAM_FLAGS = {
  'Brasil':'https://flagcdn.com/w160/br.png','Brazil':'https://flagcdn.com/w160/br.png',
  'Argentina':'https://flagcdn.com/w160/ar.png','França':'https://flagcdn.com/w160/fr.png',
  'France':'https://flagcdn.com/w160/fr.png','Alemanha':'https://flagcdn.com/w160/de.png',
  'Germany':'https://flagcdn.com/w160/de.png','Espanha':'https://flagcdn.com/w160/es.png',
  'Spain':'https://flagcdn.com/w160/es.png','Portugal':'https://flagcdn.com/w160/pt.png',
  'Inglaterra':'https://flagcdn.com/w160/gb-eng.png','England':'https://flagcdn.com/w160/gb-eng.png',
  'Holanda':'https://flagcdn.com/w160/nl.png','Netherlands':'https://flagcdn.com/w160/nl.png',
  'Suíça':'https://flagcdn.com/w160/ch.png','Switzerland':'https://flagcdn.com/w160/ch.png',
  'Croácia':'https://flagcdn.com/w160/hr.png','Croatia':'https://flagcdn.com/w160/hr.png',
  'Uruguai':'https://flagcdn.com/w160/uy.png','Uruguay':'https://flagcdn.com/w160/uy.png',
  'México':'https://flagcdn.com/w160/mx.png','Mexico':'https://flagcdn.com/w160/mx.png',
  'EUA':'https://flagcdn.com/w160/us.png','USA':'https://flagcdn.com/w160/us.png',
  'Canadá':'https://flagcdn.com/w160/ca.png','Canada':'https://flagcdn.com/w160/ca.png',
  'Japão':'https://flagcdn.com/w160/jp.png','Japan':'https://flagcdn.com/w160/jp.png',
  'Marrocos':'https://flagcdn.com/w160/ma.png','Morocco':'https://flagcdn.com/w160/ma.png',
  'Senegal':'https://flagcdn.com/w160/sn.png','Coreia do Sul':'https://flagcdn.com/w160/kr.png',
  'South Korea':'https://flagcdn.com/w160/kr.png','Austrália':'https://flagcdn.com/w160/au.png',
  'Australia':'https://flagcdn.com/w160/au.png','Sérvia':'https://flagcdn.com/w160/rs.png',
  'Serbia':'https://flagcdn.com/w160/rs.png','Bélgica':'https://flagcdn.com/w160/be.png',
  'Belgium':'https://flagcdn.com/w160/be.png','Dinamarca':'https://flagcdn.com/w160/dk.png',
  'Denmark':'https://flagcdn.com/w160/dk.png','Polônia':'https://flagcdn.com/w160/pl.png',
  'Poland':'https://flagcdn.com/w160/pl.png','Colômbia':'https://flagcdn.com/w160/co.png',
  'Colombia':'https://flagcdn.com/w160/co.png','Equador':'https://flagcdn.com/w160/ec.png',
  'Ecuador':'https://flagcdn.com/w160/ec.png','Gana':'https://flagcdn.com/w160/gh.png',
  'Ghana':'https://flagcdn.com/w160/gh.png','Nigéria':'https://flagcdn.com/w160/ng.png',
  'Nigeria':'https://flagcdn.com/w160/ng.png','Camarões':'https://flagcdn.com/w160/cm.png',
  'Cameroon':'https://flagcdn.com/w160/cm.png','Itália':'https://flagcdn.com/w160/it.png',
  'Italy':'https://flagcdn.com/w160/it.png','Chile':'https://flagcdn.com/w160/cl.png',
  'Peru':'https://flagcdn.com/w160/pe.png','Qatar':'https://flagcdn.com/w160/qa.png',
  'Arábia Saudita':'https://flagcdn.com/w160/sa.png','Saudi Arabia':'https://flagcdn.com/w160/sa.png',
  'Irã':'https://flagcdn.com/w160/ir.png','Iran':'https://flagcdn.com/w160/ir.png',
  'Tunísia':'https://flagcdn.com/w160/tn.png','Tunisia':'https://flagcdn.com/w160/tn.png',
  'Costa Rica':'https://flagcdn.com/w160/cr.png','País de Gales':'https://flagcdn.com/w160/gb-wls.png',
  'Wales':'https://flagcdn.com/w160/gb-wls.png',
}

function isLocked(dateStr) {
  return differenceInSeconds(parseISO(dateStr), new Date()) <= LOCK_SECS
}

function countdown(dateStr) {
  const diff = differenceInSeconds(parseISO(dateStr), new Date())
  if (diff <= 0) return null
  if (diff > 3600) return format(parseISO(dateStr), "dd/MM 'às' HH:mm", { locale: ptBR })
  const m = Math.floor(diff / 60), s = diff % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

function TeamFlag({ name, emoji, size = 48 }) {
  const url = TEAM_FLAGS[name]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45 }}>{emoji || '🏳️'}</div>}
    </div>
  )
}

function FlagBg({ name, emoji, side }) {
  const url = TEAM_FLAGS[name]
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
      {url ? <img src={url} alt="" style={{ position: 'absolute', top: '50%', [side]: '-5%', transform: 'translateY(-50%)', width: '130%', height: '130%', objectFit: 'cover', opacity: 0.09, filter: 'saturate(1.8) blur(1px)' }} />
           : emoji && <div style={{ position: 'absolute', top: '50%', [side]: '-10px', transform: 'translateY(-50%)', fontSize: '100px', opacity: 0.06 }}>{emoji}</div>}
    </div>
  )
}

// Popover inline pequeno — não fullscreen
function GuessesPopover({ matchId, open, onClose }) {
  const [guesses, setGuesses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase.from('guesses').select('*, profiles(display_name)').eq('match_id', matchId)
      .then(({ data }) => { setGuesses(data || []); setLoading(false) })
  }, [open, matchId])

  if (!open) return null

  return (
    <div style={{ marginTop: '10px', background: 'rgba(13,17,23,0.95)', border: '1px solid var(--border-glass-strong)', borderRadius: 'var(--radius-md)', padding: '12px', animation: 'fadeUp 0.15s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Palpites da galera</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px' }}>×</button>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 32, borderRadius: 6 }} />
      ) : guesses.length === 0 ? (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>Nenhum palpite ainda.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {guesses.map(g => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{g.profiles?.display_name}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--accent-gold-bright)', letterSpacing: '0.06em' }}>{g.home_score} × {g.away_score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GuessCard({ match, myGuess, onSave }) {
  const [home, setHome] = useState(myGuess?.home_score ?? '')
  const [away, setAway] = useState(myGuess?.away_score ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const locked = isLocked(match.match_date)
  const finished = match.status === 'finished'
  const correct = finished && myGuess && myGuess.home_score === match.home_score && myGuess.away_score === match.away_score
  const wrong = finished && myGuess && !correct
  const cd = countdown(match.match_date)

  async function save() {
    if (locked || saving || home === '' || away === '') return
    setSaving(true)
    await onSave(match.id, parseInt(home), parseInt(away), myGuess)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: finished ? (correct ? 'rgba(34,197,94,0.06)' : wrong ? 'rgba(239,68,68,0.06)' : 'var(--bg-glass)') : 'var(--bg-glass)',
      border: `1px solid ${finished ? (correct ? 'rgba(34,197,94,0.4)' : wrong ? 'rgba(239,68,68,0.35)' : 'var(--border-glass)') : 'var(--border-glass)'}`,
      borderRadius: 'var(--radius-lg)', marginBottom: '12px',
    }}>
      <FlagBg name={match.home_team} emoji={match.home_flag} side="left" />
      <FlagBg name={match.away_team} emoji={match.away_flag} side="right" />

      <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span className="badge badge-muted">{match.stage}{match.group_name ? ` · G${match.group_name}` : ''}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {finished
              ? <span className={`badge ${correct ? 'badge-green' : 'badge-red'}`}>{correct ? `✓ +${myGuess?.points_earned || 0}pts` : '✗ Erro'}</span>
              : locked ? <span className="badge badge-muted">🔒 Travado</span>
              : cd ? <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cd}</span>
              : null
            }
            {/* 3 risquinhos */}
            <button
              onClick={() => setPopoverOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: popoverOpen ? 'var(--accent-gold)' : 'var(--text-muted)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}
              title="Ver palpites"
            >
              {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: '15px', height: '2px', background: 'currentColor', borderRadius: '1px' }} />)}
            </button>
          </div>
        </div>

        {/* Times + palpite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamFlag name={match.home_team} emoji={match.home_flag} />
            <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{match.home_team}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            {finished && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.04em', lineHeight: 1, color: 'var(--text-primary)', textAlign: 'center' }}>
                {match.home_score}<span style={{ color: 'var(--text-muted)', fontSize: '18px', margin: '0 2px' }}>×</span>{match.away_score}
              </div>
            )}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <input className="score-input" type="number" min="0" max="20" value={home} onChange={e => setHome(e.target.value)} disabled={locked} style={{ width: '44px', fontSize: '22px' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>×</span>
              <input className="score-input" type="number" min="0" max="20" value={away} onChange={e => setAway(e.target.value)} disabled={locked} style={{ width: '44px', fontSize: '22px' }} />
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>palpite</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamFlag name={match.away_team} emoji={match.away_flag} />
            <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{match.away_team}</span>
          </div>
        </div>

        {!locked && !finished && (
          <button className={`btn ${saved ? 'btn-primary' : ''}`} style={{ marginTop: '12px', padding: '9px', fontSize: '13px' }} onClick={save} disabled={saving || home === '' || away === ''}>
            {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar Palpite'}
          </button>
        )}

        {/* Popover inline */}
        <GuessesPopover matchId={match.id} open={popoverOpen} onClose={() => setPopoverOpen(false)} />

        {/* Resenha pós-jogo */}
        {finished && (
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '6px' }}>Resenha</div>
            <GuessesPopover matchId={match.id} open={true} onClose={() => {}} />
          </div>
        )}
      </div>
    </div>
  )
}

function MasterGuess({ userId }) {
  const [t1, setT1] = useState('')
  const [t2, setT2] = useState('')
  const [saved, setSaved] = useState(false)
  const [existing, setExisting] = useState(null)
  const COPA_START = new Date('2026-06-11T00:00:00')
  const locked = new Date() >= COPA_START

  useEffect(() => {
    supabase.from('master_guess').select('*').eq('user_id', userId).single()
      .then(({ data }) => { if (data) { setExisting(data); setT1(data.team1); setT2(data.team2) } })
  }, [userId])

  async function saveMaster() {
    if (!t1 || !t2 || t1 === t2) return
    const payload = { user_id: userId, team1: t1, team2: t2 }
    if (existing) await supabase.from('master_guess').update({ team1: t1, team2: t2 }).eq('user_id', userId)
    else await supabase.from('master_guess').insert(payload)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
    setExisting(payload)
  }

  return (
    <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', border: '1px solid rgba(212,168,50,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '18px' }}>🏆</span>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.06em', color: 'var(--accent-gold)' }}>PALPITE MESTRE</div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
        Quem vai à final? Um time = <strong style={{ color: 'var(--accent-gold)' }}>+4pts</strong> · Dois times = <strong style={{ color: 'var(--accent-gold)' }}>+8pts</strong> · Bloqueado em 11/Jun
      </div>
      {locked ? (
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          🔒 {existing ? `${existing.team1} × ${existing.team2}` : 'Sem palpite registrado'}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input className="input" value={t1} onChange={e => setT1(e.target.value)} placeholder="Time 1" style={{ flex: 1, padding: '10px 12px', fontSize: '14px' }} />
            <input className="input" value={t2} onChange={e => setT2(e.target.value)} placeholder="Time 2" style={{ flex: 1, padding: '10px 12px', fontSize: '14px' }} />
          </div>
          <button className={`btn ${saved ? 'btn-primary' : ''}`} onClick={saveMaster} disabled={!t1 || !t2 || t1 === t2} style={{ padding: '10px', fontSize: '13px' }}>
            {saved ? '✓ Salvo!' : 'Salvar Palpite Mestre'}
          </button>
        </>
      )}
    </div>
  )
}

function RegrasTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--accent-gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>PONTUAÇÃO</div>
        {[
          { icon: '🎯', label: 'Placar Exato', desc: 'Acertou o placar certinho (ex: 2×1 = 2×1)', pts: '+3', color: 'var(--green)' },
          { icon: '✅', label: 'Vencedor Certo', desc: 'Acertou quem ganhou mas errou o placar', pts: '+1', color: 'var(--accent-gold)' },
          { icon: '🤝', label: 'Empate Certo', desc: 'Previu empate e deu empate', pts: '+1', color: 'var(--accent-gold)' },
          { icon: '❌', label: 'Errou', desc: 'Não acertou nem o resultado', pts: '0', color: 'var(--red)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: item.color, flexShrink: 0 }}>{item.pts}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--accent-gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>PALPITE MESTRE</div>
        {[
          { icon: '🏆', label: 'Dois finalistas certos', pts: '+8' },
          { icon: '🥈', label: 'Um finalista certo', pts: '+4' },
          { icon: '❌', label: 'Errou os dois', pts: '0' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <div style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)' }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--accent-gold)' }}>{item.pts}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          🔒 <strong style={{ color: 'var(--text-secondary)' }}>Trava de 1 minuto:</strong> palpites bloqueados automaticamente 1 minuto antes do apito inicial. Sem exceções!
        </div>
      </div>
    </div>
  )
}

export default function GuessesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [myGuesses, setMyGuesses] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('palpites')

  const fetchData = useCallback(async () => {
    const [{ data: mData }, { data: myData }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date'),
      supabase.from('guesses').select('*').eq('user_id', user.id),
    ])
    setMatches(mData || [])
    const myMap = {}; (myData || []).forEach(g => { myMap[g.match_id] = g })
    setMyGuesses(myMap)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleSave(matchId, homeScore, awayScore, existing) {
    if (existing) await supabase.from('guesses').update({ home_score: homeScore, away_score: awayScore }).eq('id', existing.id)
    else await supabase.from('guesses').insert({ user_id: user.id, match_id: matchId, home_score: homeScore, away_score: awayScore })
    await fetchData()
  }

  const grouped = {}
  matches.forEach(m => {
    const d = format(parseISO(m.match_date), "EEEE, dd 'de' MMMM", { locale: ptBR })
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(m)
  })

  return (
    <div className="page">
      <div className="section-title">Palpites</div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '16px', gap: '4px' }}>
        {[['palpites', '⚽ Palpites'], ['regras', '📋 Regras']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '9px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'regras' ? <RegrasTab /> : (
        <>
          <MasterGuess userId={user.id} />
          {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 190, marginBottom: 12 }} />) :
            Object.entries(grouped).map(([date, dayMatches]) => (
              <div key={date}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '10px', marginTop: '16px' }}>{date}</div>
                {dayMatches.map(m => (
                  <GuessCard key={m.id} match={m} myGuess={myGuesses[m.id]} onSave={handleSave} />
                ))}
              </div>
            ))
          }
        </>
      )}
    </div>
  )
}
