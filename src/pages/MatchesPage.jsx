import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

function TeamFlag({ name, emoji, size = 44 }) {
  const url = TEAM_FLAGS[name]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.15)', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
           : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5 }}>{emoji || '🏳️'}</div>}
    </div>
  )
}

function FlagBg({ name, emoji, side }) {
  const url = TEAM_FLAGS[name]
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
      {url ? <img src={url} alt="" style={{ position: 'absolute', top: '50%', [side]: '-5%', transform: 'translateY(-50%)', width: '130%', height: '130%', objectFit: 'cover', opacity: 0.08, filter: 'saturate(1.8) blur(1px)' }} />
           : emoji && <div style={{ position: 'absolute', top: '50%', [side]: '-10px', transform: 'translateY(-50%)', fontSize: '100px', opacity: 0.06 }}>{emoji}</div>}
    </div>
  )
}

function MatchCard({ match }) {
  const finished = match.status === 'finished'
  const live = match.status === 'live'

  return (
    <div style={{ position: 'relative', background: live ? 'rgba(239,68,68,0.06)' : 'var(--bg-glass)', border: `1px solid ${live ? 'rgba(239,68,68,0.3)' : 'var(--border-glass)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '14px 16px' }}>
      <FlagBg name={match.home_team} emoji={match.home_flag} side="left" />
      <FlagBg name={match.away_team} emoji={match.away_flag} side="right" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="badge badge-muted">{match.stage}{match.group_name ? ` · G${match.group_name}` : ''}</span>
          {live && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--red)', fontWeight: 700 }}><div className="live-dot" />AO VIVO</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamFlag name={match.home_team} emoji={match.home_flag} />
            <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{match.home_team}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {finished
              ? <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', letterSpacing: '0.04em', lineHeight: 1 }}>{match.home_score} <span style={{ color: 'var(--text-muted)', fontSize: '20px' }}>×</span> {match.away_score}</div>
              : <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.06em' }}>{format(parseISO(match.match_date), 'HH:mm')}</div>
            }
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{format(parseISO(match.match_date), 'dd/MM')}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <TeamFlag name={match.away_team} emoji={match.away_flag} />
            <span style={{ fontSize: '12px', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{match.away_team}</span>
          </div>
        </div>
        {live && match.stream_url && (
          <a href={match.stream_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', padding: '8px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--red)', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
            📺 Assistir na CazéTV
          </a>
        )}
      </div>
    </div>
  )
}

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('matches').select('*').order('match_date').then(({ data }) => {
      setMatches(data || [])
      setLoading(false)
    })
  }, [])

  const grouped = {}
  matches.forEach(m => {
    const d = format(parseISO(m.match_date), "EEEE, dd 'de' MMMM", { locale: ptBR })
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(m)
  })

  return (
    <div className="page">
      <div className="section-title">Jogos</div>
      {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 140, marginBottom: 12 }} />) :
        matches.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>Nenhum jogo cadastrado ainda.</div> :
        Object.entries(grouped).map(([date, dayMatches]) => (
          <div key={date}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'capitalize', letterSpacing: '0.08em', marginBottom: '10px', marginTop: '20px' }}>{date}</div>
            <div className="matches-grid">
              {dayMatches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        ))
      }
    </div>
  )
}
