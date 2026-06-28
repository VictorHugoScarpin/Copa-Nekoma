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

  // Tenta avançar fase do torneio após recalcular pontos
  await tryAdvancePhase(matchDate)
}

// ── TORNEIO: FASES ──────────────────────────────────────────────────────────
const TOURNAMENT_PHASES = [
  { key: 'oitavas', label: 'Oitavas', bonus: 3, start: '2026-06-28', end: '2026-07-03', round: 1 },
  { key: 'quartas', label: 'Quartas', bonus: 4, start: '2026-07-04', end: '2026-07-07', round: 2 },
  { key: 'semi',    label: 'Semifinal', bonus: 5, start: '2026-07-09', end: '2026-07-11', round: 3 },
  { key: 'final',   label: 'Final',   bonus: 6, start: '2026-07-14', end: '2026-07-15', round: 4 },
]

function getPhaseForDate(dateStr) {
  const d = new Date(dateStr)
  return TOURNAMENT_PHASES.find(ph => {
    return d >= new Date(ph.start + 'T00:00:00Z') && d <= new Date(ph.end + 'T23:59:59Z')
  }) || null
}

async function tryAdvancePhase(matchDate) {
  const phase = getPhaseForDate(matchDate)
  if (!phase) return // jogo da fase de grupos, ignora

  // Verifica se todos os jogos desta fase já terminaram
  const { data: phaseMatches } = await supabase
    .from('matches')
    .select('id, status')
    .gte('match_date', phase.start + 'T00:00:00Z')
    .lte('match_date', phase.end + 'T23:59:59Z')

  if (!phaseMatches?.length) return
  const allFinished = phaseMatches.every(m => m.status === 'finished')
  if (!allFinished) return

  console.log(`🏆 Todos os jogos de ${phase.label} terminaram — processando avanço de fase...`)

  // Busca confrontos desta fase que ainda não foram resolvidos
  const { data: matchups } = await supabase
    .from('tournament_matchups')
    .select('*')
    .eq('phase', phase.key)
    .is('winner_id', null)

  if (!matchups?.length) {
    // Fase já resolvida ou não inicializada
    // Se oitavas, inicializa a partir do ranking geral
    if (phase.key === 'oitavas') {
      await initOitavas()
    }
    return
  }

  const phaseMatchIds = phaseMatches.map(m => m.id)
  const phaseStart = new Date(phase.start + 'T00:00:00Z')
  const phaseEnd = new Date(phase.end + 'T23:59:59Z')

  for (const mu of matchups) {
    if (!mu.player1_id || !mu.player2_id) continue

    // Calcula pontos de cada jogador nos jogos desta fase
    const [p1pts, p2pts] = await Promise.all([
      calcPlayerPhasePoints(mu.player1_id, phaseMatchIds),
      calcPlayerPhasePoints(mu.player2_id, phaseMatchIds),
    ])

    // Desempate: busca exact_hits e partial_hits na fase e created_at
    let winnerId
    if (p1pts !== p2pts) {
      winnerId = p1pts > p2pts ? mu.player1_id : mu.player2_id
    } else {
      // Desempate por placares exatos na fase
      const [p1exact, p2exact] = await Promise.all([
        calcPlayerPhaseExact(mu.player1_id, phaseMatchIds),
        calcPlayerPhaseExact(mu.player2_id, phaseMatchIds),
      ])
      if (p1exact !== p2exact) {
        winnerId = p1exact > p2exact ? mu.player1_id : mu.player2_id
      } else {
        // Desempate por parciais
        const [p1partial, p2partial] = await Promise.all([
          calcPlayerPhasePartial(mu.player1_id, phaseMatchIds),
          calcPlayerPhasePartial(mu.player2_id, phaseMatchIds),
        ])
        if (p1partial !== p2partial) {
          winnerId = p1partial > p2partial ? mu.player1_id : mu.player2_id
        } else {
          // Desempate por data de cadastro (quem entrou primeiro)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, created_at')
            .in('id', [mu.player1_id, mu.player2_id])
          const p1 = profiles?.find(p => p.id === mu.player1_id)
          const p2 = profiles?.find(p => p.id === mu.player2_id)
          winnerId = new Date(p1.created_at) <= new Date(p2.created_at) ? mu.player1_id : mu.player2_id
        }
      }
    }

    const loser = winnerId === mu.player1_id ? mu.player2_id : mu.player1_id
    console.log(`  ↳ ${phase.label} slot ${mu.slot}: vencedor=${winnerId} (${p1pts}×${p2pts})`)

    // Salva winner e pontos no confronto
    await supabase.from('tournament_matchups').update({
      winner_id: winnerId,
      player1_points: p1pts,
      player2_points: p2pts,
    }).eq('id', mu.id)

    // Credita bônus ao vencedor (só uma vez)
    if (!mu.bonus_awarded) {
      // tournament_points e points no profile
      const { data: winner } = await supabase.from('profiles').select('points, tournament_points').eq('id', winnerId).single()
      await supabase.from('profiles').update({
        points: (winner.points || 0) + phase.bonus,
        tournament_points: (winner.tournament_points || 0) + phase.bonus,
      }).eq('id', winnerId)

      await supabase.from('tournament_matchups').update({ bonus_awarded: true }).eq('id', mu.id)
      console.log(`  ↳ Bônus +${phase.bonus}pts creditado para ${winnerId}`)
    }
  }

  // Monta confrontos da próxima fase com os vencedores
  const nextPhaseIdx = TOURNAMENT_PHASES.findIndex(ph => ph.key === phase.key) + 1
  if (nextPhaseIdx < TOURNAMENT_PHASES.length) {
    await seedNextPhase(phase, TOURNAMENT_PHASES[nextPhaseIdx], matchups)
  }
}

async function calcPlayerPhasePoints(userId, matchIds) {
  const { data } = await supabase
    .from('guesses')
    .select('points_earned')
    .eq('user_id', userId)
    .in('match_id', matchIds)
  return (data || []).reduce((s, g) => s + (g.points_earned || 0), 0)
}

async function calcPlayerPhaseExact(userId, matchIds) {
  const { data } = await supabase
    .from('guesses')
    .select('home_score, away_score, matches(home_score, away_score)')
    .eq('user_id', userId)
    .in('match_id', matchIds)
  return (data || []).filter(g => g.home_score === g.matches?.home_score && g.away_score === g.matches?.away_score).length
}

async function calcPlayerPhasePartial(userId, matchIds) {
  const { data } = await supabase
    .from('guesses')
    .select('home_score, away_score, matches(home_score, away_score)')
    .eq('user_id', userId)
    .in('match_id', matchIds)
  return (data || []).filter(g => {
    const m = g.matches
    if (!m) return false
    const exact = g.home_score === m.home_score && g.away_score === m.away_score
    if (exact) return false
    const rw = m.home_score > m.away_score ? 'home' : m.away_score > m.home_score ? 'away' : 'draw'
    const gw = g.home_score > g.away_score ? 'home' : g.away_score > g.home_score ? 'away' : 'draw'
    return rw === gw
  }).length
}

async function initOitavas() {
  // Verifica se oitavas já foram inicializadas
  const { data: existing } = await supabase
    .from('tournament_matchups')
    .select('id')
    .eq('phase', 'oitavas')
    .limit(1)
  if (existing?.length) return

  console.log('🏆 Inicializando oitavas a partir do ranking geral...')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, points, exact_hits, partial_hits, created_at')
    .order('points', { ascending: false })
    .order('exact_hits', { ascending: false })
    .order('partial_hits', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(16)

  if (!profiles || profiles.length < 2) {
    console.log('⚠️ Menos de 2 participantes para inicializar oitavas')
    return
  }

  const rows = []
  for (let i = 0; i < 8; i++) {
    const p1 = profiles[i]
    const p2 = profiles[15 - i]
    if (!p1 || !p2) continue
    rows.push({
      phase: 'oitavas',
      slot: i,
      player1_id: p1.id,
      player2_id: p2.id,
    })
  }

  const { error } = await supabase.from('tournament_matchups').insert(rows)
  if (error) console.error('⚠️ Erro ao inicializar oitavas:', error.message)
  else console.log(`✅ ${rows.length} confrontos de oitavas criados`)
}

async function seedNextPhase(currentPhase, nextPhase, resolvedMatchups) {
  // Verifica se próxima fase já foi criada
  const { data: existing } = await supabase
    .from('tournament_matchups')
    .select('id')
    .eq('phase', nextPhase.key)
    .limit(1)
  if (existing?.length) return

  // Pega todos os matchups da fase atual (com winners) para montar a próxima
  const { data: allCurrentMatchups } = await supabase
    .from('tournament_matchups')
    .select('*')
    .eq('phase', currentPhase.key)
    .order('slot', { ascending: true })

  const winners = allCurrentMatchups?.map(m => m.winner_id).filter(Boolean) || []
  if (winners.length < 2) return

  console.log(`🏆 Montando ${nextPhase.label} com ${winners.length} vencedores...`)

  // Monta confrontos da próxima fase: 1º vs 2º, 3º vs 4º etc (vencedores mantêm o seed original)
  const rows = []
  for (let i = 0; i < Math.floor(winners.length / 2); i++) {
    rows.push({
      phase: nextPhase.key,
      slot: i,
      player1_id: winners[i * 2],
      player2_id: winners[i * 2 + 1],
    })
  }

  const { error } = await supabase.from('tournament_matchups').insert(rows)
  if (error) console.error(`⚠️ Erro ao criar ${nextPhase.label}:`, error.message)
  else console.log(`✅ ${rows.length} confrontos de ${nextPhase.label} criados`)
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
