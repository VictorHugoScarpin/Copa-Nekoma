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


// Busca placar de pênaltis na API-Football (RapidAPI) pelo nome dos times e data
const rapidPenCache = {}
async function fetchRapidPenalties(homeTeam, awayTeam, utcDate) {
  if (!RAPIDAPI_KEY) return null
  const cacheKey = homeTeam + utcDate.slice(0, 10)
  if (rapidPenCache[cacheKey] !== undefined) return rapidPenCache[cacheKey]

  try {
    const date = utcDate.slice(0, 10)
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${date}&season=2026&league=1`
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      }
    })
    if (!res.ok) {
      const txt = await res.text()
      console.log('  ⚠️ RapidAPI HTTP', res.status, txt.slice(0, 200))
      rapidPenCache[cacheKey] = null; return null
    }
    const json = await res.json()
    const fixtures = json.response || []
    console.log('  🔍 RapidAPI fixtures encontrados:', fixtures.length, '| teams:', fixtures.map(f => f.teams?.home?.name + ' x ' + f.teams?.away?.name).join(', '))

    // Procura o jogo pelo nome dos times
    const fix = fixtures.find(f => {
      const h = f.teams?.home?.name || ''
      const a = f.teams?.away?.name || ''
      return (h.includes(homeTeam.split(' ')[0]) || homeTeam.includes(h.split(' ')[0])) &&
             (a.includes(awayTeam.split(' ')[0]) || awayTeam.includes(a.split(' ')[0]))
    })

    if (!fix) {
      console.log('  ⚠️ RapidAPI jogo não encontrado para:', homeTeam, 'x', awayTeam)
      rapidPenCache[cacheKey] = null; return null
    }

    const penHome = fix.score?.penalty?.home
    const penAway = fix.score?.penalty?.away
    console.log('  🔍 RapidAPI score raw:', JSON.stringify(fix.score))
    if (penHome == null || penAway == null) { rapidPenCache[cacheKey] = null; return null }

    const result = { penHome, penAway }
    console.log(`  🎯 RapidAPI pênaltis [${homeTeam} x ${awayTeam}]: ${penHome}x${penAway}`)
    rapidPenCache[cacheKey] = result
    return result
  } catch (e) {
    console.error('  ⚠️ RapidAPI error:', e.message)
    rapidPenCache[cacheKey] = null
    return null
  }
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
  if (stage === 'ROUND_OF_32' || stage === 'LAST_64') return 'Fase de 32'
  if (stage === 'ROUND_OF_16' || stage === 'LAST_32') return 'LAST_16'
  if (stage === 'QUARTER_FINALS' || stage === 'LAST_16') return 'LAST_8'
  if (stage === 'SEMI_FINALS' || stage === 'LAST_8') return 'LAST_4'
  if (stage === 'THIRD_PLACE') return '3º Lugar'
  if (stage === 'FINAL' || stage === 'LAST_4') return 'Final'
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
  const isKnockout = new Date(String(matchDate).replace(' ', 'T')) >= KNOCKOUT_START

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
      const isKo = new Date(String(m.match_date).replace(' ', 'T')) >= KNOCKOUT_START
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
  const d = new Date(String(dateStr).replace(' ', 'T'))
  return TOURNAMENT_PHASES.find(ph => {
    return d >= new Date(ph.start + 'T00:00:00Z') && d <= new Date(ph.end + 'T23:59:59Z')
  }) || null
}

async function tryAdvancePhase(matchDate) {
  const phase = getPhaseForDate(matchDate)
  if (!phase) return // jogo da fase de grupos, ignora

  // Verifica se todos os jogos desta fase já terminaram (exclui jogos de grupos)
  const { data: phaseMatches } = await supabase
    .from('matches')
    .select('id, status')
    .gte('match_date', phase.start + 'T00:00:00Z')
    .lte('match_date', phase.end + 'T23:59:59Z')
    .neq('stage', 'Grupos')

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
    // Todos os confrontos desta fase já foram resolvidos (ou fase não tem dados ainda)
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

  // Monta confrontos da próxima fase respeitando o chaveamento
  const nextPhaseIdx = TOURNAMENT_PHASES.findIndex(ph => ph.key === phase.key) + 1
  if (nextPhaseIdx < TOURNAMENT_PHASES.length) {
    await seedNextPhase(phase, TOURNAMENT_PHASES[nextPhaseIdx])
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

// Fixa o chaveamento das oitavas no banco baseado no ranking geral no momento.
// Chamada preventivamente sempre que >= 28/06 — tem guard interno para não duplicar.
async function initOitavas() {
  const { data: existing } = await supabase
    .from('tournament_matchups')
    .select('id')
    .eq('phase', 'oitavas')
    .limit(1)
  if (existing?.length) return // já fixado, não mexe mais

  console.log('🏆 Fixando chaveamento das oitavas pelo ranking atual...')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, points, exact_hits, partial_hits, created_at')
    .order('points', { ascending: false })
    .order('exact_hits', { ascending: false })
    .order('partial_hits', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(16)

  if (!profiles || profiles.length < 2) {
    console.log('⚠️ Menos de 2 participantes para fixar oitavas')
    return
  }

  // Garante 16 slots (preenche com null se tiver menos de 16 participantes)
  const p = [...profiles]
  while (p.length < 16) p.push(null)

  const rows = []
  for (let i = 0; i < 8; i++) {
    const p1 = p[i]
    const p2 = p[15 - i]
    if (!p1 && !p2) continue
    rows.push({
      phase: 'oitavas',
      slot: i,
      player1_id: p1?.id || null,
      player2_id: p2?.id || null,
    })
  }

  const { error } = await supabase.from('tournament_matchups').insert(rows)
  if (error) console.error('⚠️ Erro ao fixar oitavas:', error.message)
  else console.log(`✅ Oitavas fixadas: ${rows.length} confrontos (1ºvs16º, 2ºvs15º...)`)
}

// Monta confrontos da próxima fase respeitando a chave A e chave B:
//
// Oitavas (8 slots):  chave A = slots pares (0,2,4,6)  |  chave B = slots ímpares (1,3,5,7)
// Quartas (4 slots):  chave A = slots 0,1  (W0vsW2, W4vsW6)  |  chave B = slots 2,3 (W1vsW3, W5vsW7)
// Semi    (2 slots):  chave A = slot 0 (W_qA0 vs W_qA1)  |  chave B = slot 1 (W_qB0 vs W_qB1)
// Final   (1 slot):   slot 0 = vencedor semi A vs vencedor semi B
//
// Regra geral: dentro de cada fase, slots pares da chave A se encontram entre si,
// slots ímpares da chave B se encontram entre si, e só se cruzam na final.
async function seedNextPhase(currentPhase, nextPhase) {
  // Guard: próxima fase já criada?
  const { data: existing } = await supabase
    .from('tournament_matchups')
    .select('id')
    .eq('phase', nextPhase.key)
    .limit(1)
  if (existing?.length) return

  // Busca todos os matchups da fase atual ordenados por slot
  const { data: allCurrentMatchups } = await supabase
    .from('tournament_matchups')
    .select('slot, winner_id')
    .eq('phase', currentPhase.key)
    .order('slot', { ascending: true })

  if (!allCurrentMatchups?.length) return

  // Todos precisam ter winner para montar a próxima fase
  const allResolved = allCurrentMatchups.every(m => m.winner_id)
  if (!allResolved) {
    console.log(`⏳ ${currentPhase.label}: ainda tem confrontos sem vencedor, aguardando...`)
    return
  }

  console.log(`🏆 Montando ${nextPhase.label} pelo chaveamento...`)

  // Monta um mapa slot → winner_id
  const winnerBySlot = {}
  allCurrentMatchups.forEach(m => { winnerBySlot[m.slot] = m.winner_id })

  const rows = []

  if (currentPhase.key === 'oitavas') {
    // Chave A: slots 0,2,4,6 → quartas slots 0,1
    // W(slot0) vs W(slot2) → quartas slot 0
    // W(slot4) vs W(slot6) → quartas slot 1
    // Chave B: slots 1,3,5,7 → quartas slots 2,3
    // W(slot1) vs W(slot3) → quartas slot 2
    // W(slot5) vs W(slot7) → quartas slot 3
    rows.push({ phase: nextPhase.key, slot: 0, player1_id: winnerBySlot[0], player2_id: winnerBySlot[2] })
    rows.push({ phase: nextPhase.key, slot: 1, player1_id: winnerBySlot[4], player2_id: winnerBySlot[6] })
    rows.push({ phase: nextPhase.key, slot: 2, player1_id: winnerBySlot[1], player2_id: winnerBySlot[3] })
    rows.push({ phase: nextPhase.key, slot: 3, player1_id: winnerBySlot[5], player2_id: winnerBySlot[7] })
  } else if (currentPhase.key === 'quartas') {
    // Chave A: slots 0,1 → semi slot 0
    // W(slot0) vs W(slot1) → semi slot 0
    // Chave B: slots 2,3 → semi slot 1
    // W(slot2) vs W(slot3) → semi slot 1
    rows.push({ phase: nextPhase.key, slot: 0, player1_id: winnerBySlot[0], player2_id: winnerBySlot[1] })
    rows.push({ phase: nextPhase.key, slot: 1, player1_id: winnerBySlot[2], player2_id: winnerBySlot[3] })
  } else if (currentPhase.key === 'semi') {
    // Vencedor semi A (slot 0) vs vencedor semi B (slot 1) → final slot 0
    rows.push({ phase: nextPhase.key, slot: 0, player1_id: winnerBySlot[0], player2_id: winnerBySlot[1] })
  }

  if (!rows.length) return

  const { error } = await supabase.from('tournament_matchups').insert(rows)
  if (error) console.error(`⚠️ Erro ao criar ${nextPhase.label}:`, error.message)
  else console.log(`✅ ${rows.length} confrontos de ${nextPhase.label} criados`)
}

// ── REPARO PONTUAL: recalcula jogos finished com qualifier_result cujos pontos podem estar errados ──
async function repairQualifierPoints() {
  console.log('🔧 Verificando jogos knockout com qualifier_result para reparo...')

  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_score, away_score, qualifier_result, match_date')
    .eq('status', 'finished')
    .not('qualifier_result', 'is', null)
    .gte('match_date', KNOCKOUT_START.toISOString())

  if (!matches?.length) { console.log('  ↳ Nenhum jogo knockout finalizado com qualifier ainda.'); return }

  for (const m of matches) {
    // Verifica TODOS os palpites do jogo, não só quem acertou — o qualifier_result
    // pode ter mudado (ex: API corrigiu o resultado), então quem antes "acertava"
    // pode agora estar errando, e vice-versa. Sem isso, pontos de bônus errados
    // ficam presos no total de quem passou a errar.
    const { data: guesses } = await supabase
      .from('guesses')
      .select('id, user_id, home_score, away_score, qualifier_guess, points_earned')
      .eq('match_id', m.id)

    if (!guesses?.length) continue

    const needsRepair = guesses.some(g => {
      const exactScore = g.home_score === m.home_score && g.away_score === m.away_score
      const expectedBase = exactScore ? 3 : (() => {
        const rw = m.home_score > m.away_score ? 'home' : m.away_score > m.home_score ? 'away' : 'draw'
        const gw = g.home_score > g.away_score ? 'home' : g.away_score > g.home_score ? 'away' : 'draw'
        return rw === gw ? 1 : 0
      })()
      const acertouQualifier = g.qualifier_guess && g.qualifier_guess === m.qualifier_result
      const expected = expectedBase + (acertouQualifier ? 2 : 0)
      return (g.points_earned ?? 0) !== expected
    })

    if (needsRepair) {
      console.log(`  🔧 Reparando qualifier points do jogo ${m.id} (${m.qualifier_result})...`)
      await recalcMatchPoints(m.id, m.home_score, m.away_score, m.qualifier_result, m.match_date)
    }
  }
  console.log('  ↳ Reparo de qualifier concluído.')
}


async function syncMatches() {
  console.log('📅 Sincronizando jogos...')
  const data = await apiRequest('/competitions/WC/matches?season=2026')
  const matches = data.matches || []
  // Busca status e qualifier_result atual de todos os jogos no banco de uma vez
  const { data: existingMatches } = await supabase
    .from('matches')
    .select('external_id, status, qualifier_result')
  const existingStatusMap = {}
  const existingQualifierMap = {}
  for (const m of (existingMatches || [])) {
    existingStatusMap[m.external_id] = m.status
    existingQualifierMap[m.external_id] = m.qualifier_result
  }

  let salvos = 0, pulados = 0, erros = 0

  for (const match of matches) {
    if (match.score?.duration === 'PENALTY_SHOOTOUT') {
      console.log('🔍 RAW:', match.homeTeam.name, 'x', match.awayTeam.name, JSON.stringify(match.score))
    }
    if (!match.homeTeam?.name || !match.awayTeam?.name) { pulados++; continue }

    const status = mapStatus(match.status)
    const externalId = String(match.id)
    const statusAntes = existingStatusMap[externalId] // status que estava no banco
    const qualifierAntes = existingQualifierMap[externalId] // qualifier_result que estava no banco

    const rtHome = match.score?.regularTime?.home ?? null
    const rtAway = match.score?.regularTime?.away ?? null
    const ftHome = match.score?.fullTime?.home ?? null
    const ftAway = match.score?.fullTime?.away ?? null
    const etHome = match.score?.extraTime?.home ?? null
    const etAway = match.score?.extraTime?.away ?? null

    // Placar exibido = regularTime + extraTime; se não tiver regularTime usa fullTime
    const finalHome = rtHome != null ? rtHome + (etHome ?? 0) : ftHome
    const finalAway = rtAway != null ? rtAway + (etAway ?? 0) : ftAway

    // Pênaltis: calcula subtraindo regularTime + extraTime do fullTime acumulado
    let penHome = null
    let penAway = null
    if (status === 'finished' && match.score?.duration === 'PENALTY_SHOOTOUT' && ftHome != null && ftAway != null && finalHome != null && finalAway != null) {
      penHome = ftHome - finalHome
      penAway = ftAway - finalAway
    }

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

    // Recalcula pontos se:
    // (a) jogo acabou de terminar (mudou de não-finished para finished), OU
    // (b) jogo já estava finished mas qualifier_result chegou agora (pênaltis com dado atrasado)
    const recémTerminou = status === 'finished' && statusAntes !== 'finished'
    const qualifierChegouAgora = status === 'finished' && statusAntes === 'finished' && qualifierResult && !qualifierAntes
    if ((recémTerminou || qualifierChegouAgora) && finalHome != null && finalAway != null && upserted?.id) {
      await recalcMatchPoints(upserted.id, finalHome, finalAway, qualifierResult, match.utcDate)
    }
  }
  console.log(`✅ Jogos: ${salvos} salvos | ⏭️ ${pulados} pulados | ❌ ${erros} erros`)

  // Se já chegamos na data das oitavas, fixa o chaveamento preventivamente
  // (tem guard interno — só roda uma vez, na primeira execução após 28/06)
  if (new Date() >= KNOCKOUT_START) {
    await initOitavas()
  }
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
    await repairQualifierPoints()
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
