// Execute: node scripts/seed-test-matches.js
// Insere jogos de teste no Supabase para você ver o app funcionando

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.argv[2]
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.argv[3]

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.log('Uso: node scripts/seed-test-matches.js <SUPABASE_URL> <SERVICE_KEY>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const now = new Date()
const h = (hours) => new Date(now.getTime() + hours * 3600000).toISOString()
const p = (hours) => new Date(now.getTime() - hours * 3600000).toISOString()

const matches = [
  // Jogo ao vivo agora
  { home_team: 'Brasil', away_team: 'Argentina', home_flag: '🇧🇷', away_flag: '🇦🇷', match_date: p(1), stage: 'Grupos', group_name: 'A', status: 'live', stream_url: 'https://www.youtube.com/@CazéTV' },
  // Jogo futuro em 2h
  { home_team: 'França', away_team: 'Alemanha', home_flag: '🇫🇷', away_flag: '🇩🇪', match_date: h(2), stage: 'Grupos', group_name: 'B', status: 'upcoming' },
  // Jogo futuro em 5h
  { home_team: 'Espanha', away_team: 'Portugal', home_flag: '🇪🇸', away_flag: '🇵🇹', match_date: h(5), stage: 'Grupos', group_name: 'C', status: 'upcoming' },
  // Jogo encerrado — acerto
  { home_team: 'Croácia', away_team: 'Marrocos', home_flag: '🇭🇷', away_flag: '🇲🇦', match_date: p(24), stage: 'Grupos', group_name: 'D', status: 'finished', home_score: 2, away_score: 1 },
  // Jogo encerrado — erro
  { home_team: 'Japão', away_team: 'Coreia do Sul', home_flag: '🇯🇵', away_flag: '🇰🇷', match_date: p(48), stage: 'Grupos', group_name: 'E', status: 'finished', home_score: 0, away_score: 2 },
  // Amanhã
  { home_team: 'Holanda', away_team: 'Senegal', home_flag: '🇳🇱', away_flag: '🇸🇳', match_date: h(22), stage: 'Grupos', group_name: 'F', status: 'upcoming' },
  { home_team: 'Inglaterra', away_team: 'EUA', home_flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag: '🇺🇸', match_date: h(26), stage: 'Grupos', group_name: 'G', status: 'upcoming' },
]

async function seed() {
  console.log('🌱 Inserindo jogos de teste...')
  const { error } = await supabase.from('matches').insert(matches)
  if (error) {
    console.error('Erro:', error.message)
  } else {
    console.log(`✅ ${matches.length} jogos inseridos com sucesso!`)
    console.log('Abra o app e veja os jogos na tela Home.')
  }
}

seed()
