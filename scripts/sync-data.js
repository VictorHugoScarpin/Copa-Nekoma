import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY
const LEAGUE_ID = 1
const SEASON = 2026

// ✅ Passa o ws como transport — resolve o crash de WebSocket no Node 20
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    transport: ws,
    params: { eventsPerSecond: -1 },
  },
  global: {
    fetch: fetch,
  },
})

const FLAG_MAP = {
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
  'Italy': '🇮🇹', 'Uruguay': '🇺🇾', 'Colombia': '🇨🇴', 'Mexico': '🇲🇽',
  'USA': '🇺🇸', 'Canada': '🇨🇦', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
  'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Ghana': '🇬🇭', 'Nigeria': '🇳🇬',
  'Australia': '🇦🇺', 'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'Qatar': '🇶🇦',
  'Croatia': '🇭🇷', 'Serbia': '🇷🇸', 'Switzerland': '🇨🇭', 'Belgium': '🇧🇪',
  'Denmark': '🇩🇰', 'Poland': '🇵🇱', 'Cameroon': '🇨🇲', 'Ecuador': '🇪🇨',
  'Tunisia': '🇹🇳', 'Costa Rica': '🇨🇷', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Chile': '🇨🇱', 'Peru': '🇵🇪', 'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪',
  'Bolivia': '🇧🇴', 'Austria': '🇦🇹', 'Turkey': '🇹🇷', 'Ukraine': '🇺🇦',
  'Honduras': '🇭🇳', 'Panama': '🇵🇦', 'Jamaica': '🇯🇲',
}

async function checkApiStatus() {
  console.log('🔍 A verificar status da API...')
  const res = await fetch('https://v3.football.api-sports.io/status', {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
      'x-rapidapi-key': FOOTBALL_API_KEY,
    },
  })
  const data = await res.json()
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`Erro API: ${JSON.stringify(data.errors)}`)
  }
  console.log(`📊 Cota Diária: ${data.response.requests.current} de ${data.response.requests.limit_day} usadas.`)
}

async function apiRequest(endpoint) {
  const res = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
      'x-rapidapi-key': FOOTBALL_API_KEY,
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.response
}

function mapStage(round) {
  if (!round) return 'Grupos'
  const r = round.toLowerCase()
  if (r.includes('group')) return 'Grupos'
  if (r.includes('final')) return 'F'
  return 'Grupos'
}

async function syncMatches() {
  console.log('📅 A descarregar jogos...')
  const fixtures = await apiRequest(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`)

  if (!fixtures || fixtures.length === 0) {
    throw new Error('API retornou lista vazia de jogos')
  }

  let erros = 0
  for (const fixture of fixtures) {
    const f = fixture.fixture
    const h = fixture.teams.home
    const a = fixture.teams.away

    const { error } = await supabase.from('matches').upsert(
      {
        external_id: String(f.id),
        home_team: h.name,
        away_team: a.name,
        home_flag: FLAG_MAP[h.name] || '🏳️',
        away_flag: FLAG_MAP[a.name] || '🏳️',
        match_date: new Date(f.date).toISOString(),
        stage: mapStage(fixture.league.round),
        status: 'upcoming',
        stream_url: 'https://www.youtube.com/@CazeTV',
      },
      { onConflict: 'external_id' }
    )

    if (error) {
      console.error(`⚠️ Erro no jogo ${f.id}: ${error.message}`)
      erros++
    }
  }

  if (erros > 0) {
    throw new Error(`${erros} jogos falharam ao guardar.`)
  }
  console.log(`✅ ${fixtures.length} jogos guardados!`)
}

async function main() {
  try {
    await checkApiStatus()
    await syncMatches()
    console.log('🏆 Sincronização concluída!')
  } catch (err) {
    console.error('❌ ERRO:', err.message)
    process.exit(1)
  }
}

main()
