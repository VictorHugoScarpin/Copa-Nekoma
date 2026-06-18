import ws from 'ws'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  realtime: { transport: ws, params: { eventsPerSecond: -1 } },
  global: { fetch: fetch },
})

async function exportChat() {
  console.log('📥 Buscando mensagens...')

  const [{ data: msgs }, { data: profiles }] = await Promise.all([
    supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
    supabase.from('profiles').select('id, nick, display_name, avatar_url'),
  ])

  if (!msgs || msgs.length === 0) {
    console.log('⚠️ Nenhuma mensagem pra exportar.')
    writeFileSync('chat-export.html', '<html><body><p>Nenhuma mensagem encontrada.</p></body></html>')
    return
  }

  const profileMap = {}
  ;(profiles || []).forEach(p => { profileMap[p.id] = p })

  const dateStr = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const rows = msgs.map(msg => {
    const p = profileMap[msg.user_id] || {}
    const name = p.display_name || p.nick || 'Desconhecido'
    const time = format(parseISO(msg.created_at), 'HH:mm')
    const avatar = p.avatar_url
      ? `<img src="${p.avatar_url}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">`
      : `<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#e8b84b22;color:#e8b84b;font-weight:700;font-size:13px;margin-right:8px;">${name.slice(0,2).toUpperCase()}</span>`

    let mediaHtml = ''
    if (msg.media_url && msg.media_type === 'image') {
      mediaHtml = `<br><img src="${msg.media_url}" style="max-width:320px;max-height:240px;border-radius:10px;margin-top:6px;display:block;">`
    } else if (msg.media_url && msg.media_type === 'video') {
      mediaHtml = `<br><video src="${msg.media_url}" controls style="max-width:320px;border-radius:10px;margin-top:6px;display:block;"></video>`
    }

    return `
      <div style="display:flex;gap:10px;margin-bottom:14px;align-items:flex-start;">
        <div style="flex-shrink:0;margin-top:2px;">${avatar}</div>
        <div>
          <span style="font-weight:700;font-size:13px;color:#e8b84b;">${name}</span>
          <span style="font-size:11px;color:#888;margin-left:6px;">${time}</span>
          <div style="margin-top:4px;padding:9px 13px;background:#1e2130;border:1px solid #2a2f45;border-radius:4px 14px 14px 14px;color:#e8eef8;font-size:14px;line-height:1.5;max-width:480px;word-break:break-word;">
            ${msg.content ? msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}
            ${mediaHtml}
          </div>
        </div>
      </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat da Galera — ${dateStr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0d1117; color: #e8eef8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px 16px; }
    .container { max-width: 680px; margin: 0 auto; }
    h1 { font-size: 22px; color: #e8b84b; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #666; margin-bottom: 32px; }
    .total { font-size: 12px; color: #555; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>💬 Chat da Galera</h1>
    <div class="subtitle">${dateStr}</div>
    <div class="total">${msgs.length} mensagem(ns) exportada(s)</div>
    ${rows}
  </div>
</body>
</html>`

  writeFileSync('chat-export.html', html, 'utf-8')
  console.log(`✅ Exportado! ${msgs.length} mensagens → chat-export.html`)
}

exportChat()
