import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY

const LEAGUE_ID = 1
const SEASON = 2022

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
  'Mexico': '🇲🇽', 'Honduras': '🇭🇳', 'Panama': '🇵🇦', 'Jamaica': '🇯🇲',
}

async function apiRequest(endpoint) {
  const res = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: {
      'x-rapidapi-key': FOOTBALL_API_KEY,
      'x-rapidapi-host': 'v3.football.api-sports.io'
    }
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.response
}

function mapStage(round) {
  if (!round) return 'Grupos'
  const r = round.toLowerCase()
  if (r.includes('group')) return 'Grupos'
  if (r.includes('round of 32')) return 'R32'
  if (r.includes('round of 16')) return 'R16'
  if (r.includes('quarter')) return 'QF'
  if (r.includes('semi')) return 'SF'
  if (r.includes('3rd') || r.includes('third')) return 'THIRD'
  if (r.includes('final')) return 'F'
  return 'Grupos'
}

async function syncMatches() {
  console.log('📅 Sincronizando jogos...')
  const fixtures = await apiRequest(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`)

  for (const fixture of fixtures) {
    const f = fixture.fixture
    const h = fixture.teams.home
    const a = fixture.teams.away
    const g = fixture.goals
    const s = fixture.fixture.status.short

    const stage = mapStage(fixture.league.round)
    const groupMatch = fixture.league.round?.match(/Group ([A-Z])/i)
    const groupName = groupMatch ? groupMatch[1].toUpperCase() : null

    let status = 'upcoming'
    if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(s)) status = 'live'
    if (['FT', 'AET', 'PEN'].includes(s)) status = 'finished'

    await supabase.from('matches').upsert({
      external_id: String(f.id),
      home_team: h.name,
      away_team: a.name,
      home_flag: FLAG_MAP[h.name] || '🏳️',
      away_flag: FLAG_MAP[a.name] || '🏳️',
      home_score: status === 'finished' ? g.home : null,
      away_score: status === 'finished' ? g.away : null,
      match_date: new Date(f.date).toISOString(),
      stage,
      group_name: groupName,
      status,
      stream_url: 'https://www.youtube.com/@CazéTV',
    }, { onConflict: 'external_id' })
  }
  console.log(`✅ ${fixtures.length} jogos sincronizados`)
}

async function syncStandings() {
  console.log('📊 Sincronizando grupos...')
  const standings = await apiRequest(`/standings?league=${LEAGUE_ID}&season=${SEASON}`)

  const rows = []
  for (const league of standings) {
    for (const groupData of league.league.standings) {
      for (const team of groupData) {
        rows.push({
          group_name: team.group?.replace('Group ', '') || '?',
          team_name: team.team.name,
          flag_emoji: FLAG_MAP[team.team.name] || '🏳️',
          played: team.all.played,
          won: team.all.win,
          drawn: team.all.draw,
          lost: team.all.lose,
          goals_for: team.all.goals.for,
          goals_against: team.all.goals.against,
          goal_diff: team.goalsDiff,
          points: team.points,
          updated_at: new Date().toISOString(),
        })
      }
    }
  }

  await supabase.from('group_standings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (rows.length > 0) await supabase.from('group_standings').insert(rows)
  console.log(`✅ ${rows.length} times sincronizados`)
}

async function syncTopScorers() {
  console.log('⚽ Sincronizando artilheiros...')
  const scorers = await apiRequest(`/players/topscorers?league=${LEAGUE_ID}&season=${SEASON}`)

  const rows = scorers.slice(0, 10).map(p => ({
    player_name: p.player.name,
    team_name: p.statistics[0]?.team?.name || '',
    flag_emoji: FLAG_MAP[p.statistics[0]?.team?.name] || '',
    photo_url: p.player.photo || null,
    goals: p.statistics[0]?.goals?.total || 0,
    updated_at: new Date().toISOString(),
  }))

  await supabase.from('top_scorers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (rows.length > 0) await supabase.from('top_scorers').insert(rows)
  console.log(`✅ ${rows.length} artilheiros sincronizados`)
}

async function syncTopAssists() {
  console.log('👟 Sincronizando assistências...')
  const assists = await apiRequest(`/players/topassists?league=${LEAGUE_ID}&season=${SEASON}`)

  const rows = assists.slice(0, 10).map(p => ({
    player_name: p.player.name,
    team_name: p.statistics[0]?.team?.name || '',
    flag_emoji: FLAG_MAP[p.statistics[0]?.team?.name] || '',
    photo_url: p.player.photo || null,
    assists: p.statistics[0]?.goals?.assists || 0,
    updated_at: new Date().toISOString(),
  }))

  await supabase.from('top_assists').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (rows.length > 0) await supabase.from('top_assists').insert(rows)
  console.log(`✅ ${rows.length} assistências sincronizadas`)
}

async function main() {
  try {
    await syncMatches()
    await syncStandings()
    await syncTopScorers()
    await syncTopAssists()
    console.log('🏆 Sync completo!')
  } catch (err) {
    console.error('❌ Erro:', err.message)
    process.exit(1)
  }
}

main()
