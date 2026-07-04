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
 * Calcula quais troféus cada jogador possui. Replica EXATAMENTE os mesmos
 * critérios/desempates já usados no HallPage (categorias) e no RankingPage
 * (Supercopa / Nekomão / Yuuto Kidou), pra nunca divergir de lá.
 *
 * @param {Array} profiles      - profiles ordenados por points desc (mesma ordem base do HallPage/RankingPage):
 *                                id, points, exact_hits, partial_hits, qualifier_hits, tournament_points, created_at
 * @param {Array} guesses       - TODOS os palpites de TODOS os usuários, com join em matches(status):
 *                                user_id, match_id, home_score, away_score, points_earned, created_at, matches(status)
 * @param {Set}   tournamentIds - ids dos jogadores que estão nas oitavas do torneio (opcional)
 * @returns {Object} { [userId]: string[] de trophy keys }
 */
export function computeTrophyHolders(profiles, guesses, tournamentIds) {
  const holders = {}
  profiles.forEach(p => { holders[p.id] = new Set() })
  const grant = (uid, key) => { if (uid && holders[uid]) holders[uid].add(key) }

  const finishedGuesses = guesses.filter(g => g.matches?.status === 'finished')

  // ── SUPERCOPA = liga + torneio (mesmo desempate do RankingPage) ───────────
  const supercopaRanking = profiles
    .map(p => ({ id: p.id, supercopaPoints: (p.points || 0) + (p.tournament_points || 0), exact_hits: p.exact_hits || 0, partial_hits: p.partial_hits || 0, created_at: p.created_at }))
    .sort((a, b) =>
      (b.supercopaPoints - a.supercopaPoints) ||
      (b.exact_hits - a.exact_hits) ||
      (b.partial_hits - a.partial_hits) ||
      (new Date(a.created_at) - new Date(b.created_at))
    )
  if (supercopaRanking[0]?.supercopaPoints > 0) grant(supercopaRanking[0].id, 'SUPERCOPA')
  if (supercopaRanking[1]?.supercopaPoints > 0) grant(supercopaRanking[1].id, '2SUPERCOPA')
  if (supercopaRanking[2]?.supercopaPoints > 0) grant(supercopaRanking[2].id, '3SUPERCOPA')

  // ── LIGA NEKOMÃO (ranking padrão por pontos da liga) ──────────────────────
  const ligaRanking = [...profiles].sort((a, b) =>
    ((b.points || 0) - (a.points || 0)) ||
    ((b.exact_hits || 0) - (a.exact_hits || 0)) ||
    ((b.partial_hits || 0) - (a.partial_hits || 0)) ||
    (new Date(a.created_at) - new Date(b.created_at))
  )
  if ((ligaRanking[0]?.points || 0) > 0) grant(ligaRanking[0].id, 'LIGANEKOMAO')

  // ── COPA YUUTO KIDOU (torneio mata-mata) ──────────────────────────────────
  const elegiveisTorneio = tournamentIds && tournamentIds.size > 0
    ? profiles.filter(p => tournamentIds.has(p.id))
    : profiles
  const torneioRanking = [...elegiveisTorneio].sort((a, b) => ((b.tournament_points || 0) - (a.tournament_points || 0)) || ((b.points || 0) - (a.points || 0)))
  if ((torneioRanking[0]?.tournament_points || 0) > 0) grant(torneioRanking[0].id, 'COPAYUUTOKIDOU')

  // ── PÉ QUENTE (mais placares exatos) — igual ao HallPage ──────────────────
  const peQuente = [...profiles].sort((a, b) => (b.exact_hits || 0) - (a.exact_hits || 0))
  if ((peQuente[0]?.exact_hits || 0) > 0) {
    grant(peQuente[0].id, 'PEQUENTE')
    grant(peQuente[0].id, 'PLACAREXATO')
  }

  // ── RESULTADO CERTO (mais resultados certos) ──────────────────────────────
  const resultadoCerto = [...profiles].sort((a, b) => (b.partial_hits || 0) - (a.partial_hits || 0))
  if ((resultadoCerto[0]?.partial_hits || 0) > 0) grant(resultadoCerto[0].id, 'RESULTADOCERTO')

  // ── EM CHAMAS (maior sequência de acertos consecutivos) — igual ao HallPage
  const emChamas = profiles.map(p => {
    const meus = finishedGuesses
      .filter(g => g.user_id === p.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    let maxSeq = 0, curSeq = 0
    meus.forEach(g => {
      if ((g.points_earned || 0) > 0) { curSeq++; maxSeq = Math.max(maxSeq, curSeq) }
      else curSeq = 0
    })
    return { id: p.id, _value: maxSeq }
  }).sort((a, b) => b._value - a._value)
  if (emChamas[0]?._value > 0) grant(emChamas[0].id, 'EMCHAMAS')

  // ── ZEBRA (acertou jogos que a maioria errou: <30% acertou) — igual ao HallPage
  const zebraPoints = {}
  profiles.forEach(p => { zebraPoints[p.id] = 0 })
  const matchIds = [...new Set(finishedGuesses.map(g => g.match_id))]
  matchIds.forEach(matchId => {
    const jogoPalpites = finishedGuesses.filter(g => g.match_id === matchId)
    const total = jogoPalpites.length
    if (total < 2) return
    const acertaram = jogoPalpites.filter(g => (g.points_earned || 0) > 0)
    if (acertaram.length / total < 0.30) {
      acertaram.forEach(g => { if (zebraPoints[g.user_id] !== undefined) zebraPoints[g.user_id]++ })
    }
  })
  const zebraRanking = profiles
    .map(p => ({ id: p.id, _value: zebraPoints[p.id] || 0 }))
    .sort((a, b) => b._value - a._value)
  if (zebraRanking[0]?._value > 0) grant(zebraRanking[0].id, 'ZEBRA')

  // ── CONSISTENTE (melhor % de acertos, mín. 3 jogos) — igual ao HallPage ──
  const consistente = profiles.map(p => {
    const meus = finishedGuesses.filter(g => g.user_id === p.id)
    const total = meus.length
    const acertos = (p.exact_hits || 0) + (p.partial_hits || 0)
    const pct = total >= 3 ? Math.round((acertos / total) * 100) : 0
    return { id: p.id, _value: pct, _total: total }
  }).filter(p => p._total >= 3).sort((a, b) => b._value - a._value)
  if (consistente[0]) grant(consistente[0].id, 'CONSISTENTE')

  // ── MAIS ATIVO (mais palpites registrados, TODOS, não só finalizados) ────
  const maisAtivo = profiles
    .map(p => ({ id: p.id, _value: guesses.filter(g => g.user_id === p.id).length }))
    .sort((a, b) => b._value - a._value)
  if (maisAtivo[0]?._value > 0) grant(maisAtivo[0].id, 'MAISATIVO')

  // ── DIPLOMATA (mais apostas em empate, TODAS) ─────────────────────────────
  const diplomata = profiles
    .map(p => ({ id: p.id, _value: guesses.filter(g => g.user_id === p.id && g.home_score === g.away_score).length }))
    .sort((a, b) => b._value - a._value)
  if (diplomata[0]?._value > 0) grant(diplomata[0].id, 'DIPLOMATA')

  // ── AZARÃO (mais zeros em jogos finalizados) ──────────────────────────────
  const azarao = profiles.map(p => {
    const meus = finishedGuesses.filter(g => g.user_id === p.id)
    const zeros = meus.filter(g => (g.points_earned || 0) === 0).length
    return { id: p.id, _value: zeros }
  }).sort((a, b) => b._value - a._value)
  if (azarao[0]?._value > 0) grant(azarao[0].id, 'AZARAO')

  const result = {}
  Object.entries(holders).forEach(([uid, set]) => { result[uid] = Array.from(set) })
  return result
}
