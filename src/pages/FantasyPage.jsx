import { useState } from 'react'

const LIGA_CODE = 'SHEA34PW'
const LIGA_URL = 'https://play.fifa.com/fantasy/join-league/SHEA34PW'
const FANTASY_URL = 'https://play.fifa.com/fantasy/'

export default function FantasyPage() {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(LIGA_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* Hero */}
      <div style={{
        position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden',
        marginBottom: 20, padding: '28px 20px 24px',
        background: 'linear-gradient(135deg, #0a3d1f 0%, #0d1526 50%, #1a0a2e 100%)',
        border: '1px solid rgba(0,200,83,0.20)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚽</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.08em', color: 'var(--text)', lineHeight: 1 }}>FIFA FANTASY</div>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.08em', marginTop: 3 }}>COPA DO MUNDO 2026</div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 20, maxWidth: 300 }}>
            O Cartola da Copa — mas oficial da FIFA. Monte seu time, escale craques reais e dispute o ranking com a galera.
          </p>

          <a href={FANTASY_URL} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #00c853, #00a844)',
            color: '#fff', fontWeight: 700, fontSize: 13,
            textDecoration: 'none', letterSpacing: '0.04em',
            boxShadow: '0 4px 20px rgba(0,200,83,0.30)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            Acessar FIFA Fantasy
          </a>
        </div>
      </div>

      {/* Liga */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: 14, border: '1px solid rgba(245,197,24,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, letterSpacing: '0.07em', color: 'var(--gold)', lineHeight: 1 }}>NOSSA LIGA</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Entre e dispute com a galera do bolão</div>
          </div>
        </div>

        {/* Código */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '14px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Código da Liga</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '0.16em', color: 'var(--text)', lineHeight: 1 }}>{LIGA_CODE}</div>
          </div>
          <button onClick={copyCode} style={{
            padding: '9px 16px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
            background: copied ? 'var(--green-dim)' : 'var(--surface-hover)',
            color: copied ? 'var(--green)' : 'var(--text-2)',
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
            transition: 'all 0.2s',
          }}>
            {copied ? '✓ Copiado!' : 'Copiar'}
          </button>
        </div>

        <a href={LIGA_URL} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '12px', borderRadius: 'var(--r-md)',
          background: 'var(--gold-dim)', border: '1px solid rgba(245,197,24,0.22)',
          color: 'var(--gold-bright)', fontWeight: 700, fontSize: 13,
          textDecoration: 'none', letterSpacing: '0.04em',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Entrar na Liga
        </a>
      </div>

      {/* Como funciona */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.07em', color: 'var(--text)', marginBottom: 16 }}>COMO FUNCIONA</div>
        {[
          { num: '1', title: 'Crie sua conta', desc: 'Acesse o FIFA Fantasy e crie uma conta gratuita.', color: 'var(--green)' },
          { num: '2', title: 'Monte seu time', desc: 'Escolha 15 jogadores respeitando o orçamento. Os valores mudam a cada rodada.', color: 'var(--gold)' },
          { num: '3', title: 'Entre na nossa liga', desc: `Use o código ${LIGA_CODE} para disputar com a galera do bolão.`, color: 'var(--blue)' },
          { num: '4', title: 'Acompanhe o ranking', desc: 'Pontuações atualizam a cada rodada. Quem montar o melhor time vence!', color: '#a855f7' },
        ].map(({ num, title, desc, color }, i, arr) => (
          <div key={num} style={{ display: 'flex', gap: 14, paddingBottom: i < arr.length - 1 ? 16 : 0, marginBottom: i < arr.length - 1 ? 16 : 0, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color, flexShrink: 0, lineHeight: 1 }}>{num}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.55 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
