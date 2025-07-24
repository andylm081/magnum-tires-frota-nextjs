import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validação para garantir que as variáveis estão setadas
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('As variáveis de ambiente do Supabase (URL e Service Key) não foram definidas para o cliente de admin.');
}

// Cria o cliente Supabase para uso exclusivo do lado do servidor
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
