import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

async function sync() {
  console.log("🚀 Iniciando sync...");
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?league=1&season=2022`, {
    headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY }
  });
  const data = await res.json();
  
  if (!data.response || data.response.length === 0) throw new Error("API retornou vazia");

  for (const f of data.response.slice(0, 5)) {
    const { error } = await supabase.from('matches').upsert({
      external_id: String(f.fixture.id),
      home_team: f.teams.home.name,
      away_team: f.teams.away.name,
      match_date: new Date(f.fixture.date).toISOString(),
      status: 'upcoming'
    }, { onConflict: 'external_id' });
    
    if (error) console.error("Erro Supabase:", error.message);
  }
  console.log("✅ Sync finalizado!");
}

sync().catch(err => { console.error(err); process.exit(1); });
