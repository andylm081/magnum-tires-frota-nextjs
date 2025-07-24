import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json();
  const { nome_completo, telefone, cpf, cargo } = body;

  const { error } = await supabase
    .from('usuarios_perfil')
    .upsert({
      id: user.id,
      email: user.email,
      nome_completo,
      telefone,
      cpf,
      cargo,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Perfil salvo com sucesso.' });
}
