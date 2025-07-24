// promote-admin.mjs
import { createClient } from '@supabase/supabase-js'

// ✅ Substitua pelos seus dados
const SUPABASE_URL = 'https://bsfhlxjwpdyzccfnecgs.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzZmhseGp3cGR5emNjZm5lY2dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODYwNTEzNiwiZXhwIjoyMDY0MTgxMTM2fQ.OGgjH9XA4FoGjKqrT437yEDVVNm-cQ3RjPwOgQ6qyg4' // 🔒 nunca coloque no frontend
const USER_ID = 'eeff0389-5e63-44e8-a79e-a65346a2ab18'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const promote = async () => {
  const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
    app_metadata: { role: 'admin' }
  })

  if (error) {
    console.error('❌ Erro ao atualizar:', error)
  } else {
    console.log('✅ Usuário promovido com sucesso:', data)
  }
}

promote()
