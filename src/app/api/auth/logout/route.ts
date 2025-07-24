// src/app/api/auth/logout/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });

  // 1. Encerra a sessão do utilizador no Supabase.
  // Isto invalida o token de acesso e o cookie de sessão.
  await supabase.auth.signOut();

  // 2. Retorna uma resposta de sucesso para o cliente.
  // O redirecionamento para a página de login será tratado pelo componente MainHeader.
  return NextResponse.json({ message: 'Logout bem-sucedido' }, { status: 200 });
}
