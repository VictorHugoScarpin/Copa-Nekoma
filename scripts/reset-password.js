import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const USER_EMAIL = process.env.USER_EMAIL
const NOVA_SENHA = process.env.NOVA_SENHA

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // Buscar o usuário pelo email
  const { data: list, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError.message)
    process.exit(1)
  }

  const user = list.users.find(u => u.email === USER_EMAIL)
  if (!user) {
    console.error(`❌ Usuário com email "${USER_EMAIL}" não encontrado.`)
    process.exit(1)
  }

  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: NOVA_SENHA,
  })

  if (error) {
    console.error('❌ Erro ao trocar senha:', error.message)
    process.exit(1)
  }

  console.log(`✅ Senha de ${data.user.email} alterada com sucesso!`)
}

main()
