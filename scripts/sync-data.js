import ws from 'ws'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    transport: ws,
    params: { eventsPerSecond: -1 },
  },
  global: {
    fetch: fetch,
  },
})

async function checkApiStatus() {
  console.log('🔍 A verificar status da API...')
  const res = await fetch('https://v3.football.api-sports.io/status', {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
      'x-rapidapi-key': FOOTBALL_API_KEY,
    },
  })
  const data = await res.json()
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`Erro API: ${JSON.stringify(data.errors)}`)
  }
  console.log(`📊 Cota Diária: ${data.response.requests.current} de ${data.response.requests.limit_day} usadas.`)
}

async function debugApi() {
  console.log('🔍 Testando endpoint league=1 season=2026...')
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?league=1&season=2026`, {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
      'x-rapidapi-key': FOOTBALL_API_KEY,
    },
  })
  const data = await res.json()
  console.log('Resposta completa:', JSON.stringify(data, null, 2))
}

async function main() {
  try {
    await checkApiStatus()
    await debugApi()
  } catch (err) {
    console.error('❌ ERRO:', err.message)
    process.exit(1)
  }
}

main()
