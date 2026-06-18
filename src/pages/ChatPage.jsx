import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MAX_CHARS = 200
const COOLDOWN_MS = 5000

function Avatar({ profile, size = 32 }) {
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border-strong)' }} />
  }
  const initials = (profile?.display_name || profile?.nick || '?').slice(0, 2).toUpperCase()
  const colors = ['#e8b84b', '#1db954', '#4d8ef0', '#f03e3e', '#a855f7']
  const color = colors[initials.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}1a`, border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
      {initials}
    </div>
  )
}

function MessageBubble({ msg, profile, isMe }) {
  const time = format(parseISO(msg.created_at), 'HH:mm')
  return (
    <div style={{ display: 'flex', gap: 8, flexDirection: isMe ? 'row-reverse' : 'row', marginBottom: 10 }}>
      <Avatar profile={profile} size={30} />
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexDirection: isMe ? 'row-reverse' : 'row' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: isMe ? 'var(--gold-bright)' : 'var(--text-2)' }}>
            {profile?.display_name || profile?.nick || 'Alguém'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{time}</span>
        </div>
        <div style={{
          padding: '9px 13px', borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isMe ? 'var(--gold-dim)' : 'var(--surface)',
          border: `1px solid ${isMe ? 'rgba(245,197,24,0.25)' : 'var(--border)'}`,
          color: 'var(--text)', fontSize: 14, lineHeight: 1.4, wordBreak: 'break-word',
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user, profile: myProfile } = useAuth()
  const [messages, setMessages] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const bottomRef = useRef(null)
  const cooldownRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  useEffect(() => {
    async function fetchAll() {
      const [{ data: msgs }, { data: profs }] = await Promise.all([
        supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
        supabase.from('profiles').select('id, nick, display_name, avatar_url'),
      ])
      setMessages(msgs || [])
      const map = {}
      ;(profs || []).forEach(p => { map[p.id] = p })
      setProfiles(map)
      setLoading(false)
      scrollToBottom()
    }
    fetchAll()

    // Realtime — escuta novas mensagens
    const channel = supabase
      .channel('chat_messages_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
        setMessages(prev => [...prev, payload.new])
        scrollToBottom()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, () => {
        // Quando o cron limpar à noite, recarrega tudo
        setMessages([])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [scrollToBottom])

  // Cooldown visual
  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 100) { clearInterval(cooldownRef.current); return 0 }
        return c - 100
      })
    }, 100)
    return () => clearInterval(cooldownRef.current)
  }, [cooldown])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending || cooldown > 0) return
    setSending(true)
    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      content: trimmed.slice(0, MAX_CHARS),
    })
    setSending(false)
    if (!error) {
      setText('')
      setCooldown(COOLDOWN_MS)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 88px)', paddingBottom: 0 }}>
      <div className="section-title" style={{ marginBottom: 10 }}>Chat da Galera</div>

      {/* Aviso das regras */}
      <div style={{
        background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)',
        borderRadius: 'var(--r-md)', padding: '10px 12px', marginBottom: 14,
        fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5,
      }}>
        🧹 <strong style={{ color: 'var(--gold-bright)' }}>Esse chat zera todo dia às 3h30.</strong> Zoa, provoca, comemora — só sem palavrão pesado e sem brigas de verdade. É bolão entre amigos!
      </div>

      {/* Lista de mensagens */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 50, marginBottom: 10, borderRadius: 12 }} />
          ))
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '60px 0', fontSize: 13 }}>
            Nenhuma mensagem ainda. Seja o primeiro a zoar! 😄
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} profile={profiles[msg.user_id]} isMe={msg.user_id === user.id} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input fixo */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'flex-end',
        padding: '10px 0', borderTop: '1px solid var(--border)', marginTop: 8,
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder="Escreve algo pra galera..."
            rows={1}
            style={{
              width: '100%', resize: 'none', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
              padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-body)',
              fontSize: 14, outline: 'none', maxHeight: 80,
            }}
          />
          <span style={{ position: 'absolute', bottom: -16, right: 4, fontSize: 9, color: 'var(--text-3)' }}>
            {text.length}/{MAX_CHARS}
          </span>
        </div>
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || cooldown > 0}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 16px', flexShrink: 0, opacity: cooldown > 0 ? 0.5 : 1 }}
        >
          {cooldown > 0 ? `${Math.ceil(cooldown / 1000)}s` : sending ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
