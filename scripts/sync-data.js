import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

const TEAM_PT = {
  'Brazil':'Brasil','Argentina':'Argentina','France':'França','Germany':'Alemanha',
  'Spain':'Espanha','England':'Inglaterra','Portugal':'Portugal','Netherlands':'Holanda',
  'Italy':'Itália','Uruguay':'Uruguai','Colombia':'Colômbia','Mexico':'México',
  'United States':'EUA','USA':'EUA','Canada':'Canadá','Japan':'Japão',
  'South Korea':'Coreia do Sul','Korea Republic':'Coreia do Sul','Morocco':'Marrocos',
  'Senegal':'Senegal','Ghana':'Gana','Nigeria':'Nigéria','Australia':'Austrália',
  'Saudi Arabia':'Arábia Saudita','Iran':'Irã','IR Iran':'Irã','Qatar':'Catar',
  'Croatia':'Croácia','Serbia':'Sérvia','Switzerland':'Suíça','Belgium':'Bélgica',
  'Denmark':'Dinamarca','Poland':'Polônia','Cameroon':'Camarões','Ecuador':'Equador',
  'Tunisia':'Tunísia','Costa Rica':'Costa Rica','Wales':'País de Gales',
  'Chile':'Chile','Peru':'Peru','Paraguay':'Paraguai','Venezuela':'Venezuela',
  'Bolivia':'Bolívia','Austria':'Áustria','Turkey':'Turquia','Ukraine':'Ucrânia',
  'Honduras':'Honduras','Panama':'Panamá','Jamaica':'Jamaica',
  'Slovakia':'Eslováquia','Romania':'Romênia','Hungary':'Hungria',
  'Czechia':'Rep. Tcheca','Slovenia':'Eslovênia','Algeria':'Argélia',
  'Egypt':'Egito','New Zealand':'Nova Zelândia',"Côte d'Ivoire":'Costa do Marfim',
  'South Africa':'África do Sul','Bosnia and Herzegovina':'Bósnia','Scotland':'Escócia',
  'Uzbekistan':'Uzbequistão','Jordan':'Jordânia','Iraq':'Iraque',
  'Sweden':'Suécia','Norway':'Noruega','Albania':'Albânia',
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  realtime: { transport: ws, params: { eventsPerSecond: -1 } },
  global: { fetch: fetch },
})

const FLAG_MAP = {
  'Brazil':'🇧🇷','Argentina':'🇦🇷','France':'🇫🇷','Germany':'🇩🇪',
  'Spain':'🇪🇸','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Netherlands':'🇳🇱',
  'Italy':'🇮🇹','Uruguay':'🇺🇾','Colombia':'🇨🇴','Mexico':'🇲🇽',
  'USA':'🇺🇸','Canada':'🇨🇦','Japan':'🇯🇵','South Korea':'🇰🇷',
  'Morocco':'🇲🇦','Senegal':'🇸🇳','Ghana':'🇬🇭','Nigeria':'🇳🇬',
  'Australia':'🇦🇺','Saudi Arabia':'🇸🇦','Iran':'🇮🇷','Qatar':'🇶🇦',
  'Croatia':'🇭🇷','Serbia':'🇷🇸','Switzerland':'🇨🇭','Belgium':'🇧🇪',
  'Denmark':'🇩🇰','Poland':'🇵🇱','Cameroon':'🇨🇲','Ecuador':'🇪🇨',
  'Tunisia':'🇹🇳','Costa Rica':'🇨🇷','Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Chile':'🇨🇱','Peru':'🇵🇪','Paraguay':'🇵🇾','Venezuela':'🇻🇪',
  'Bolivia':'🇧🇴','Austria':'🇦🇹','Turkey':'🇹🇷','Ukraine':'🇺🇦',
  'Honduras':'🇭🇳','Panama':'🇵🇦','Jamaica':'🇯🇲',
  'United States':'🇺🇸','IR Iran':'🇮🇷','Korea Republic':'🇰🇷',
  "Côte d'Ivoire":'🇨🇮','Algeria':'🇩🇿','Egypt':'🇪🇬',
  'New Zealand':'🇳🇿','Slovakia':'🇸🇰','Romania':'🇷🇴',
  'Hungary':'🇭🇺','Czechia':'🇨🇿','Slovenia':'🇸🇮',
  'Guatemala':'🇬🇹','El Salvador':'🇸🇻','South Africa':'🇿🇦',
  'Bosnia and Herzegovina':'🇧🇦','Bosnia-Herzegovina':'🇧🇦',
  'Bosnia & Herzegovina':'🇧🇦','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Uzbekistan':'🇺🇿','Jordan':'🇯🇴','Iraq':'🇮🇶',
  'Haiti':'🇭🇹','Curaçao':'🇨🇼','Cape Verde':'🇨🇻',
  'DR Congo':'🇨🇩','Congo DR':'🇨🇩',
}

async function apiRequest(endpoint) {
  const res = await fetch(`https://api.football-data.org/v4${endpoint}`, {
    headers: { 'X-Auth-Token': FOOTBALL_API_KEY },
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
  return 'upcoming'
}

function mapStage(stage) {
  if (stage === 'GROUP_STAGE') return 'Grupos'
  if (stage === 'ROUND_OF_16') return 'Oitavas'
  if (stage === 'QUARTER_FINALS') return 'Quartas'
  if (stage === 'SEMI_FINALS') return 'Semis'
  if (stage === 'THIRD_PLACE') return '3º Lugar'
  if (stage === 'FINAL') return 'Final'
  return stage || 'Grupos'
}

function mapGroup(group) {
  if (!group) return null
  return group.replace('GROUP_', 'Grupo ')
}

// ── PONTUAÇÃO DO BOLÃO ──────────────────────────────────────────────────────
const KNOCKOUT_START = new Date('2026-06-28T00:00:00Z')

function calcPoints(guess, matchHomeScore, matchAwayScore, qualifierResult, matchDate) {
  if (matchHomeScore == null || matchAwayScore == null) return 0
  const isKnockout = new Date(matchDate) >= KNOCKOUT_START

  const exactScore = guess.home_score === matchHomeScore && guess.away_score === matchAwayScore
  const realWinner = matchHomeScore > matchAwayScore ? 'home' : matchAwayScore > matchHomeScore ? 'away' : 'draw'
  const guessWinner = guess.home_score > guess.away_score ? 'home' : guess.away_score > guess.home_score ? 'away' : 'draw'
  const correctResult = realWinner === guessWinner

  const qualifierCorrect = isKnockout && qualifierResult && guess.qualifier_guess === qualifierResult

  let pts = 0
  if (exactScore) pts += 3
  else if (correctResult) pts += 1
  if (qualifierCorrect) pts += 2

  return pts
}

async function recalcMatchPoints(matchId, homeScore, awayScore, qualifierResult, matchDate) {
  const { data: guesses, error } = await supabase
    .from('guesses')
    .select('id, user_id, home_score, away_score, qualifier_guess')
    .eq('match_id', matchId)

  if (error || !guesses?.length) return

  const affectedUsers = new Set()

  for (const g of guesses) {
    const pts = calcPoints(g, homeScore, awayScore, qualifierResult, matchDate)
    await supabase.from('guesses').update({ points_earned: pts }).eq('id', g.id)
    affectedUsers.add(g.user_id)
  }

  for (const userId of affectedUsers) {
    const { data: allGuesses } = await supabase
      .from('guesses')
      .select('points_earned, home_score, away_score, qualifier_guess, matches(home_score, away_score, status, match_date, qualifier_result)')
      .eq('user_id', userId)

    let totalPts = 0, totalExact = 0, totalPartial = 0, totalQualifier = 0

    for (const ag of (allGuesses || [])) {
      const m = ag.matches
      if (!m || m.status !== 'finished' || m.home_score == null) continue
      totalPts += ag.points_earned ?? 0
      if (ag.home_score === m.home_score && ag.away_score === m.away_score) {
        totalExact++
      } else {
        const rw = m.home_score > m.away_score ? 'home' : m.away_score > m.home_score ? 'away' : 'draw'
        const gw = ag.home_score > ag.away_score ? 'home' : ag.away_score > ag.home_score ? 'away' : 'draw'
        if (rw === gw) totalPartial++
      }
      const isKo = new Date(m.match_date) >= KNOCKOUT_START
      if (isKo && m.qualifier_result && ag.qualifier_guess === m.qualifier_result) totalQualifier++
    }

    await supabase.from('profiles').update({
      points: totalPts,
      exact_hits: totalExact,
      partial_hits: totalPartial,
      qualifier_hits: totalQualifier,
    }).eq('id', userId)
  }

  console.log(`  ↳ Pontos recalculados: jogo ${matchId} | ${affectedUsers.size} usuários`)
}

// ── 1. JOGOS ────────────────────────────────────────────────────────────────
async function syncMatches() {
  console.log('📅 Sincronizando jogos...')
  const data = await apiRequest('/competitions/WC/matches?season=2026')
  const matches = data.matches || []

  // Busca status atual de todos os jogos no banco de uma vez
  const { data: existingMatches } = await supabase
    .from('matches')
    .select('external_id, status')
  const existingStatusMap = {}
  for (const m of (existingMatches || [])) {
    existingStatusMap[m.external_id] = m.status
  }

  let salvos = 0, pulados = 0, erros = 0

  for (const match of matches) {
    if (!match.homeTeam?.name || !match.awayTeam?.name) { pulados++; continue }

    const status = mapStatus(match.status)
    const externalId = String(match.id)
    const statusAntes = existingStatusMap[externalId] // status que estava no banco

    const ftHome = match.score?.fullTime?.home
    const ftAway = match.score?.fullTime?.away
    const etHome = match.score?.extraTime?.home
    const etAway = match.score?.extraTime?.away
    const penHome = match.score?.penalties?.home
    const penAway = match.score?.penalties?.away

    const finalHome = (etHome != null) ? etHome : ftHome
    const finalAway = (etAway != null) ? etAway : ftAway

    let qualifierResult = null
    if (status === 'finished' && new Date(match.utcDate) >= KNOCKOUT_START) {
      if (penHome != null && penAway != null) {
        qualifierResult = penHome > penAway ? match.homeTeam.name : match.awayTeam.name
      } else if (finalHome != null && finalAway != null && finalHome !== finalAway) {
        qualifierResult = finalHome > finalAway ? match.homeTeam.name : match.awayTeam.name
      }
    }

    const matchData = {
      external_id: externalId,
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      home_flag: FLAG_MAP[match.homeTeam.name] || '🏳️',
      away_flag: FLAG_MAP[match.awayTeam.name] || '🏳️',
      home_shield: match.homeTeam.crest || null,
      away_shield: match.awayTeam.crest || null,
      match_date: new Date(match.utcDate).toISOString(),
      stage: mapStage(match.stage),
      group_name: mapGroup(match.group),
      status,
      stream_url: 'https://www.youtube.com/@CazeTV',
    }

    if (finalHome != null) matchData.home_score = finalHome
    if (finalAway != null) matchData.away_score = finalAway
    if (penHome != null) matchData.penalty_home = penHome
    if (penAway != null) matchData.penalty_away = penAway
    if (qualifierResult) matchData.qualifier_result = qualifierResult

    const { data: upserted, error } = await supabase
      .from('matches')
      .upsert(matchData, { onConflict: 'external_id' })
      .select('id, match_date')
      .single()

    if (error) { console.error(`⚠️ Jogo ${match.id}: ${error.message}`); erros++; continue }
    salvos++

    // Só recalcula se o jogo acabou de terminar (mudou de não-finished para finished)
    if (status === 'finished' && statusAntes !== 'finished' && finalHome != null && finalAway != null && upserted?.id) {
      await recalcMatchPoints(upserted.id, finalHome, finalAway, qualifierResult, match.utcDate)
    }
  }
  console.log(`✅ Jogos: ${salvos} salvos | ⏭️ ${pulados} pulados | ❌ ${erros} erros`)
}

// ── 2. CLASSIFICAÇÃO DOS GRUPOS ─────────────────────────────────────────────
async function syncStandings() {
  console.log('📊 Sincronizando classificação...')
  const data = await apiRequest('/competitions/WC/standings?season=2026')
  const standings = data.standings || []

  if (standings.length === 0) { console.log('⚠️ Sem standings ainda.'); return }

  const temGruposSeparados = standings.some(s => s.group && s.group.match(/GROUP_[A-Z]/))
  if (!temGruposSeparados) {
    console.log('⚠️ API ainda não separou por grupos — pulando standings.')
    return
  }

  let salvos = 0, erros = 0

  for (const group of standings) {
    const groupName = group.group?.replace('GROUP_', 'Grupo ') || 'Grupos'
    for (const entry of group.table) {
      const { error } = await supabase.from('group_standings').upsert({
        group_name: groupName,
        team_name: entry.team.name,
        flag_emoji: FLAG_MAP[entry.team.name] || '🏳️',
        played: entry.playedGames,
        won: entry.won,
        drawn: entry.draw,
        lost: entry.lost,
        goals_for: entry.goalsFor,
        goals_against: entry.goalsAgainst,
        goal_diff: entry.goalDifference,
        points: entry.points,
      }, { onConflict: 'group_name,team_name' })

      if (error) { console.error(`⚠️ ${entry.team.name}: ${error.message}`); erros++ }
      else salvos++
    }
  }
  console.log(`✅ Standings: ${salvos} salvos | ❌ ${erros} erros`)
}

// ── FOTO DO JOGADOR VIA WIKIPEDIA ───────────────────────────────────────────
const photoCache = {}

async function wikiSummary(lang, title) {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const res = await fetch(url, { headers: { 'User-Agent': 'WorldCupSync/1.0 (contato@example.com)' } })
    if (!res.ok) return null
    const json = await res.json()
    return json?.thumbnail?.source || json?.originalimage?.source || null
  } catch {
    return null
  }
}

async function wikiSearchTitle(lang, query) {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' footballer')}&format=json&srlimit=1&origin=*`
    const res = await fetch(url, { headers: { 'User-Agent': 'WorldCupSync/1.0 (contato@example.com)' } })
    if (!res.ok) return null
    const json = await res.json()
    return json?.query?.search?.[0]?.title || null
  } catch {
    return null
  }
}

async function fetchPlayerPhoto(playerName) {
  if (photoCache[playerName] !== undefined) return photoCache[playerName]
  let photo = await wikiSummary('en', playerName)
  if (!photo) {
    const title = await wikiSearchTitle('en', playerName)
    if (title) photo = await wikiSummary('en', title)
  }
  if (!photo) photo = await wikiSummary('pt', playerName)
  if (!photo) {
    const titlePt = await wikiSearchTitle('pt', playerName)
    if (titlePt) photo = await wikiSummary('pt', titlePt)
  }
  photoCache[playerName] = photo
  return photo
}

// ── 3. ARTILHEIROS ──────────────────────────────────────────────────────────
async function syncScorers() {
  console.log('⚽ Sincronizando artilheiros...')
  const data = await apiRequest('/competitions/WC/scorers?season=2026&limit=20')
  const scorers = data.scorers || []

  if (scorers.length === 0) { console.log('⚠️ Sem artilheiros ainda.'); return }

  await supabase.from('top_scorers').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  let salvos = 0
  for (const s of scorers) {
    const photo = await fetchPlayerPhoto(s.player.name)
    const { error } = await supabase.from('top_scorers').insert({
      player_name: s.player.name,
      team_name: s.team.name,
      flag_emoji: FLAG_MAP[s.team.name] || '🏳️',
      goals: s.goals ?? 0,
      photo_url: photo,
    })
    if (!error) salvos++
    else console.error('scorer error:', error.message)
  }
  console.log(`✅ Artilheiros: ${salvos} salvos`)
}

// ── 4. ASSISTÊNCIAS ─────────────────────────────────────────────────────────
async function syncAssists() {
  console.log('👟 Sincronizando assistências...')
  const data = await apiRequest('/competitions/WC/scorers?season=2026&limit=20')
  const scorers = data.scorers || []

  if (scorers.length === 0) { console.log('⚠️ Sem dados ainda.'); return }

  const withAssists = scorers
    .filter(s => (s.assists ?? 0) > 0)
    .sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0))

  await supabase.from('top_assists').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  let salvos = 0
  for (const s of withAssists) {
    const photo = await fetchPlayerPhoto(s.player.name)
    const { error } = await supabase.from('top_assists').insert({
      player_name: s.player.name,
      team_name: s.team.name,
      flag_emoji: FLAG_MAP[s.team.name] || '🏳️',
      assists: s.assists ?? 0,
      photo_url: photo,
    })
    if (!error) salvos++
    else console.error('assist error:', error.message)
  }
  console.log(`✅ Assistências: ${salvos} salvos`)
}

// ── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await syncMatches()
    await syncStandings()
    await syncScorers()
    await syncAssists()
    console.log('🏆 Sincronização completa!')
  } catch (err) {
    console.error('❌ ERRO:', err.message)
    process.exit(1)
  }
}

main()
