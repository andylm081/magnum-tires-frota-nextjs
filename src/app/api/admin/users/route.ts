// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userRole = session.user.user_role;
  if (userRole !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado. Requer privilégios de administrador.' }, { status: 403 });
  }

  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    // Extrai apenas os campos desejados, incluindo user_role
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      user_role: user.user_metadata?.user_role || user.app_metadata?.user_role || null,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Erro na API ao listar utilizadores:", error);
    return NextResponse.json({ error: 'Falha ao buscar a lista de utilizadores.', details: error.message }, { status: 500 });
  }
}
