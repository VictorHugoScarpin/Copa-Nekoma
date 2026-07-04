import { getGuessResult } from './teams'

// ── Metadados dos troféus (nome do arquivo .png = key) ────────────────────────
export const TROPHIES = [
  { key: 'SUPERCOPA',       label: 'Campeão Supercopa' },
  { key: '2SUPERCOPA',      label: 'Vice Supercopa' },
  { key: '3SUPERCOPA',      label: '3º Lugar Supercopa' },
  { key: 'LIGANEKOMAO',     label: 'Campeão Nekomão' },
  { key: 'COPAYUUTOKIDOU',  label: 'Campeão Yuuto Kidou' },
  { key: 'PLACAREXATO',     label: 'Rei do Placar Exato' },
  { key: 'RESULTADOCERTO',  label: 'Rei do Resultado Certo' },
  { key: 'MAISATIVO',       label: 'Mais Ativo' },
  { key: 'CONSISTENTE',     label: 'Consistente' },
  { key: 'EMCHAMAS',        label: 'Em Chamas' },
  { key: 'AZARAO',          label: 'Azarão' },
  { key: 'ZEBRA',           label: 'Zebra' },
  { key: 'DIPLOMATA',       label: 'Diplomata' },
  { key: 'PEQUENTE',        label: 'Pé Quente' },
]

/**
 * Calcula quais troféus cada jogador possui.
 *
 * @param {Array} profiles - profiles: id, points, exact_hits, partial_hits, tournament_points, created_at
 * @param {Array} guesses  - guesses de TODOS os usuários, com join em matches:
 *                           user_id, home_score, away_score, qualifier_guess,
 *                           matches(id, home_score, away_score, status, match_date, qualifier_result)
 * @returns {Object} { [userId]: string[] de trophy keys }
 */
export function computeTrophyHolders(profiles, guesses) {
  const holders = {}
  profiles.forEach(p => { holders[p.id] = new Set() })
  const grant = (uid, key) => { if (holders[uid]) holders[uid].add(key) }

  // ── Troféus de ranking (posição) ──────────────────────────────────────────
  const withSuper = profiles
    .map(p => ({ ...p, supercopa: (p.points || 0) + (p.tournament_points || 0) }))
    .sort((a, b) => b.supercopa - a.supercopa || (b.exact_hits || 0) - (a.exact_hits || 0))
  if (withSuper[0]) grant(withSuper[0].id, 'SUPERCOPA')
  if (withSuper[1]) grant(withSuper[1].id, '2SUPERCOPA')
  if (withSuper[2]) grant(withSuper[2].id, '3SUPERCOPA')

  const ligaSorted = [...profiles].sort((a, b) => (b.points || 0) - (a.points || 0) || (b.exact_hits || 0) - (a.exact_hits || 0))
  if (ligaSorted[0] && (ligaSorted[0].points || 0) > 0) grant(ligaSorted[0].id, 'LIGANEKOMAO')

  const torneioSorted = [...profiles].sort((a, b) => (b.tournament_points || 0) - (a.tournament_points || 0) || (b.exact_hits || 0) - (a.exact_hits || 0))
  if (torneioSorted[0] && (torneioSorted[0].tournament_points || 0) > 0) grant(torneioSorted[0].id, 'COPAYUUTOKIDOU')

  // Rei do Placar Exato / Pé Quente: maior número de exact_hits
  const maxExact = Math.max(0, ...profiles.map(p => p.exact_hits || 0))
  if (maxExact > 0) {
    profiles.filter(p => (p.exact_hits || 0) === maxExact).forEach(p => {
      grant(p.id, 'PLACAREXATO')
      grant(p.id, 'PEQUENTE')
    })
  }

  // Rei do Resultado Certo: maior número de partial_hits
  const maxPartial = Math.max(0, ...profiles.map(p => p.partial_hits || 0))
  if (maxPartial > 0) {
    profiles.filter(p => (p.partial_hits || 0) === maxPartial).forEach(p => grant(p.id, 'RESULTADOCERTO'))
  }

  // ── Troféus calculados a partir dos palpites (guesses) ────────────────────
  const perUser = {}
  profiles.forEach(p => { perUser[p.id] = { total: 0, misses: 0, draws: 0, entries: [] } })

  const byMatch = {}

  guesses.forEach(g => {
    const m = g.matches
    if (!m || m.status !== 'finished') return
    if (!perUser[g.user_id]) return

    const result = getGuessResult(g, m.home_score, m.away_score)
    const isHit = result === 'exact' || result === 'partial'

    const u = perUser[g.user_id]
    u.total++
    if (!isHit) u.misses++
    if (g.home_score === g.away_score) u.draws++
    u.entries.push({ date: m.match_date, hit: isHit })

    const matchId = m.id ?? `${m.match_date}`
    if (!byMatch[matchId]) byMatch[matchId] = []
    byMatch[matchId].push({ userId: g.user_id, isHit })
  })

  // Mais Ativo: mais palpites registrados
  const maxTotal = Math.max(0, ...Object.values(perUser).map(u => u.total))
  if (maxTotal > 0) {
    Object.entries(perUser).forEach(([uid, u]) => { if (u.total === maxTotal) grant(uid, 'MAISATIVO') })
  }

  // Azarão: mais palpites sem pontuar
  const maxMisses = Math.max(0, ...Object.values(perUser).map(u => u.misses))
  if (maxMisses > 0) {
    Object.entries(perUser).forEach(([uid, u]) => { if (u.misses === maxMisses) grant(uid, 'AZARAO') })
  }

  // Diplomata: mais palpites de empate
  const maxDraws = Math.max(0, ...Object.values(perUser).map(u => u.draws))
  if (maxDraws > 0) {
    Object.entries(perUser).forEach(([uid, u]) => { if (u.draws === maxDraws) grant(uid, 'DIPLOMATA') })
  }

  // Consistente: melhor % de acertos, mínimo de 3 jogos palpitados
  let bestRate = -1
  Object.values(perUser).forEach(u => {
    if (u.total >= 3) {
      const rate = u.entries.filter(e => e.hit).length / u.total
      if (rate > bestRate) bestRate = rate
    }
  })
  if (bestRate >= 0) {
    Object.entries(perUser).forEach(([uid, u]) => {
      if (u.total >= 3) {
        const rate = u.entries.filter(e => e.hit).length / u.total
        if (rate === bestRate) grant(uid, 'CONSISTENTE')
      }
    })
  }

  // Em Chamas: maior sequência de acertos consecutivos (ordenado por data do jogo)
  let bestStreak = 0
  const streakByUser = {}
  Object.entries(perUser).forEach(([uid, u]) => {
    const sorted = [...u.entries].sort((a, b) => new Date(a.date) - new Date(b.date))
    let cur = 0, max = 0
    sorted.forEach(e => { cur = e.hit ? cur + 1 : 0; if (cur > max) max = cur })
    streakByUser[uid] = max
    if (max > bestStreak) bestStreak = max
  })
  if (bestStreak > 0) {
    Object.entries(streakByUser).forEach(([uid, s]) => { if (s === bestStreak) grant(uid, 'EMCHAMAS') })
  }

  // Zebra: acertou um jogo em que a maioria errou (mínimo 3 palpites no jogo p/ fazer sentido)
  const zebraCount = {}
  Object.values(byMatch).forEach(list => {
    if (list.length < 3) return
    const missCount = list.filter(g => !g.isHit).length
    const missRate = missCount / list.length
    if (missRate > 0.5) {
      list.filter(g => g.isHit).forEach(g => { zebraCount[g.userId] = (zebraCount[g.userId] || 0) + 1 })
    }
  })
  const maxZebra = Math.max(0, ...Object.values(zebraCount))
  if (maxZebra > 0) {
    Object.entries(zebraCount).forEach(([uid, c]) => { if (c === maxZebra) grant(uid, 'ZEBRA') })
  }

  const result = {}
  Object.entries(holders).forEach(([uid, set]) => { result[uid] = Array.from(set) })
  return result
}
