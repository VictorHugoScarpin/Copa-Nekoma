import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import QuizProfileCard from '../components/QuizProfileCard'

function RegrasSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
      <div className="section-title" style={{ marginBottom: '4px' }}>Regras</div>

      {/* Pontuação */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>PONTUAÇÃO</div>
        {[
          { icon: '🎯', label: 'Placar Exato', desc: 'Acertou o placar certinho (ex: 2×1 = 2×1)', pts: '+3', color: 'var(--green)' },
          { icon: '✅', label: 'Vencedor Certo', desc: 'Acertou quem ganhou mas errou o placar', pts: '+1', color: 'var(--gold)' },
          { icon: '🤝', label: 'Empate Certo', desc: 'Previu empate e deu empate', pts: '+1', color: 'var(--gold)' },
          { icon: '❌', label: 'Errou', desc: 'Não acertou nem o resultado', pts: '0', color: 'var(--red)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: item.color, flexShrink: 0 }}>{item.pts}</div>
          </div>
        ))}
      </div>

      {/* Palpite Mestre */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>PALPITE MESTRE</div>
        {[
          { icon: '🏆', label: 'Dois finalistas certos', pts: '+10' },
          { icon: '🥈', label: 'Um finalista certo', pts: '+5' },
          { icon: '❌', label: 'Errou os dois', pts: '0' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <div style={{ flex: 1, fontSize: '13px' }}>{item.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)' }}>{item.pts}</div>
          </div>
        ))}
      </div>

      {/* Desempate */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)', marginBottom: '14px', letterSpacing: '0.06em' }}>DESEMPATE</div>
        {[
          { icon: '⭐', label: 'Pontos', desc: 'Maior pontuação total' },
          { icon: '🎯', label: 'Placares exatos', desc: 'Quem acertou mais placares certinhos' },
          { icon: '✅', label: 'Parciais', desc: 'Quem acertou mais vencedores/empates' },
          { icon: '🕐', label: 'Entrada no bolão', desc: 'Quem se cadastrou primeiro leva a melhor' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text-3)', flexShrink: 0 }}>{i + 1}º</div>
          </div>
        ))}
      </div>

      {/* Mata-mata — padronizado igual aos outros blocos */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)', marginBottom: '6px', letterSpacing: '0.06em' }}>🏆 MATA-MATA</div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '14px', lineHeight: 1.6 }}>
          A partir de <strong style={{ color: 'var(--text-2)' }}>28 de junho</strong>, os jogos entram na fase eliminatória. Além do palpite de placar, você também escolhe <strong style={{ color: 'var(--text-2)' }}>quem se classifica</strong> — e isso vale pontos extras!
        </div>
        {[
          { icon: '⚡', label: 'Placar exato + classificado certo', pts: '+5', color: 'var(--green)', desc: 'Acertou o placar certinho e ainda o time que passa' },
          { icon: '🎯', label: 'Placar exato (sem acertar classificado)', pts: '+3', color: 'var(--green)', desc: 'Acertou 2×1 = 2×1, mas errou quem classificou' },
          { icon: '✅', label: 'Resultado certo + classificado certo', pts: '+3', color: 'var(--gold)', desc: 'Acertou o vencedor/empate e o time que avança' },
          { icon: '✅', label: 'Resultado certo (sem acertar classificado)', pts: '+1', color: 'var(--gold)', desc: 'Acertou quem ganhou mas errou quem classificou' },
          { icon: '🏆', label: 'Só acertou quem classifica', pts: '+2', color: 'var(--gold)', desc: 'Errou o placar/resultado mas acertou quem avançou' },
          { icon: '❌', label: 'Errou tudo', pts: '0', color: 'var(--red)', desc: 'Não acertou placar, resultado nem classificado' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{item.desc}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: item.color, flexShrink: 0 }}>{item.pts}</div>
          </div>
        ))}
        <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--text-2)' }}>Como funciona:</strong> No mata-mata, em caso de empate no tempo normal o jogo pode ir para pênaltis. O "classificado" é o time que efetivamente avança — seja pelo tempo normal ou pelos pênaltis. Seu palpite de placar vale para o tempo regulamentar (90min + prorrogação).
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, signOut, fetchProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
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

  return (
    <div className="page">
      <div className="section-title">Perfil</div>

      <QuizProfileCard userId={user.id} />

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
            ['Pontos', profile?.points ?? 0, 'var(--gold)'],
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

      <RegrasSection />

      <button
        className="btn"
        onClick={signOut}
        style={{ color: 'var(--red)', borderColor: 'rgba(240,62,62,0.25)', background: 'var(--red-dim)', marginBottom: '32px' }}
      >
        Sair da conta
      </button>
    </div>
  )
}
