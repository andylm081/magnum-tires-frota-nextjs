import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Lê as variáveis de ambiente públicas, que são seguras para usar no navegador.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validação para garantir que as variáveis de ambiente foram carregadas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente públicas do Supabase (URL e Anon Key) não foram definidas. Verifique o seu arquivo .env.local');
}

// Cliente Supabase para uso no lado do cliente (navegador).
// Este cliente usa a chave anônima (anon) e respeitará as suas regras de segurança (RLS).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

