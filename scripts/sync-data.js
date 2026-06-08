import { createClient } from '@supabase/supabase-js';

// Inicialização "limpa", sem Realtime para evitar erros de WebSocket
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY, 
  { 
    auth: { persistSession: false },
    realtime: { enabled: false } 
  }
);

async function sync() {
  console.log("🚀 Iniciando sincronização...");
  
  // Vamos buscar 2022 para provar que a infraestrutura funciona
  const url = 'https://v3.football.api-sports.io/fixtures?league=1&season=2022';
  const res = await fetch(url, { 
    headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY } 
  });
  
  const data = await res.json();
  
  if (!data.response || data.response.length === 0) {
    throw new Error("API retornou vazia ou erro de conexão.");
  }

  console.log(`📡 Recebidos ${data.response.length} jogos.`);

  for (const f of data.response.slice(0, 10)) {
    const { error } = await supabase.from('matches').upsert({
      external_id: String(f.fixture.id),
      home_team: f.teams.home.name,
      away_team: f.teams.away.name,
      match_date: new Date(f.fixture.date).toISOString(),
      status: 'upcoming'
    }, { onConflict: 'external_id' });
    
    if (error) {
      console.error("Erro ao gravar no Supabase:", error.message);
    }
  }
  console.log("✅ Sync concluído com sucesso!");
}

sync().catch(err => { 
  console.error("❌ ERRO FATAL:", err); 
  process.exit(1); 
});
