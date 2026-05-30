import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
  const { user, profile, signOut, fetchProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('perfil')
  const fileRef = useRef()

  async function saveProfile() {
    if (!displayName.trim()) return
    setSaving(true)
    await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', user.id)
    await fetchProfile(user.id)
    setMsg('Perfil atualizado!')
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
      setMsg('Foto atualizada!')
      setTimeout(() => setMsg(''), 3000)
    }
    setUploading(false)
  }

  return (
    <div className="page">
      <div className="section-title">Perfil</div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '20px' }}>
        {[['perfil', '👤 Meu Perfil'], ['pontuacao', '📋 Pontuação']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && (
        <>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '16px' }}>
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass-strong)' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--accent-gold)' }}>
                    {(profile?.display_name || profile?.nick || '?').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-gold)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                  {uploading ? '⟳' : '📷'}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>{profile?.display_name || profile?.nick}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{profile?.nick}</div>
              </div>
            </div>

            <div className="divider" />

            {/* Stats — só pontos e placares exatos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                ['Pontos', profile?.points || 0, 'var(--accent-gold)'],
                ['Placares Exatos', profile?.exact_hits || 0, 'var(--green)'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color, letterSpacing: '0.04em' }}>{value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Edit name */}
            <div className="input-group">
              <label className="input-label">Nome de exibição</label>
              <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>

            {msg && <div style={{ color: 'var(--green)', fontSize: '13px', textAlign: 'center' }}>{msg}</div>}

            <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>

          <button className="btn" onClick={signOut} style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}>
            Sair da conta
          </button>
        </>
      )}

      {tab === 'pontuacao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-gold)', marginBottom: '16px', letterSpacing: '0.06em' }}>SISTEMA DE PONTUAÇÃO</div>

            {[
              { icon: '🎯', label: 'Placar Exato', desc: 'Acertou o placar certinho (ex: 2×1 e deu 2×1)', pts: 3, color: 'var(--green)' },
              { icon: '✅', label: 'Vencedor Certo', desc: 'Acertou quem ganhou mas errou o placar', pts: 1, color: 'var(--accent-gold)' },
              { icon: '🤝', label: 'Empate Certo', desc: 'Previu empate e deu empate (qualquer placar)', pts: 1, color: 'var(--accent-gold)' },
              { icon: '❌', label: 'Errou', desc: 'Não acertou nem o resultado', pts: 0, color: 'var(--red)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '24px', width: '32px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: item.color, flexShrink: 0, letterSpacing: '0.04em' }}>
                  {item.pts > 0 ? `+${item.pts}` : '0'}
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              🔒 <strong style={{ color: 'var(--text-secondary)' }}>Trava de 1 minuto:</strong> os palpites são bloqueados automaticamente 1 minuto antes do apito inicial. Depois disso, não dá mais pra editar!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
