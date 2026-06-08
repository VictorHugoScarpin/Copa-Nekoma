import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY

const LEAGUE_ID = 1
const SEASON = 2022 // Usamos 2022 como teste garantido

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
  'Honduras': '🇭🇳', 'Panama': '🇵🇦', 'Jamaica': '🇯🇲',
}

async function checkApiStatus() {
  if (!FOOTBALL_API_KEY) throw new Error("ERRO: FOOTBALL_API_KEY em falta no GitHub Secrets.");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error("ERRO: Chaves do Supabase em falta.");

  console.log('🔍 A verificar status e credenciais da API...');
  const res = await fetch('https://v3.football.api-sports.io/status', {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
      'x-rapidapi-key': FOOTBALL_API_KEY
    }
  });
  
  const data = await res.json();
  
  if (data.errors && Object.keys(data.errors).length > 0 && !Array.isArray(data.errors)) {
     throw new Error(`Acesso negado pela API: ${JSON.stringify(data.errors)}`);
  }
  
  const req = data.response.requests;
  console.log(`📊 Cota Diária: ${req.current} requisições usadas de ${req.limit_day}.`);
  
  if (req.current >= req.limit_day) {
     throw new Error("LIMITE DIÁRIO ATINGIDO! O processo não pode continuar.");
  }
}

async function apiRequest(endpoint) {
  const res = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
      'x-rapidapi-key': FOOTBALL_API_KEY
    }
  })
  if (!res.ok) throw new Error(`Erro HTTP ao ligar à API: ${res.status}`)
  
  const data = await res.json()
  
  if (data.errors && Object.keys(data.errors).length > 0 && !Array.isArray(data.errors)) {
    throw new Error(`Erro devolvido no Endpoint ${endpoint}: ${JSON.stringify(data.errors)}`);
  }
  
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
  console.log('📅 A descarregar jogos...')
  const fixtures = await apiRequest(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`)
  
  if (!fixtures || fixtures.length === 0) {
      console.log('⚠️ AVISO: A API comunicou corretamente, mas não enviou nenhum jogo (Lista vazia).');
      return;
  }

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

    // Dentro da função syncMatches, substitua o bloco do supabase.from('matches') por este:
    
    const { data, error } = await supabase
      .from('matches') // Certifique-se que no Supabase a tabela se chama 'matches'
      .upsert({
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
        stream_url: 'https://www.youtube.com/@CazeTV',
      }, { onConflict: 'external_id' });

    if (error) {
      console.error("ERRO DETALHADO SUPABASE:", error);
      throw new Error(`Falha a guardar jogo: ${error.message}`);
    }
  console.log(`✅ ${fixtures.length} jogos guardados no banco de dados!`)
}

async function syncStandings() {
  console.log('📊 A descarregar grupos...')
  const standings = await apiRequest(`/standings?league=${LEAGUE_ID}&season=${SEASON}`)
  
  if (!standings || standings.length === 0) return;

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

  if (rows.length > 0) {
    await supabase.from('group_standings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const { error } = await supabase.from('group_standings').insert(rows)
    if (error) throw new Error(`Falha a guardar grupos no Supabase: ${error.message}`);
  }
  console.log(`✅ ${rows.length} seleções atualizadas nos grupos!`)
}

async function main() {
  try {
    await checkApiStatus()
    await syncMatches()
    await syncStandings()
    console.log('🏆 Sincronização concluída com êxito e gravada no banco!')
  } catch (err) {
    console.error('❌ ERRO ENCONTRADO DURANTE A EXECUÇÃO:', err.message)
    process.exit(1)
  }
}

main()
