import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY

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
  global: { fetch: fetch },
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
  'United States': '🇺🇸', 'IR Iran': '🇮🇷', 'Korea Republic': '🇰🇷',
  'Côte d\'Ivoire': '🇨🇮', 'Algeria': '🇩🇿', 'Egypt': '🇪🇬',
  'New Zealand': '🇳🇿', 'Slovakia': '🇸🇰', 'Romania': '🇷🇴',
  'Hungary': '🇭🇺', 'Czechia': '🇨🇿', 'Slovenia': '🇸🇮',
  'Venezuela': '🇻🇪', 'Guatemala': '🇬🇹', 'El Salvador': '🇸🇻',
}

async function apiRequest(endpoint) {
  const res = await fetch(`https://api.football-data.org/v4${endpoint}`, {
    headers: {
      'X-Auth-Token': FOOTBALL_API_KEY,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

function mapStatus(status) {
  if (status === 'FINISHED') return 'finished'
  if (status === 'IN_PLAY' || status === 'PAUSED') return 'live'
  if (status === 'TIMED' || status === 'SCHEDULED') return 'upcoming'
  return 'upcoming'
}

function mapStage(stage, group) {
  if (stage === 'GROUP_STAGE') return group ? `Grupo ${group.replace('GROUP_', '')}` : 'Grupos'
  if (stage === 'ROUND_OF_16') return 'Oitavas'
  if (stage === 'QUARTER_FINALS') return 'Quartas'
  if (stage === 'SEMI_FINALS') return 'Semis'
  if (stage === 'THIRD_PLACE') return '3º Lugar'
  if (stage === 'FINAL') return 'Final'
  return stage || 'Grupos'
}

async function syncMatches() {
  console.log('📅 A descarregar jogos da Copa 2026...')

  // ID 2000 = FIFA World Cup no football-data.org
  const data = await apiRequest('/competitions/WC/matches?season=2026')

  const matches = data.matches
  if (!matches || matches.length === 0) {
    throw new Error('API retornou lista vazia de jogos')
  }

  console.log(`🔢 ${matches.length} jogos encontrados, a guardar...`)

  let erros = 0
  for (const match of matches) {
    const homeScore = match.score?.fullTime?.home ?? null
    const awayScore = match.score?.fullTime?.away ?? null

    const { error } = await supabase.from('matches').upsert(
      {
        external_id: String(match.id),
        home_team: match.homeTeam.name,
        away_team: match.awayTeam.name,
        home_flag: FLAG_MAP[match.homeTeam.name] || '🏳️',
        away_flag: FLAG_MAP[match.awayTeam.name] || '🏳️',
        match_date: new Date(match.utcDate).toISOString(),
        stage: mapStage(match.stage, match.group),
        status: mapStatus(match.status),
        home_score: homeScore,
        away_score: awayScore,
        stream_url: 'https://www.youtube.com/@CazeTV',
      },
      { onConflict: 'external_id' }
    )

    if (error) {
      console.error(`⚠️ Erro no jogo ${match.id}: ${error.message}`)
      erros++
    }
  }

  if (erros > 0) {
    throw new Error(`${erros} jogos falharam ao guardar.`)
  }
  console.log(`✅ ${matches.length} jogos guardados!`)
}

async function main() {
  try {
    await syncMatches()
    console.log('🏆 Sincronização concluída!')
  } catch (err) {
    console.error('❌ ERRO:', err.message)
    process.exit(1)
  }
}

main()
